// Focus Extension — Instagram Content Script
(function() {
  const SITE = 'instagram';

  async function updateState() {
    if (location.pathname === '/accounts/login/') return;

    const isEnabled = await FocusStorage.isSiteEnabled(SITE);
    const schedOk = await FocusStorage.isScheduleActive();
    const isCooldown = await FocusStorage.isCooldownActive();

    const shouldBlock = isEnabled && schedOk && !isCooldown;

    const blockFeed = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'feed'));
    const blockReels = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'reels'));
    const blockExplore = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'explore'));

    document.documentElement.classList.toggle('focus-block-ig-feed', blockFeed);
    document.documentElement.classList.toggle('focus-block-ig-reels', blockReels);
    document.documentElement.classList.toggle('focus-block-ig-explore', blockExplore);

    const isHome = location.pathname === '/' || location.pathname === '';
    const isReels = location.pathname.startsWith('/reels');
    const isExplore = location.pathname.startsWith('/explore');

    if (shouldBlock && (isHome && blockFeed || isReels && blockReels || isExplore && blockExplore)) {
      pauseFeedVideos();
      FocusCard.mount(SITE);
    } else {
      FocusCard.unmount();
    }
  }

  function pauseFeedVideos() {
    document.querySelectorAll('video').forEach(v => {
      if (!v.closest('[role="dialog"]') && !v.closest('[role="presentation"]')) {
        try { v.pause(); } catch(e) {}
      }
    });
  }

  updateState();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateState);
  }

  window.addEventListener('popstate', updateState);

  let lastPath = location.pathname;
  const observer = new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      updateState();
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true });

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        updateState();
      }
    });
  }
})();
