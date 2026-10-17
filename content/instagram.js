// Focus Extension — Instagram Content Script
(function() {
  const SITE = 'instagram';

  async function updateState() {
    if (location.pathname === '/accounts/login/') return;

    const isEnabled = await FocusStorage.isSiteEnabled(SITE);
    const schedOk = await FocusStorage.isScheduleActive();
    const isCooldown = await FocusStorage.isCooldownActive();

    const shouldBlock = isEnabled && schedOk && !isCooldown;

    if (shouldBlock) {
      document.documentElement.classList.add('focus-blocked-instagram');
      pauseFeedVideos();
      const isHome = location.pathname === '/' || location.pathname === '';
      if (isHome) {
        FocusCard.mount(SITE);
      } else {
        FocusCard.unmount();
      }
    } else {
      document.documentElement.classList.remove('focus-blocked-instagram');
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
