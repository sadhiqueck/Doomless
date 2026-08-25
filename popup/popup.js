document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');
  const statusMessage = document.getElementById('statusMessage');

  chrome.storage.local.get({ enabled: true }, (res) => {
    masterToggle.checked = res.enabled;
    statusMessage.textContent = res.enabled ? 'Active on supported sites' : 'Focus paused';
  });

  masterToggle.addEventListener('change', () => {
    const isEnabled = masterToggle.checked;
    chrome.storage.local.set({ enabled: isEnabled });
    statusMessage.textContent = isEnabled ? 'Active on supported sites' : 'Focus paused';
  });
});
