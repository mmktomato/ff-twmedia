import { getTweetId, getMediaArray, getVideoUrl, asyncSleep } from './util.js';

browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
  const reload = document.querySelector('#reload');
  reload.addEventListener('click', () => browser.tabs.reload(tabs[0].id));

  const tweetId = getTweetId(tabs[0].url);
  if (!tweetId) {
    return;
  }

  const listener = (details) => {
    // console.log(details.url);
    if (details.url.startsWith(`https://api.twitter.com/2/timeline/conversation/${tweetId}.json`)) {
      const decoder = new TextDecoder("utf-8");
      const filter = browser.webRequest.filterResponseData(details.requestId);

      filter.ondata = async (event) => {
        await asyncSleep(100);
        const isFinal = filter.status === 'finishedtransferringdata';
        const content = decoder.decode(event.data, { stream: !isFinal });
        if (!isFinal) {
          return;
        }

        const mediaArr = getMediaArray(JSON.parse(content), tweetId);
        if (mediaArr) {
          clearVideos();
          hideReloadMessage();

          mediaArr
            .filter(media => media.type === 'video')
            .forEach(media => {
              const videoUrl = getVideoUrl(media);
              if (videoUrl) {
                putVideo(videoUrl);
              }
            });
        }

        filter.write(event.data);
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

const hideReloadMessage = () => {
  document.querySelector('#reload').style.display = 'none';
};

const clearVideos = () => {
  const liArr = document.querySelectorAll('#videos > li');
  if (liArr) {
    liArr.forEach(li => li.remove());
  }
};

const putVideo = (url) => {
  const video = document.createElement('video');
  video.src = url;
  video.controls = true;
  const li = document.createElement('li');
  li.appendChild(video);
  const ul = document.querySelector('#videos');
  ul.appendChild(li);
}
