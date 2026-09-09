// Sticky Note UI Swap Controller (Layered)
const FocusCard = (() => {
  let rootEl = null;

  async function mount(siteName) {
    if (document.querySelector('.focus-swap-root')) return;
    if (await FocusStorage.isCooldownActive()) return;

    await CardDeck.load();
    if (CardDeck.all().length === 0) return;

    rootEl = document.createElement('div');
    rootEl.className = 'focus-swap-root';
    rootEl.innerHTML = `
      <div class="fe-backdrop" id="feBackdrop"></div>
      <div class="fe-sticky-note" id="feNote">
        <div class="fe-pin"></div>
        <div class="fe-header">
          <span class="fe-label">🎯 Today's Focus</span>
          <span class="fe-date">${new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <div class="fe-body" id="feBody"></div>
      </div>
    `;
    document.body.appendChild(rootEl);
  }

  function unmount() {
    if (rootEl) {
      rootEl.remove();
      rootEl = null;
    }
  }

  return { mount, unmount };
})();

// Wire injection into site container
FocusCard.attachToContainer = function(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.style.position = 'relative';
  }
};

function renderTaskList(tasks) {
  const body = document.getElementById('feBody');
  if (!body) return;

  const html = `
    <ul class="fe-task-list">
      ${tasks.map(t => `
        <li class="fe-task-row ${t.done ? 'is-done' : ''}" data-id="${t.id}">
          <span class="fe-checkbox ${t.done ? 'checked' : ''}"></span>
          <span class="fe-task-text">${t.title}</span>
        </li>
      `).join('')}
    </ul>
    <div class="fe-progress-box">
      <div class="fe-progress-track"><div class="fe-progress-bar" id="feProgressBar"></div></div>
      <span class="fe-progress-text" id="feProgressText">0 of 0 done</span>
    </div>
  `;
  body.innerHTML = html;
}
