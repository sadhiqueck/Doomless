// Focus Extension — TikTok Content Script
(async () => {
  const isEnabled = await FocusStorage.isSiteEnabled('tiktok');
  if (!isEnabled) return;
  console.log('[Focus Extension] Initializing TikTok blocker...');
})();

let lastTtPath = location.pathname;
const ttObserver = new MutationObserver(() => {
  if (location.pathname !== lastTtPath) {
    lastTtPath = location.pathname;
    pauseTtVideos();
  }
});
ttObserver.observe(document.body, { childList: true, subtree: true });

function pauseTtVideos() {
  document.querySelectorAll('video').forEach(v => {
    try { v.pause(); } catch(e) {}
  });
}
document.addEventListener('DOMContentLoaded', pauseTtVideos);

if (location.pathname.startsWith('/login')) {
  console.log('[Focus Extension] TikTok login view active.');
}

window.addEventListener('load', () => {
  FocusCard.mount('tiktok');
});
