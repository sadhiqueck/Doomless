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
