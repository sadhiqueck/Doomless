// Focus Extension — YouTube Content Script
(function() {
  const SITE = 'youtube';

  function restoreYouTubeFeed() {
    // 1. Remove feed block class immediately
    document.documentElement.classList.remove('focus-block-yt-feed');

    // 2. Ensure rich grid renderer is displayed
    const grid = document.querySelector('ytd-rich-grid-renderer');
    if (grid) {
      grid.style.removeProperty('display');
      grid.style.removeProperty('visibility');
    }

    // 3. Dispatch standard window events so YouTube's iron-list virtual scroll recalculates
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
  }

  function pauseAndMuteShorts() {
    document.querySelectorAll('ytd-shorts video, #shorts-container video, video').forEach(v => {
      try {
        v.pause();
        v.muted = true;
        v.currentTime = 0;
      } catch(e) {}
    });
  }

  // Intercept click on any Shorts link before YouTube SPA navigation begins
  document.addEventListener('click', async (e) => {
    const isEnabled = await FocusStorage.isSiteEnabled(SITE);
    const blockShorts = isEnabled && (await FocusStorage.isFeatureBlocked(SITE, 'shorts'));
    if (!blockShorts) return;

    const shortsLink = e.target.closest(
      'a[href^="/shorts"], a[href*="/shorts/"], [aria-label*="Shorts"], [title*="Shorts"], ytd-reel-shelf-renderer a, ytd-rich-shelf-renderer[is-shorts] a'
    );
    if (shortsLink) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      pauseAndMuteShorts();
      FocusCard.mount(SITE, { isShorts: true });
    }
  }, true);

  async function updateState() {
    if (location.hostname === 'm.youtube.com') return;

    const isEnabled = await FocusStorage.isSiteEnabled(SITE);
    const schedOk = await FocusStorage.isScheduleActive();
    const isCooldown = await FocusStorage.isCooldownActive();

    const shouldBlock = isEnabled && schedOk && !isCooldown;

    const blockFeed = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'feed'));
    const blockShorts = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'shorts'));
    const blockRecs = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'recommendations'));

    document.documentElement.classList.toggle('focus-block-yt-feed', blockFeed);
    document.documentElement.classList.toggle('focus-block-yt-shorts', blockShorts);
    document.documentElement.classList.toggle('focus-block-yt-recommendations', blockRecs);

    const isHome = location.pathname === '/' || location.pathname === '';
    const isShortsView = location.pathname.startsWith('/shorts');

    if (isShortsView && blockShorts) {
      pauseAndMuteShorts();
    }

    const shouldMountCard = shouldBlock && ((isHome && blockFeed) || (isShortsView && blockShorts));
    if (shouldMountCard) {
      FocusCard.mount(SITE, { isShorts: isShortsView });
    } else {
      FocusCard.unmount();
      if (!blockFeed) {
        restoreYouTubeFeed();
      }
    }
  }

  updateState();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateState);
  }

  window.addEventListener('yt-navigate-finish', updateState);
  window.addEventListener('yt-page-data-updated', updateState);
  window.addEventListener('popstate', updateState);

  // Monitor playing video on Shorts and keep paused
  document.addEventListener('play', async (e) => {
    if (location.pathname.startsWith('/shorts')) {
      const isEnabled = await FocusStorage.isSiteEnabled(SITE);
      const blockShorts = isEnabled && (await FocusStorage.isFeatureBlocked(SITE, 'shorts'));
      if (blockShorts && e.target && e.target.tagName === 'VIDEO') {
        e.target.pause();
        e.target.muted = true;
      }
    }
  }, true);

  let lastUrl = location.href;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      updateState();
    }
  });
  observer.observe(document.documentElement, { subtree: true, childList: true });

  // Listen for storage changes
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
