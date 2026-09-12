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

function pauseFeedVideos() {
  document.querySelectorAll('video').forEach(v => {
    // Keep Stories dialog active
    if (!v.closest('[role="dialog"]') && !v.closest('[role="presentation"]')) {
      try { v.pause(); } catch(e) {}
    }
  });
}
window.addEventListener('load', pauseFeedVideos);

if (location.pathname === '/accounts/login/') {
  console.log('[Focus Extension] Login screen detected, skipping block.');
}

window.addEventListener('load', () => {
  FocusCard.mount('instagram');
});
