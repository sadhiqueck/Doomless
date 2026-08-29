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
