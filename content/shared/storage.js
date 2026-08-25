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
