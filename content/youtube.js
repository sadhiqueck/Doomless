// Focus Extension — YouTube Content Script
(async () => {
  console.log('[Focus Extension] Initializing on YouTube...');
})();

const YT_FEED_SELECTORS = [
  'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  'ytd-browse[page-subtype="home"] #contents'
];

let lastUrl = location.href;
const observer = new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    console.log('[Focus Extension] YouTube route changed:', lastUrl);
  }
});
observer.observe(document.documentElement, { subtree: true, childList: true });

function injectPlaceholder() {
  const container = document.querySelector('ytd-browse[page-subtype="home"]');
  if (container && !document.querySelector('.focus-yt-placeholder')) {
    const ph = document.createElement('div');
    ph.className = 'focus-yt-placeholder';
    container.prepend(ph);
  }
}
window.addEventListener('load', injectPlaceholder);

// Reinforce with HideFeed utility
HideFeed.hide(YT_FEED_SELECTORS, 'focus-yt-rules');
