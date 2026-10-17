// Focus Extension — Options Page Controller (Cal.com Light Minimalist)
document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('taskTextarea');
  const preview = document.getElementById('taskPreviewContainer');

  // Platform master switches
  const optYT = document.getElementById('optYT');
  const optIG = document.getElementById('optIG');
  const optTT = document.getElementById('optTT');

  // Sub-grid elements
  const ytGrid = document.getElementById('ytGrid');
  const igGrid = document.getElementById('igGrid');
  const ttGrid = document.getElementById('ttGrid');

  // Granular feature toggles
  const optYTFeed = document.getElementById('optYTFeed');
  const optYTShorts = document.getElementById('optYTShorts');
  const optYTRecs = document.getElementById('optYTRecs');

  const optIGFeed = document.getElementById('optIGFeed');
  const optIGReels = document.getElementById('optIGReels');
  const optIGExplore = document.getElementById('optIGExplore');

  const optTTFyp = document.getElementById('optTTFyp');
  const optTTFollowing = document.getElementById('optTTFollowing');
  const optTTLive = document.getElementById('optTTLive');

  // Intensity, Schedule & Theme
  const intSoft = document.getElementById('intSoft');
  const intHard = document.getElementById('intHard');
  const optSchedEnable = document.getElementById('optSchedEnable');
  const schedDetails = document.getElementById('schedDetails');
  const schedStart = document.getElementById('schedStart');
  const schedEnd = document.getElementById('schedEnd');
  const fileInput = document.getElementById('fileInput');
  const btnFetchGithub = document.getElementById('btnFetchGithub');
  const btnSaveAll = document.getElementById('btnSaveAll');
  const toast = document.getElementById('toast');

  let selectedTheme = 'white';

  function updateVisualStates() {
    ytGrid.classList.toggle('is-disabled', !optYT.checked);
    igGrid.classList.toggle('is-disabled', !optIG.checked);
    ttGrid.classList.toggle('is-disabled', !optTT.checked);
  }

  // 1. Load initial settings from chrome.storage
  const data = await FocusStorage.get();
  const tasks = data.tasks || FocusStorage.DEFAULTS.tasks;
  textarea.value = tasks.map(t => t.title).join('\n');
  renderPreview(parseLines(textarea.value));

  // YouTube settings
  const yt = typeof data.sites?.youtube === 'object'
    ? data.sites.youtube
    : { enabled: data.sites?.youtube !== false, feed: true, shorts: true, recommendations: true };
  optYT.checked = yt.enabled !== false;
  optYTFeed.checked = yt.feed !== false;
  optYTShorts.checked = yt.shorts !== false;
  optYTRecs.checked = yt.recommendations !== false;

  // Instagram settings
  const ig = typeof data.sites?.instagram === 'object'
    ? data.sites.instagram
    : { enabled: data.sites?.instagram !== false, feed: true, reels: true, explore: true };
  optIG.checked = ig.enabled !== false;
  optIGFeed.checked = ig.feed !== false;
  optIGReels.checked = ig.reels !== false;
  optIGExplore.checked = ig.explore !== false;

  // TikTok settings
  const tt = typeof data.sites?.tiktok === 'object'
    ? data.sites.tiktok
    : { enabled: data.sites?.tiktok !== false, fyp: true, following: true, live: true };
  optTT.checked = tt.enabled !== false;
  optTTFyp.checked = tt.fyp !== false;
  optTTFollowing.checked = tt.following !== false;
  optTTLive.checked = tt.live !== false;

  updateVisualStates();

  optYT.addEventListener('change', updateVisualStates);
  optIG.addEventListener('change', updateVisualStates);
  optTT.addEventListener('change', updateVisualStates);

  // Intensity
  if (data.intensity === 'hard') {
    intHard.checked = true;
  } else {
    intSoft.checked = true;
  }

  // Schedule
  const sched = data.schedule || { enabled: false, startHour: 9, endHour: 18 };
  optSchedEnable.checked = Boolean(sched.enabled);
  schedDetails.style.display = sched.enabled ? 'block' : 'none';
  schedStart.value = sched.startHour ?? 9;
  schedEnd.value = sched.endHour ?? 18;

  // Theme
  selectedTheme = data.theme || 'white';
  document.querySelectorAll('.theme-swatch').forEach(swatch => {
    swatch.classList.toggle('active', swatch.dataset.theme === selectedTheme);
    swatch.addEventListener('click', () => {
      document.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove('active'));
      swatch.classList.add('active');
      selectedTheme = swatch.dataset.theme;
    });
  });

  // 2. Interactive event listeners
  textarea.addEventListener('input', () => {
    renderPreview(parseLines(textarea.value));
  });

  optSchedEnable.addEventListener('change', () => {
    schedDetails.style.display = optSchedEnable.checked ? 'block' : 'none';
  });

  // Markdown file upload
  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text();
    textarea.value = text;
    renderPreview(parseLines(textarea.value));
    showToast('✓ Markdown file loaded');
  });

  // GitHub Issues import
  btnFetchGithub?.addEventListener('click', async () => {
    const repoInput = document.getElementById('githubRepoInput').value.trim();
    const cleanRepo = repoInput.replace(/^https?:\/\/github\.com\//, '');
    const match = cleanRepo.match(/^([^\/]+)\/([^\/]+)/);
    if (!match) {
      alert('Please enter a valid format: owner/repository (e.g. facebook/react)');
      return;
    }
    const [, owner, repo] = match;
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=15`);
      if (res.status === 403) {
        alert('GitHub API rate limit reached. Please try again later.');
        return;
      }
      const issues = await res.json();
      if (!Array.isArray(issues) || issues.length === 0) {
        alert('No open issues found in this repository.');
        return;
      }
      const titles = issues.filter(i => !i.pull_request).map(i => `#${i.number}: ${i.title}`);
      textarea.value = titles.join('\n');
      renderPreview(parseLines(textarea.value));
      showToast('✓ Imported ' + titles.length + ' GitHub issues');
    } catch (err) {
      alert('Failed to connect to GitHub: ' + err.message);
    }
  });

  // 3. Save all settings
  btnSaveAll.addEventListener('click', async () => {
    const parsedTasks = parseLines(textarea.value);
    const toSave = {
      tasks: parsedTasks.length > 0 ? parsedTasks : FocusStorage.DEFAULTS.tasks,
      sites: {
        youtube: {
          enabled: optYT.checked,
          feed: optYTFeed.checked,
          shorts: optYTShorts.checked,
          recommendations: optYTRecs.checked
        },
        instagram: {
          enabled: optIG.checked,
          feed: optIGFeed.checked,
          reels: optIGReels.checked,
          explore: optIGExplore.checked
        },
        tiktok: {
          enabled: optTT.checked,
          fyp: optTTFyp.checked,
          following: optTTFollowing.checked,
          live: optTTLive.checked
        }
      },
      intensity: intHard.checked ? 'hard' : 'soft',
      schedule: {
        enabled: optSchedEnable.checked,
        startHour: parseInt(schedStart.value, 10) || 9,
        endHour: parseInt(schedEnd.value, 10) || 18
      },
      theme: selectedTheme
    };

    await FocusStorage.set(toSave);
    showToast('✓ Preferences saved');
  });

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2400);
  }
});

function parseLines(rawText) {
  return rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, idx) => {
      // Check for Markdown checkbox: - [ ] task or - [x] task
      const cbMatch = line.match(/^-\s*\[([ xX])\]\s*(.+)/);
      if (cbMatch) {
        return {
          id: 'task_' + idx + '_' + Date.now().toString(36),
          title: cbMatch[2].trim(),
          starred: false,
          type: 'task'
        };
      }
      // Check for Markdown heading: # Heading
      const hMatch = line.match(/^#{1,3}\s+(.+)/);
      if (hMatch) {
        return {
          id: 'task_' + idx + '_' + Date.now().toString(36),
          title: hMatch[1].trim(),
          starred: true,
          type: 'task'
        };
      }
      return {
        id: 'task_' + idx + '_' + Date.now().toString(36),
        title: line,
        starred: false,
        type: 'task'
      };
    });
}

function renderPreview(tasks) {
  const container = document.getElementById('taskPreviewContainer');
  if (!container) return;
  if (!tasks || tasks.length === 0) {
    container.innerHTML = '<span class="empty-hint">No tasks yet. Add a few above to preview your focus card.</span>';
    return;
  }
  container.innerHTML = tasks.map(t => `
    <div class="preview-item ${t.starred ? 'starred' : ''}">
      <div class="preview-bullet"></div>
      <span>${escapeHTML(t.title)}</span>
    </div>
  `).join('');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
