import { getTweetId } from './util.js';

browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
  const tweetId = getTweetId(tabs[0].url);
  if (!tweetId) {
    return;
  }

  const listener = (details) => {
    console.log(details.url);
    if (details.url.startsWith(`https://api.twitter.com/2/timeline/conversation/${tweetId}.json`)) {
      const decoder = new TextDecoder("utf-8");
      const filter = browser.webRequest.filterResponseData(details.requestId);

      filter.ondata = event => {
        const content = decoder.decode(event.data, { stream: true });
        document.body.innerText = content;

        // filter.write(event.data);
        filter.disconnect();
      };
    }
  };

  browser.webRequest.onBeforeRequest.addListener(
    listener,
    { urls: ["https://api.twitter.com/*", "https://twitter.com/*"] },
    ["blocking"]
  );
});
