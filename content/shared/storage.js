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
