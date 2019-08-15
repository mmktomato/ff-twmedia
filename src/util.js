const tweetPattern = new RegExp('https://twitter\.com/.+/status\/(.+)');

export const getTweetId = (url) => {
  const m = url.match(tweetPattern);

  return m.length === 2 && m[1];
};
