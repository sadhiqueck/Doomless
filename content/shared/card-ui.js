// Sticky Note UI Swap Controller
const FocusCard = (() => {
  let overlayEl = null;

  async function mount(siteName) {
    if (document.querySelector('.focus-swap-root')) return;
    await CardDeck.load();
    if (CardDeck.all().length === 0) return;

    overlayEl = document.createElement('div');
    overlayEl.className = 'focus-swap-root';
    overlayEl.innerHTML = '<div class="focus-note-card"><p>Loading daily tasks...</p></div>';
    document.body.appendChild(overlayEl);
  }

  function unmount() {
    if (overlayEl) {
      overlayEl.remove();
      overlayEl = null;
    }
  }

  return { mount, unmount };
})();
