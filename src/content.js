import styles from './content.scss';

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

  const li = document.createElement('li');
  li.append(a);

  const ul = document.createElement('ul');
  ul.classList.add(styles.list);
  ul.append(li);

  const parent = tweetEl.children[0];
  parent.insertBefore(ul, parent.lastElementChild);
};

browser.runtime.onMessage.addListener(message => {
  switch (message.type) {
    case "ff-twmedia_url":
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
