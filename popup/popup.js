document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');
  const siteYT = document.getElementById('siteYT');
  const siteIG = document.getElementById('siteIG');
  const siteTT = document.getElementById('siteTT');
  const quickInput = document.getElementById('popupQuickInput');
  const quickBtn = document.getElementById('btnQuickAdd');
  const countEl = document.getElementById('popupTaskCount');
  const streakEl = document.getElementById('streakBadge');

  async function refresh() {
    const data = await FocusStorage.get();
    masterToggle.checked = data.enabled;
    siteYT.checked = data.sites.youtube;
    siteIG.checked = data.sites.instagram;
    siteTT.checked = data.sites.tiktok;

    const tasks = data.tasks || [];
    const completed = data.tasksCompleted || [];
    const activeCount = tasks.filter(t => !completed.includes(t.id)).length;
    countEl.textContent = `${activeCount} active task${activeCount === 1 ? '' : 's'}`;
    streakEl.textContent = `🔥 ${data.streak || 0} streak`;
  }
  await refresh();

  quickBtn.addEventListener('click', async () => {
    const val = quickInput.value.trim();
    if (!val) return;
    await FocusStorage.addTask(val);
    quickInput.value = '';
    await refresh();
  });

  quickInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') quickBtn.click();
  });

  document.getElementById('linkOptions').addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
