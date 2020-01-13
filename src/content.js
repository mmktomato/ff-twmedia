import styles from './content.scss';

const photoLinkPrefix = "https://pbs.twimg.com/media/";

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

const findPhotoOverlay = () => {
  const closeButton = document.querySelector('div[aria-label="Close"]');
  return closeButton && closeButton.parentNode.parentNode;
};

const isPhotoNode = (node) => {
  return node.tagName.toLowerCase() === "img" && node.src.startsWith(photoLinkPrefix);
};

const replaceToOriginalPhoto = (url) => {
  return url.replace(/name=[^&]+/, "name=orig");
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

    case "ff-twmedia_photo":
      const images = document.querySelectorAll(`img[src^="${photoLinkPrefix}"]`);
      if (images && 0 < images.length) {
        Array.from(images).forEach(image => {
          image.src = replaceToOriginalPhoto(image.src);
        });
      } else {
        const observer = new MutationObserver((mutations, _observer) => {
          mutations.forEach(mutation => {
            Array.from(mutation.addedNodes).forEach(addedNode => {
              if (isPhotoNode(addedNode)) {
                addedNode.src = replaceToOriginalPhoto(addedNode.src);
                _observer.disconnect();
              }
            });
          });
        });
        const target = findPhotoOverlay() || document.querySelector('body');
        observer.observe(target, { childList: true, subtree: true });
      }
      break;
  }
});
