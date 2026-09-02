// Focus Extension — TikTok Content Script
(async () => {
  const isEnabled = await FocusStorage.isSiteEnabled('tiktok');
  if (!isEnabled) return;
  console.log('[Focus Extension] Initializing TikTok blocker...');
})();
