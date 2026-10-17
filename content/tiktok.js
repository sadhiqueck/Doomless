// Focus Extension — TikTok Content Script
(function() {
  const SITE = 'tiktok';

  async function updateState() {
    if (location.pathname.startsWith('/login')) return;

    try {
      const isEnabled = await FocusStorage.isSiteEnabled(SITE);
      const schedOk = await FocusStorage.isScheduleActive();
      const isCooldown = await FocusStorage.isCooldownActive();

      const shouldBlock = isEnabled && schedOk && !isCooldown;

      const blockFyp = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'fyp'));
      const blockFollowing = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'following'));
      const blockLive = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'live'));

      document.documentElement.classList.toggle('focus-block-tt-fyp', Boolean(blockFyp));
      document.documentElement.classList.toggle('focus-block-tt-following', Boolean(blockFollowing));
      document.documentElement.classList.toggle('focus-block-tt-live', Boolean(blockLive));

      const isHome = location.pathname === '/' || location.pathname === '';
      const isFollowing = location.pathname.startsWith('/following');
      const isLive = location.pathname.startsWith('/live');

      if (shouldBlock && (isHome && blockFyp || isFollowing && blockFollowing || isLive && blockLive)) {
        pauseTtVideos();
        FocusCard.mount(SITE);
      } else {
        FocusCard.unmount();
      }
    } catch(err) {
      console.error('[Doomless] TikTok updateState failed:', err);
    }
  }

  function pauseTtVideos() {
    document.querySelectorAll('video').forEach(v => {
      try { v.pause(); } catch(e) {}
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

  // Listen for direct tab messages from popup
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg) => {
      if (msg && msg.type === 'DOOMLESS_STATE_CHANGED') {
        updateState();
      }
    });
  }
})();
