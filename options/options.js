// Focus Extension — Options Page Controller
document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('taskTextarea');
  const preview = document.getElementById('taskPreviewContainer');
  const optYT = document.getElementById('optYT');
  const optIG = document.getElementById('optIG');
  const optTT = document.getElementById('optTT');
  const intSoft = document.getElementById('intSoft');
  const intHard = document.getElementById('intHard');
  const optSchedEnable = document.getElementById('optSchedEnable');
  const schedDetails = document.getElementById('schedDetails');
  const schedStart = document.getElementById('schedStart');
  const schedEnd = document.getElementById('schedEnd');
  const fileInput = document.getElementById('fileInput');
  const btnFetchGithub = document.getElementById('btnFetchGithub');
  const btnSaveAll = document.getElementById('btnSaveAll');

  let selectedTheme = 'yellow';

  // 1. Load initial settings
  const data = await FocusStorage.get();
  const tasks = data.tasks || FocusStorage.DEFAULTS.tasks;
  textarea.value = tasks.map(t => t.title).join('\n');
  renderPreview(parseLines(textarea.value));

  optYT.checked = data.sites?.youtube !== false;
  optIG.checked = data.sites?.instagram !== false;
  optTT.checked = data.sites?.tiktok !== false;

  if (data.intensity === 'hard') {
    intHard.checked = true;
  } else {
    intSoft.checked = true;
  }

  const sched = data.schedule || { enabled: false, startHour: 9, endHour: 22 };
  optSchedEnable.checked = Boolean(sched.enabled);
  schedDetails.style.display = sched.enabled ? 'block' : 'none';
  schedStart.value = sched.startHour ?? 9;
  schedEnd.value = sched.endHour ?? 22;

  selectedTheme = data.theme || 'yellow';
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
  });

  // GitHub Issues import
  btnFetchGithub?.addEventListener('click', async () => {
    const repoInput = document.getElementById('githubRepoInput').value.trim();
    const match = repoInput.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      alert('Please enter a valid format: github.com/owner/repository');
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
      const titles = issues.map(i => `#${i.number}: ${i.title}`);
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
        youtube: optYT.checked,
        instagram: optIG.checked,
        tiktok: optTT.checked
      },
      intensity: intHard.checked ? 'hard' : 'soft',
      schedule: {
        enabled: optSchedEnable.checked,
        startHour: parseInt(schedStart.value, 10) || 9,
        endHour: parseInt(schedEnd.value, 10) || 22
      },
      theme: selectedTheme
    };

    await FocusStorage.set(toSave);
    showToast('✓ Preferences saved');
  });
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
        title: line.replace(/^[-*•]\s*/, ''),
        starred: line.startsWith('*') || line.startsWith('⭐'),
        type: 'task'
      };
    });
}

function renderPreview(taskList) {
  const preview = document.getElementById('taskPreviewContainer');
  if (!preview) return;
  if (taskList.length === 0) {
    preview.innerHTML = '<span class="empty-hint">No tasks parsed yet. Paste some above!</span>';
    return;
  }
  preview.innerHTML = taskList.map(t => `
    <div class="preview-item">
      <span>${t.starred ? '⭐ ' : '• '}</span>
      <span>${escapeHtml(t.title)}</span>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(msg = '✓ Preferences saved') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}
