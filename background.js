// Focus Extension — Service Worker
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.set({ onboardingDone: false });
  }
});

// Midnight reset alarm
chrome.alarms.create('daily-reset', {
  when: getNextMidnight(),
  periodInMinutes: 24 * 60
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily-reset') {
    chrome.storage.local.set({
      tasksCompleted: [],
      lastResetDate: new Date().toISOString().slice(0, 10)
    });
  }
});

function getNextMidnight() {
  const m = new Date();
  m.setHours(24, 0, 0, 0);
  return m.getTime();
}
