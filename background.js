// Focus Extension — Service Worker
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    chrome.storage.local.get({ onboardingDone: false }, (res) => {
      if (!res.onboardingDone) {
        chrome.tabs.create({ url: chrome.runtime.getURL('onboarding/onboarding.html') });
      }
    });
  }
});

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

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'toggle-focus') {
    const data = await new Promise(r => chrome.storage.local.get({ enabled: true }, r));
    chrome.storage.local.set({ enabled: !data.enabled });
  }
});
