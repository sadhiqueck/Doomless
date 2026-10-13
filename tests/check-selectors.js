// Selector regression test runner
// Can be executed directly in browser console on target sites
(() => {
  const SITES = {
    'youtube.com': [
      'ytd-browse[page-subtype="home"] ytd-rich-grid-renderer',
      'ytd-rich-section-renderer',
      'ytd-reel-shelf-renderer'
    ],
    'instagram.com': [
      'main[role="main"] article',
      '[data-testid="virtual-list-scroll-crumb"]',
      'main[role="main"] ._ac7v'
    ],
    'tiktok.com': [
      '[data-e2e="recommend-list-item-container"]',
      '[data-e2e="follow-item-container"]'
    ]
  };

  const currentHost = location.hostname;
  for (const [domain, sels] of Object.entries(SITES)) {
    if (currentHost.includes(domain)) {
      console.group(`[Focus Extension] Selector Check for ${domain}`);
      sels.forEach(sel => {
        const found = Boolean(document.querySelector(sel));
        console.log(found ? `✅ FOUND: ${sel}` : `⚠️ MISSING: ${sel}`);
      });
      console.groupEnd();
      return;
    }
  }
  console.log('[Focus Extension] Host not recognized for test suite:', currentHost);
})();
