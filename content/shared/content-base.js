// Base lifecycle coordinator for all content scripts
const ContentCoordinator = (() => {
  async function init(siteName, mountCallback) {
    const isEnabled = await FocusStorage.isSiteEnabled(siteName);
    if (!isEnabled) return;
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mountCallback);
    } else {
      mountCallback();
    }
  }
  return { init };
})();
