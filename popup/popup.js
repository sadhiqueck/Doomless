// Focus Extension — Popup Controller (Cal.com Light Minimalist)
document.addEventListener('DOMContentLoaded', async () => {
  const masterToggle = document.getElementById('masterToggle');

  // Platform master switches
  const siteYT = document.getElementById('siteYT');
  const siteIG = document.getElementById('siteIG');
  const siteTT = document.getElementById('siteTT');

  // Sub-option groups
  const ytSubOptions = document.getElementById('ytSubOptions');
  const igSubOptions = document.getElementById('igSubOptions');
  const ttSubOptions = document.getElementById('ttSubOptions');

  // Granular feature toggles
  const ytOptFeed = document.getElementById('ytOptFeed');
  const ytOptShorts = document.getElementById('ytOptShorts');
  const ytOptRecs = document.getElementById('ytOptRecs');

  const igOptFeed = document.getElementById('igOptFeed');
  const igOptReels = document.getElementById('igOptReels');
  const igOptExplore = document.getElementById('igOptExplore');

  const ttOptFyp = document.getElementById('ttOptFyp');
  const ttOptFollowing = document.getElementById('ttOptFollowing');
  const ttOptLive = document.getElementById('ttOptLive');

  // Inputs and labels
  const quickInput = document.getElementById('popupQuickInput');
  const quickBtn = document.getElementById('btnQuickAdd');
  const countEl = document.getElementById('popupTaskCount');
  const streakEl = document.getElementById('streakBadge');
  const linkOptions = document.getElementById('linkOptions');

  function updateSubOptionsVisuals() {
    ytSubOptions.classList.toggle('is-disabled', !siteYT.checked);
    igSubOptions.classList.toggle('is-disabled', !siteIG.checked);
    ttSubOptions.classList.toggle('is-disabled', !siteTT.checked);
  }

  async function refresh() {
    const data = await FocusStorage.get();
    masterToggle.checked = data.enabled !== false;

    // YouTube
    const yt = typeof data.sites?.youtube === 'object'
      ? data.sites.youtube
      : { enabled: data.sites?.youtube !== false, feed: true, shorts: true, recommendations: true };
    siteYT.checked = yt.enabled !== false;
    ytOptFeed.checked = yt.feed !== false;
    ytOptShorts.checked = yt.shorts !== false;
    ytOptRecs.checked = yt.recommendations !== false;

    // Instagram
    const ig = typeof data.sites?.instagram === 'object'
      ? data.sites.instagram
      : { enabled: data.sites?.instagram !== false, feed: true, reels: true, explore: true };
    siteIG.checked = ig.enabled !== false;
    igOptFeed.checked = ig.feed !== false;
    igOptReels.checked = ig.reels !== false;
    igOptExplore.checked = ig.explore !== false;

    // TikTok
    const tt = typeof data.sites?.tiktok === 'object'
      ? data.sites.tiktok
      : { enabled: data.sites?.tiktok !== false, fyp: true, following: true, live: true };
    siteTT.checked = tt.enabled !== false;
    ttOptFyp.checked = tt.fyp !== false;
    ttOptFollowing.checked = tt.following !== false;
    ttOptLive.checked = tt.live !== false;

    updateSubOptionsVisuals();

    // Stats
    const tasks = data.tasks || FocusStorage.DEFAULTS.tasks;
    const completed = data.tasksCompleted || [];
    const activeCount = tasks.filter(t => !completed.includes(t.id)).length;
    countEl.textContent = `${activeCount} active task${activeCount === 1 ? '' : 's'}`;
    streakEl.textContent = `🔥 ${data.streak || 0} streak`;
  }

  await refresh();

  // Save changes on master toggle
  masterToggle.addEventListener('change', async () => {
    await FocusStorage.set({ enabled: masterToggle.checked });
  });

  // Save changes on site and sub-options
  async function saveSitesFromUI() {
    updateSubOptionsVisuals();
    const sites = {
      youtube: {
        enabled: siteYT.checked,
        feed: ytOptFeed.checked,
        shorts: ytOptShorts.checked,
        recommendations: ytOptRecs.checked
      },
      instagram: {
        enabled: siteIG.checked,
        feed: igOptFeed.checked,
        reels: igOptReels.checked,
        explore: igOptExplore.checked
      },
      tiktok: {
        enabled: siteTT.checked,
        fyp: ttOptFyp.checked,
        following: ttOptFollowing.checked,
        live: ttOptLive.checked
      }
    };
    await FocusStorage.set({ sites });
  }

  // Bind site toggles
  siteYT.addEventListener('change', saveSitesFromUI);
  ytOptFeed.addEventListener('change', saveSitesFromUI);
  ytOptShorts.addEventListener('change', saveSitesFromUI);
  ytOptRecs.addEventListener('change', saveSitesFromUI);

  siteIG.addEventListener('change', saveSitesFromUI);
  igOptFeed.addEventListener('change', saveSitesFromUI);
  igOptReels.addEventListener('change', saveSitesFromUI);
  igOptExplore.addEventListener('change', saveSitesFromUI);

  siteTT.addEventListener('change', saveSitesFromUI);
  ttOptFyp.addEventListener('change', saveSitesFromUI);
  ttOptFollowing.addEventListener('change', saveSitesFromUI);
  ttOptLive.addEventListener('change', saveSitesFromUI);

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
