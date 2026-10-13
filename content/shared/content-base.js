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

ContentCoordinator.isSessionValid = function() {
  if (document.querySelector('[data-is-error="true"]')) return false;
  if (location.pathname.includes('/auth') || location.pathname.includes('/checkpoint')) return false;
  return true;
};
