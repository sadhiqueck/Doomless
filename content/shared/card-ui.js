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

function updateProgress(tasks) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

  const bar = document.getElementById('feProgressBar');
  const txt = document.getElementById('feProgressText');
  if (bar) bar.style.width = pct + '%';
  if (txt) txt.textContent = `${completed} of ${total} done`;

  if (completed === total && total > 0) {
    showDoneCelebration();
  }
}

function showDoneCelebration() {
  const body = document.getElementById('feBody');
  if (!body) return;
  body.innerHTML = `
    <div class="fe-done-view">
      <div class="fe-done-badge">🎉</div>
      <h3 class="fe-done-title">All tasks completed!</h3>
      <p class="fe-done-subtitle">No feed to show anyway. Take a breather!</p>
    </div>
  `;
}

function attachCardActions() {
  const note = document.getElementById('feNote');
  if (!note || note.querySelector('.fe-actions')) return;

  const actions = document.createElement('div');
  actions.className = 'fe-actions';
  actions.innerHTML = `
    <button class="fe-btn-dismiss" id="feBtnDismiss">✓ Got it, back to work</button>
    <button class="fe-btn-through" id="feBtnThrough">Let me through →</button>
  `;
  note.appendChild(actions);

  document.getElementById('feBtnDismiss').addEventListener('click', FocusCard.unmount);
}

function handleLetMeThrough() {
  const btn = document.getElementById('feBtnThrough');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    await FocusStorage.setCooldown(5);
    const note = document.getElementById('feNote');
    if (note) {
      note.innerHTML = '<div class="fe-cooldown-active">Feed unlocked for 5 minutes. Back soon! 👀</div>';
    }
    setTimeout(FocusCard.unmount, 1200);
  });
}

chrome.storage.onChanged.addListener((changes) => {
  if (changes.cooldownUntil) {
    if (Date.now() < changes.cooldownUntil.newValue) {
      FocusCard.unmount();
    }
  }
});

function enableSwipeGesture(stickyEl) {
  let startX = 0;
  let isDragging = false;

  stickyEl.addEventListener('mousedown', (e) => {
    startX = e.clientX;
    isDragging = true;
    stickyEl.style.transition = 'none';
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startX;
    stickyEl.style.transform = `translateX(${deltaX}px) rotate(${-1.5 + (deltaX * 0.04)}deg)`;
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    stickyEl.style.transition = 'transform 0.25s ease';
    const deltaX = e.clientX - startX;

    if (Math.abs(deltaX) > 120) {
      stickyEl.style.transform = `translateX(${deltaX > 0 ? 600 : -600}px) opacity(0)`;
      setTimeout(FocusCard.unmount, 200);
    } else {
      stickyEl.style.transform = 'rotate(-1.5deg)';
    }
  });
}

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    FocusCard.unmount();
  }
});

function addCardPagination() {
  const header = document.querySelector('.fe-header');
  if (!header || header.querySelector('.fe-nav')) return;

  const nav = document.createElement('div');
  nav.className = 'fe-nav';
  nav.innerHTML = '<button class="fe-nav-btn prev">◀</button><button class="fe-nav-btn next">▶</button>';
  header.appendChild(nav);
}

// Check cooldown expiry on window focus
window.addEventListener('focus', async () => {
  const active = await FocusStorage.isCooldownActive();
  if (!active && !document.querySelector('.focus-swap-root')) {
    // re-evaluate mount if user returned to tab
    const site = location.hostname.includes('youtube') ? 'youtube' : location.hostname.includes('instagram') ? 'instagram' : 'tiktok';
    FocusCard.mount(site);
  }
});

async function applyIntensityMode() {
  const intensity = await FocusStorage.getIntensity();
  if (intensity === 'hard') {
    const throughBtn = document.getElementById('feBtnThrough');
    if (throughBtn) throughBtn.style.display = 'none';
  }
}
