// Focus Extension — YouTube Content Script
(async () => {
  console.log('[Focus Extension] Initializing on YouTube...');
})();

const YT_FEED_SELECTORS = [
  'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
  'ytd-browse[page-subtype="home"] #contents'
];
