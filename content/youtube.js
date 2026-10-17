// Focus Extension — YouTube Content Script
(function() {
  const SITE = 'youtube';
  let shortsInterval = null;

  function restoreYouTubeFeed() {
    // 1. Remove feed block class immediately
    document.documentElement.classList.remove('focus-block-yt-feed');

    // 2. Ensure rich grid renderer is displayed and visible
    const grid = document.querySelector('ytd-rich-grid-renderer');
    if (grid) {
      grid.style.removeProperty('display');
      grid.style.removeProperty('visibility');
      grid.style.removeProperty('height');
    }

    const contents = document.querySelector('ytd-rich-grid-renderer #contents');
    if (contents) {
      contents.style.removeProperty('display');
      contents.style.removeProperty('visibility');
    }

    // 3. Dispatch standard window events so YouTube's iron-list virtual scroll recalculates
    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    try {
      window.dispatchEvent(new CustomEvent('iron-resize'));
    } catch(e) {}

    // Secondary dispatch after next frame to handle deferred virtual scroll calculations
    requestAnimationFrame(() => {
      window.dispatchEvent(new Event('resize'));
    });
  }

  function pauseAndMuteShorts() {
    document.querySelectorAll('ytd-shorts video, #shorts-container video, #shorts-player video, video').forEach(v => {
      try {
        if (!v.paused) {
          v.pause();
        }
        v.muted = true;
        v.currentTime = 0;
      } catch(e) {}
    });
  }

  // Intercept click on any Shorts link before YouTube SPA navigation begins
  document.addEventListener('click', async (e) => {
    try {
      const isEnabled = await FocusStorage.isSiteEnabled(SITE);
      const blockShorts = isEnabled && (await FocusStorage.isFeatureBlocked(SITE, 'shorts'));
      if (!blockShorts) return;

      const shortsLink = e.target.closest(
        'a[href^="/shorts"], a[href*="/shorts/"], [aria-label*="Shorts" i], [title*="Shorts" i], ytd-reel-shelf-renderer a, ytd-rich-shelf-renderer[is-shorts] a, ytd-guide-entry-renderer:has(a[href^="/shorts"]), ytd-mini-guide-entry-renderer:has(a[href^="/shorts"]), ytd-guide-entry-renderer a[title="Shorts"]'
      );
      if (shortsLink) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        pauseAndMuteShorts();
        FocusCard.mount(SITE, { isShorts: true });
      }
    } catch(err) {
      console.warn('[Doomless] Shorts click check error:', err);
    }
  }, true);

  async function updateState() {
    if (location.hostname === 'm.youtube.com') return;

    try {
      const isEnabled = await FocusStorage.isSiteEnabled(SITE);
      const schedOk = await FocusStorage.isScheduleActive();
      const isCooldown = await FocusStorage.isCooldownActive();

      const shouldBlock = isEnabled && schedOk && !isCooldown;

      const blockFeed = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'feed'));
      const blockShorts = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'shorts'));
      const blockRecs = shouldBlock && (await FocusStorage.isFeatureBlocked(SITE, 'recommendations'));

      document.documentElement.classList.toggle('focus-block-yt-feed', Boolean(blockFeed));
      document.documentElement.classList.toggle('focus-block-yt-shorts', Boolean(blockShorts));
      document.documentElement.classList.toggle('focus-block-yt-recommendations', Boolean(blockRecs));

      const isHome = location.pathname === '/' || location.pathname === '';
      const isShortsView = location.pathname.startsWith('/shorts');

      if (isShortsView && blockShorts) {
        pauseAndMuteShorts();
        if (!shortsInterval) {
          shortsInterval = setInterval(() => {
            if (location.pathname.startsWith('/shorts')) {
              pauseAndMuteShorts();
            } else {
              clearInterval(shortsInterval);
              shortsInterval = null;
            }
          }, 300);
        }
      } else {
        if (shortsInterval) {
          clearInterval(shortsInterval);
          shortsInterval = null;
        }
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
    } catch(err) {
      console.error('[Doomless] updateState failed:', err);
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
  ['play', 'playing', 'timeupdate'].forEach(evtType => {
    document.addEventListener(evtType, async (e) => {
      try {
        if (location.pathname.startsWith('/shorts')) {
          const isEnabled = await FocusStorage.isSiteEnabled(SITE);
          const blockShorts = isEnabled && (await FocusStorage.isFeatureBlocked(SITE, 'shorts'));
          if (blockShorts && e.target && e.target.tagName === 'VIDEO') {
            e.target.pause();
            e.target.muted = true;
          }
        }
      } catch(err) {}
    }, true);
  });

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
