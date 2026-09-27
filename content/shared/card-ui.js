// Focus Extension — Cal.com Minimalist Card UI Controller
const FocusCard = (() => {
  let rootEl = null;

  async function mount(siteName, opts = {}) {
    // 1. Check enabled status
    const enabled = await FocusStorage.isSiteEnabled(siteName);
    if (!enabled) {
      unmount();
      return;
    }

    // 2. Check focus schedule
    const schedOk = await FocusStorage.isScheduleActive();
    if (!schedOk) {
      unmount();
      return;
    }

    // 3. Check cooldown
    if (await FocusStorage.isCooldownActive()) {
      unmount();
      return;
    }

    // 4. Avoid duplicate overlays
    if (document.querySelector('.focus-swap-root')) return;

    // 5. Load settings & tasks
    const data = await FocusStorage.get();
    const tasks = (data.tasks && data.tasks.length > 0) ? data.tasks : FocusStorage.DEFAULTS.tasks;
    const completedIds = data.tasksCompleted || [];
    const intensity = data.intensity || 'soft';

    // 6. Build root DOM
    rootEl = document.createElement('div');
    rootEl.className = 'focus-swap-root';

    const dateStr = new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    const total = tasks.length;
    const completedCount = tasks.filter(t => completedIds.includes(t.id)).length;
    const allDone = total > 0 && completedCount === total;
    const pct = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    const isShorts = opts.isShorts || location.pathname.startsWith('/shorts');

    rootEl.innerHTML = `
      <div class="fe-backdrop" id="feBackdrop"></div>
      <div class="fe-sticky-note" id="feNote">
        <div class="fe-header">
          <div class="fe-badge-group">
            <span class="fe-brand-tag" title="ശ്രദ്ധ (Focus & Mindfulness)">ശ്രദ്ധ</span>
            <span class="fe-dot"></span>
            <span class="fe-label">${isShorts ? 'Shorts Blocked' : 'Daily Focus'}</span>
          </div>
          <span class="fe-date">${dateStr}</span>
        </div>
        <div class="fe-body" id="feBody">
          ${allDone ? `
            <div class="fe-done-view">
              <div class="fe-done-badge">✓</div>
              <h3 class="fe-done-title">All tasks completed</h3>
              <p class="fe-done-subtitle">Your daily backlog is clear. Enjoy your intentional break!</p>
            </div>
          ` : `
            <ul class="fe-task-list" id="feTaskList">
              ${tasks.map(t => {
                const isDone = completedIds.includes(t.id);
                return `
                  <li class="fe-task-row ${isDone ? 'is-done' : ''}" data-id="${t.id}">
                    <span class="fe-checkbox ${isDone ? 'checked' : ''}"></span>
                    <span class="fe-task-text">${escapeHtml(t.title)}</span>
                  </li>
                `;
              }).join('')}
            </ul>
            <div class="fe-progress-box">
              <div class="fe-progress-header">
                <span>Progress</span>
                <span id="feProgressText">${completedCount} of ${total} (${pct}%)</span>
              </div>
              <div class="fe-progress-track">
                <div class="fe-progress-bar" id="feProgressBar" style="width: ${pct}%"></div>
              </div>
            </div>
          `}
        </div>
        <div class="fe-actions" id="feActions">
          <button class="fe-btn-dismiss" id="feBtnDismiss">${isShorts ? 'Leave Shorts' : 'Back to work'}</button>
          ${intensity !== 'hard' ? '<button class="fe-btn-through" id="feBtnThrough">Take 5 min →</button>' : ''}
        </div>
        <div id="feCooldownNotice" class="fe-cooldown-active" style="display:none"></div>
      </div>
    `;

    (document.body || document.documentElement).appendChild(rootEl);
    attachEvents(rootEl, siteName, isShorts);
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function handleDismiss(isShorts) {
    unmount();
    if (isShorts || location.pathname.startsWith('/shorts')) {
      location.replace('/');
    }
  }

  function attachEvents(root, siteName, isShorts) {
    // 1. Task Checkbox Toggle
    const taskRows = root.querySelectorAll('.fe-task-row');
    taskRows.forEach(row => {
      row.addEventListener('click', async () => {
        const taskId = row.dataset.id;
        const cb = row.querySelector('.fe-checkbox');
        const isCurrentlyDone = row.classList.contains('is-done');
        const newDone = !isCurrentlyDone;

        row.classList.toggle('is-done', newDone);
        cb.classList.toggle('checked', newDone);

        await FocusStorage.markTaskDone(taskId, newDone);

        // Update progress bar
        const total = root.querySelectorAll('.fe-task-row').length;
        const completed = root.querySelectorAll('.fe-task-row.is-done').length;
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);

        const bar = root.querySelector('#feProgressBar');
        const txt = root.querySelector('#feProgressText');
        if (bar) bar.style.width = pct + '%';
        if (txt) txt.textContent = `${completed} of ${total} (${pct}%)`;

        if (completed === total && total > 0) {
          triggerConfetti(root.querySelector('#feNote'));
          setTimeout(() => {
            const body = root.querySelector('#feBody');
            if (body) {
              body.innerHTML = `
                <div class="fe-done-view">
                  <div class="fe-done-badge">✓</div>
                  <h3 class="fe-done-title">All tasks completed</h3>
                  <p class="fe-done-subtitle">Your daily backlog is clear. Enjoy your intentional break!</p>
                </div>
              `;
            }
          }, 400);
        }
      });
    });

    // 2. Dismiss Button
    root.querySelector('#feBtnDismiss')?.addEventListener('click', () => {
      handleDismiss(isShorts);
    });

    // 3. Backdrop click
    root.querySelector('#feBackdrop')?.addEventListener('click', () => {
      handleDismiss(isShorts);
    });

    // 4. "Take 5 min" Button (5-minute cooldown)
    root.querySelector('#feBtnThrough')?.addEventListener('click', async () => {
      await FocusStorage.setCooldown(5);
      const notice = root.querySelector('#feCooldownNotice');
      const actions = root.querySelector('#feActions');
      if (notice) {
        notice.textContent = 'Unlocked for 5 minutes. Take your breather! 👀';
        notice.style.display = 'block';
      }
      if (actions) actions.style.display = 'none';
      setTimeout(() => {
        unmount();
        document.documentElement.classList.remove('focus-blocked-' + siteName);
        document.documentElement.classList.remove('focus-block-yt-feed', 'focus-block-yt-shorts', 'focus-block-yt-recommendations');
        document.documentElement.classList.remove('focus-block-ig-feed', 'focus-block-ig-reels', 'focus-block-ig-explore');
        document.documentElement.classList.remove('focus-block-tt-fyp', 'focus-block-tt-following', 'focus-block-tt-live');
        window.dispatchEvent(new Event('resize'));
      }, 700);
    });

    // 5. Swipe Gesture to Dismiss
    const noteEl = root.querySelector('#feNote');
    if (noteEl) {
      enableSwipe(noteEl, isShorts);
    }
  }

  function enableSwipe(noteEl, isShorts) {
    let startX = 0;
    let isDragging = false;

    noteEl.addEventListener('mousedown', (e) => {
      if (e.target.closest('button') || e.target.closest('.fe-task-row')) return;
      startX = e.clientX;
      isDragging = true;
      noteEl.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      noteEl.style.transform = `translateX(${deltaX}px)`;
    });

    window.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      noteEl.style.transition = 'transform 0.25s ease';
      const deltaX = e.clientX - startX;
      if (Math.abs(deltaX) > 130) {
        noteEl.style.transform = `translateX(${deltaX > 0 ? 600 : -600}px)`;
        setTimeout(() => handleDismiss(isShorts), 200);
      } else {
        noteEl.style.transform = 'none';
      }
    });
  }

  function triggerConfetti(noteEl) {
    if (!noteEl) return;
    const colors = ['#18181b', '#22c55e', '#3b82f6', '#f59e0b', '#ec4899'];
    for (let i = 0; i < 20; i++) {
      const bit = document.createElement('div');
      bit.style.cssText = `
        position: absolute;
        width: 6px;
        height: 6px;
        background: ${colors[i % colors.length]};
        top: 35%;
        left: ${15 + Math.random() * 70}%;
        border-radius: 50%;
        pointer-events: none;
        animation: feConfettiFly ${0.5 + Math.random() * 0.5}s ease-out forwards;
      `;
      noteEl.appendChild(bit);
    }
  }

  function unmount() {
    if (rootEl) {
      rootEl.remove();
      rootEl = null;
    }
    const existing = document.querySelectorAll('.focus-swap-root');
    existing.forEach(el => el.remove());
    window.dispatchEvent(new Event('resize'));
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      unmount();
      if (location.pathname.startsWith('/shorts')) {
        location.replace('/');
      }
    }
  });

  return { mount, unmount };
})();
