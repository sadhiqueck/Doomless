// Focus Extension — Storage Utilities
const FocusStorage = (() => {
  const DEFAULTS = {
    enabled: true,
    sites: { youtube: true, instagram: true, tiktok: true },
    tasks: [
      { id: 'task-1', title: 'Finish sprint priority deliverable', starred: true, type: 'task' },
      { id: 'task-2', title: 'Review open pull request / ticket', starred: false, type: 'task' },
      { id: 'task-3', title: '30-second breathing & reset', starred: false, type: 'note' }
    ],
    tasksCompleted: [],
    cooldownUntil: null,
    lastResetDate: new Date().toISOString().slice(0, 10),
    theme: 'yellow',
    intensity: 'soft',
    schedule: { enabled: false, startHour: 9, endHour: 22 },
    weekdayMode: 'all',
    streak: 0,
    onboardingDone: false
  };

  async function get(keys = null) {
    return new Promise(resolve => {
      chrome.storage.local.get(null, stored => {
        const result = { ...DEFAULTS, ...stored };
        if (keys && typeof keys === 'string') {
          resolve(result[keys]);
        } else if (Array.isArray(keys)) {
          const subset = {};
          keys.forEach(k => { subset[k] = result[k]; });
          resolve(subset);
        } else {
          resolve(result);
        }
      });
    });
  }

  async function set(obj) {
    return new Promise(resolve => {
      chrome.storage.local.set(obj, resolve);
    });
  }

  async function isSiteEnabled(siteName) {
    const data = await get();
    if (data.enabled === false) return false;
    if (data.sites && data.sites[siteName] === false) return false;
    return true;
  }

  async function isCooldownActive() {
    const data = await get();
    return Boolean(data.cooldownUntil && Date.now() < data.cooldownUntil);
  }

  async function setCooldown(minutes = 5) {
    const expiresAt = Date.now() + (minutes * 60 * 1000);
    await set({ cooldownUntil: expiresAt });
  }

  async function isScheduleActive() {
    const data = await get();
    const sched = data.schedule || { enabled: false, startHour: 9, endHour: 22 };
    if (!sched.enabled) return true;
    const currentHour = new Date().getHours();
    return currentHour >= sched.startHour && currentHour < sched.endHour;
  }

  async function getTasks() {
    const data = await get();
    return (data.tasks && data.tasks.length > 0) ? data.tasks : DEFAULTS.tasks;
  }

  async function addTask(title, opts = {}) {
    const data = await get();
    const tasks = (data.tasks && data.tasks.length > 0) ? data.tasks : DEFAULTS.tasks;
    const newTask = {
      id: 'task_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: title.trim(),
      starred: Boolean(opts.starred),
      type: opts.type || 'task'
    };
    await set({ tasks: [...tasks, newTask] });
    return newTask;
  }

  async function removeTask(taskId) {
    const data = await get();
    const tasks = (data.tasks || []).filter(t => t.id !== taskId);
    const tasksCompleted = (data.tasksCompleted || []).filter(id => id !== taskId);
    await set({ tasks, tasksCompleted });
  }

  async function updateTask(taskId, changes) {
    const data = await get();
    const tasks = (data.tasks || []).map(t => t.id === taskId ? { ...t, ...changes } : t);
    await set({ tasks });
  }

  async function markTaskDone(taskId, isDone = true) {
    const data = await get();
    let tasksCompleted = [...(data.tasksCompleted || [])];
    if (isDone) {
      if (!tasksCompleted.includes(taskId)) tasksCompleted.push(taskId);
    } else {
      tasksCompleted = tasksCompleted.filter(id => id !== taskId);
    }
    await set({ tasksCompleted });
  }

  async function getIntensity() {
    const data = await get();
    return data.intensity || 'soft';
  }

  return {
    get,
    set,
    isSiteEnabled,
    isCooldownActive,
    setCooldown,
    isScheduleActive,
    getTasks,
    addTask,
    removeTask,
    updateTask,
    markTaskDone,
    getIntensity,
    DEFAULTS
  };
})();
