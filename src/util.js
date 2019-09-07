const tweetPattern = new RegExp('https://twitter\.com/.+/status\/(.+)');

export const getTweetId = (url) => {
  const m = url.match(tweetPattern);

  return m.length === 2 && m[1];
};

export const getMediaArray = (content, tweetId) => {
  return content.globalObjects
    && content.globalObjects.tweets
    && content.globalObjects.tweets[tweetId]
    && content.globalObjects.tweets[tweetId].extended_entities
    && content.globalObjects.tweets[tweetId].extended_entities.media;
};

export const getVideoUrl = (media) => {
  const variants = (media.video_info && media.video_info.variants) || [];
  const largest = variants
    .filter(v => v.content_type === 'video/mp4')
    .reduce((acc, cur) => {
      if (acc.bitrate < cur.bitrate) {
        acc = cur;
      }
      return acc;
    }, { bitrate: 0 });

  return largest.url;
};

export const asyncSleep = (ms) => {
  return new Promise((resolve, _) => {
    setTimeout(() => resolve(), ms);
  });
};
