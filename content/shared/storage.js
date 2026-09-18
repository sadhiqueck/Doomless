// Storage helper for Focus Extension
const FocusStorage = (() => {
  const DEFAULTS = {
    enabled: true,
    sites: { youtube: true, instagram: true, tiktok: true },
    tasks: [
      { id: 'task-1', title: 'Complete first daily focus item', starred: true, type: 'task' },
      { id: 'task-2', title: 'Review sprint backlog', starred: false, type: 'task' }
    ],
    tasksCompleted: [],
    cooldownUntil: null,
    lastResetDate: new Date().toISOString().slice(0, 10),
    theme: 'yellow',
    intensity: 'soft'
  };

  async function get(keys = null) {
    return new Promise(resolve => {
      chrome.storage.local.get(keys || DEFAULTS, resolve);
    });
  }

  async function set(obj) {
    return new Promise(resolve => {
      chrome.storage.local.set(obj, resolve);
    });
  }

  return { get, set };
})();

FocusStorage.isSiteEnabled = async function(siteName) {
  const data = await FocusStorage.get();
  return data.enabled && (data.sites && data.sites[siteName] !== false);
};

FocusStorage.setCooldown = async function(minutes = 5) {
  const expiresAt = Date.now() + (minutes * 60 * 1000);
  await FocusStorage.set({ cooldownUntil: expiresAt });
};

FocusStorage.isCooldownActive = async function() {
  const data = await FocusStorage.get();
  return Boolean(data.cooldownUntil && Date.now() < data.cooldownUntil);
};

FocusStorage.seedDefaultTasks = async function() {
  const data = await FocusStorage.get();
  if (!data.tasks || data.tasks.length === 0) {
    await FocusStorage.set({
      tasks: [
        { id: 'seed-1', title: 'Write 3 key points for today's goal', starred: true, type: 'task' },
        { id: 'seed-2', title: 'Review open pull request / ticket', starred: false, type: 'task' },
        { id: 'seed-3', title: 'Take 5 deep breaths before scrolling', starred: false, type: 'note' }
      ]
    });
  }
};

FocusStorage.addTask = async function(title, opts = {}) {
  const data = await FocusStorage.get();
  const tasks = data.tasks || [];
  const newTask = {
    id: 'task_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    title: title.trim(),
    starred: Boolean(opts.starred),
    type: opts.type || 'task'
  };
  await FocusStorage.set({ tasks: [...tasks, newTask] });
  return newTask;
};

FocusStorage.removeTask = async function(taskId) {
  const data = await FocusStorage.get();
  const tasks = (data.tasks || []).filter(t => t.id !== taskId);
  const tasksCompleted = (data.tasksCompleted || []).filter(id => id !== taskId);
  await FocusStorage.set({ tasks, tasksCompleted });
};

FocusStorage.updateTask = async function(taskId, changes) {
  const data = await FocusStorage.get();
  const tasks = (data.tasks || []).map(t => t.id === taskId ? { ...t, ...changes } : t);
  await FocusStorage.set({ tasks });
};

FocusStorage.checkDailyRollover = async function() {
  const data = await FocusStorage.get();
  const today = new Date().toISOString().slice(0, 10);
  if (data.lastResetDate !== today) {
    await FocusStorage.set({
      tasksCompleted: [],
      lastResetDate: today
    });
  }
};

// Intensity mode: 'soft' gives option to bypass; 'hard' blocks bypass
FocusStorage.getIntensity = async function() {
  const data = await FocusStorage.get();
  return data.intensity || 'soft';
};
