// Separation of card presentation and event handling
const CardRenderer = (() => {
  function render(tasks) {
    return tasks.map(t => `<li class="task-entry">${t.title}</li>`).join('');
  }
  return { render };
})();
