const findTweet = (baseEl) => {
  const parent = baseEl.parentElement;
  const tag = parent.tagName.toLowerCase();
  if (tag === 'article') {
    return parent;
  } else if (tag === 'body') {
    return undefined;
  }
  return findTweet(parent);
};

const insertLink = (tweetEl, url) => {
  const img = document.createElement('img');
  img.src = browser.runtime.getURL('./image/video.svg');
  img.alt = 'video';

  const a = document.createElement('a');
  a.href = url;
  a.target = "_blank";
  a.rel = "noopener noreferrer";
  a.append(img);

  const div = document.createElement('div');
  div.classList.add('ff-twmedia');
  div.append(a);

  const parent = tweetEl.children[0];
  parent.insertBefore(div, parent.lastElementChild);
};

browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case "url":
      console.log(message.url);

      const baseEl = document.querySelector(`a[href="${location.pathname}/likes"]`)
      if (baseEl) {
        const tweetEl = findTweet(baseEl);
        if (tweetEl) {
          insertLink(tweetEl, message.url);
        }
      }
      break;
  }
});