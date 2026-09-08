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
