// Options Page Controller
document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('taskTextarea');
  const preview = document.getElementById('taskPreviewContainer');
  const saveBtn = document.getElementById('btnSaveTasks');

  const data = await FocusStorage.get();
  const tasks = data.tasks || [];
  textarea.value = tasks.map(t => t.title).join('
');
  renderPreview(parseLines(textarea.value));

  textarea.addEventListener('input', () => {
    renderPreview(parseLines(textarea.value));
  });

  saveBtn.addEventListener('click', async () => {
    const parsed = parseLines(textarea.value);
    await FocusStorage.set({ tasks: parsed });
    showToast();
  });
});

function parseLines(rawText) {
  return rawText
    .split('
')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, idx) => ({
      id: 'task_' + idx + '_' + Date.now().toString(36),
      title: line.replace(/^[-*•]\s*/, ''),
      starred: line.startsWith('*') || line.startsWith('#'),
      type: 'task'
    }));
}

function renderPreview(taskList) {
  const preview = document.getElementById('taskPreviewContainer');
  if (!preview) return;
  if (taskList.length === 0) {
    preview.innerHTML = '<span class="empty-hint">No tasks parsed yet.</span>';
    return;
  }
  preview.innerHTML = taskList.map(t => `
    <div class="preview-item">
      <span>${t.starred ? '⭐ ' : '• '}</span>
      <span>${t.title}</span>
    </div>
  `).join('');
}

function showToast() {
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// Support Enter hotkey inside task textarea
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    document.getElementById('btnSaveTasks')?.click();
  }
});

function parseMarkdownCheckbox(line) {
  const match = line.match(/^-\s*\[([ xX])\]\s*(.+)/);
  if (match) {
    return {
      title: match[2].trim(),
      done: match[1].toLowerCase() === 'x'
    };
  }
  return null;
}

function parseMarkdownHeaders(line) {
  const match = line.match(/^#{1,3}\s+(.+)/);
  if (match) {
    return {
      title: match[1].trim(),
      starred: true
    };
  }
  return null;
}

function sanitizeAndCap(tasks, limit = 20) {
  return tasks
    .slice(0, limit)
    .map(t => ({
      ...t,
      title: t.title.replace(/<[^>]*>?/gm, '').slice(0, 140)
    }));
}

document.getElementById('btnFetchUrl')?.addEventListener('click', async () => {
  const input = document.getElementById('notionUrlInput');
  const url = input.value.trim();
  if (!url) return;
  try {
    const res = await fetch(url);
    const text = await res.text();
    const cleanText = text.replace(/<[^>]*>/g, '');
    const textarea = document.getElementById('taskTextarea');
    textarea.value = cleanText.split('
').slice(0, 15).join('
');
    renderPreview(parseLines(textarea.value));
  } catch (err) {
    alert('Failed to fetch from URL: ' + err.message);
  }
});

document.getElementById('btnFetchGithub')?.addEventListener('click', async () => {
  const repoInput = document.getElementById('githubRepoInput').value.trim();
  const match = repoInput.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    alert('Please enter a valid format: github.com/owner/repo');
    return;
  }
  const [, owner, repo] = match;
  try {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues?state=open&per_page=15`);
    if (res.status === 403) {
      alert('GitHub API rate limit reached. Please try again in a few minutes.');
      return;
    }
    const issues = await res.json();
    const titles = issues.map(i => `#${i.number}: ${i.title}`);
    const textarea = document.getElementById('taskTextarea');
    textarea.value = titles.join('
');
    renderPreview(parseLines(textarea.value));
  } catch (err) {
    alert('Failed to connect to GitHub: ' + err.message);
  }
});
