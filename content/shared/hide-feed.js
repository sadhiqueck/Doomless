// Shared DOM Feed Hiding Utility
const HideFeed = (() => {
  function injectStyles(cssString, styleId = 'focus-ext-style') {
    let el = document.getElementById(styleId);
    if (!el) {
      el = document.createElement('style');
      el.id = styleId;
      (document.head || document.documentElement).appendChild(el);
    }
    el.textContent = cssString;
  }

  function hide(selectors, styleId) {
    const css = selectors.map(s => `${s} { display: none !important; }`).join('
');
    injectStyles(css, styleId);
  }

  return { injectStyles, hide };
})();

HideFeed.onElementReady = function(selector, callback, timeoutMs = 8000) {
  const el = document.querySelector(selector);
  if (el) { callback(el); return; }
  const obs = new MutationObserver(() => {
    const target = document.querySelector(selector);
    if (target) {
      obs.disconnect();
      callback(target);
    }
  });
  obs.observe(document.documentElement, { childList: true, subtree: true });
  setTimeout(() => obs.disconnect(), timeoutMs);
};
