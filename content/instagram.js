// Focus Extension — Instagram Content Script
(async () => {
  const isEnabled = await FocusStorage.isSiteEnabled('instagram');
  if (!isEnabled) return;
  console.log('[Focus Extension] Initializing Instagram blocker...');
})();
