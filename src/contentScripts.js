// TODO: consider to move to utils.
const findTweet = (baseEl) => {
  const parent = base.parentElement;
  const tag = parent.tagName.toLowerCase();
  if (tag === 'article') {
    return parent;
  } else if (tag === 'body') {
    return undefined;
  }
  return findTweet(parent);
};

// TODO: consider to move to utils.
const insertLink = (tweetEl, url) => {
  const a = document.createElement('a');
  a.href = url;
  a.append(document.createTextNode(url))

  const lastEl = tweetEl.lastElementChild;
  tweetEl.insertBefore(a, lastEl);
};

// const register = () => {
//   const tweetId = getTweetId(location.href);
//   console.log(tweetId);
// 
//   if (tweetId) {
//     browser.runtime.sendMessage({ type: "register", tweetId });
//   }
// };
