import { getTweetId, getMediaArray, getVideoUrl, asyncSleep } from './util.js';

// {
//   windowId: {
//     tabId: listener
//   }
// }
const listeners = {};

const createListener = (tabId, tweetId) => {
  return (details) => {
    // console.log(details.url);
    if (details.url.startsWith(`https://api.twitter.com/2/timeline/conversation/${tweetId}.json`)) {
      const decoder = new TextDecoder("utf-8");
      const filter = browser.webRequest.filterResponseData(details.requestId);

      filter.ondata = async (event) => {
        filter.write(event.data);

        await asyncSleep(100);
        const isFinal = filter.status === 'finishedtransferringdata';
        const content = decoder.decode(event.data, { stream: !isFinal });
        if (!isFinal) {
          return;
        }

        try {
          const mediaArr = getMediaArray(JSON.parse(content), tweetId);
          if (mediaArr) {
            mediaArr
              .filter(media => media.type === 'video')
              .forEach(media => {
                const videoUrl = getVideoUrl(media);
                if (videoUrl) {
                  sendToContent(tabId, videoUrl);
                }
              });
          }
        } catch (e) {
          console.log(e);
        } finally {
          filter.disconnect();

          // TODO: Should I call `removeListener`?
        }
      };
    }
  };
};

const addListener = (listener, windowId, tabId) => {
  listeners[windowId] = listeners[windowId] || {};
  listeners[windowId][tabId] = listener;

  browser.webRequest.onBeforeRequest.addListener(
    listener,
    { urls: ["https://api.twitter.com/*", "https://twitter.com/*"] },
    ["blocking"]
  );
};

const removeListener = (windowId, tabId) => {
  if (listeners[windowId] && listeners[windowId][tabId]) {
    const listener = listeners[windowId][tabId];
    browser.webRequest.onBeforeRequest.removeListener(listener);
    listeners[windowId][tabId] = undefined;
  }
};

const sendToContent = (tabId, url) => {
  browser.tabs.sendMessage(tabId, { type: "url", url });
}

browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log(`${tabId} / ${changeInfo.url} / ${tab.url}`);
  if (changeInfo.url) {
    removeListener(tab.windowId, tabId);

    const tweetId = getTweetId(changeInfo.url);
    if (tweetId) {
      const listener = createListener(tabId, tweetId);
      addListener(listener, tab.windowId, tabId);
    }
  }
}, {
  urls: ["https://twitter.com/*"]
});

browser.tabs.onRemoved.addListener((tabId, removeInfo) => {
  removeListener(removeInfo.windowId, tabId);
});
