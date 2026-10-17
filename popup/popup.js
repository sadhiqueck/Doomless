// Focus Extension — Popup Controller
document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');
  const siteYT = document.getElementById('siteYT');
  const siteIG = document.getElementById('siteIG');
  const siteTT = document.getElementById('siteTT');
  const quickInput = document.getElementById('popupQuickInput');
  const quickBtn = document.getElementById('btnQuickAdd');
  const countEl = document.getElementById('popupTaskCount');
  const streakEl = document.getElementById('streakBadge');
  const linkOptions = document.getElementById('linkOptions');

  async function refresh() {
    const data = await FocusStorage.get();
    masterToggle.checked = data.enabled !== false;
    siteYT.checked = data.sites?.youtube !== false;
    siteIG.checked = data.sites?.instagram !== false;
    siteTT.checked = data.sites?.tiktok !== false;

    const tasks = data.tasks || FocusStorage.DEFAULTS.tasks;
    const completed = data.tasksCompleted || [];
    const activeCount = tasks.filter(t => !completed.includes(t.id)).length;
    countEl.textContent = `${activeCount} active task${activeCount === 1 ? '' : 's'}`;
    streakEl.textContent = `🔥 ${data.streak || 0} streak`;
  }

  await refresh();

  // Save changes on toggle click
  masterToggle.addEventListener('change', async () => {
    await FocusStorage.set({ enabled: masterToggle.checked });
  });

  async function updateSites() {
    const data = await FocusStorage.get();
    const sites = {
      youtube: siteYT.checked,
      instagram: siteIG.checked,
      tiktok: siteTT.checked
    };
    await FocusStorage.set({ sites });
  }

  siteYT.addEventListener('change', updateSites);
  siteIG.addEventListener('change', updateSites);
  siteTT.addEventListener('change', updateSites);

  // Quick add task
  async function handleQuickAdd() {
    const val = quickInput.value.trim();
    if (!val) return;
    await FocusStorage.addTask(val);
    quickInput.value = '';
    await refresh();
  }

  quickBtn.addEventListener('click', handleQuickAdd);
  quickInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleQuickAdd();
  });

  linkOptions?.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.runtime.openOptionsPage();
  });
});
