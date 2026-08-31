// Focus Extension — Instagram Content Script
(async () => {
  const isEnabled = await FocusStorage.isSiteEnabled('instagram');
  if (!isEnabled) return;
  console.log('[Focus Extension] Initializing Instagram blocker...');
})();

let lastPath = location.pathname;
const igObserver = new MutationObserver(() => {
  if (location.pathname !== lastPath) {
    lastPath = location.pathname;
    console.log('[Focus Extension] Instagram path change:', lastPath);
  }
});
igObserver.observe(document.body, { childList: true, subtree: true });
