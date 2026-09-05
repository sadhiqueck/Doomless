// Task Queue and Deck Manager
const CardDeck = (() => {
  let deck = [];
  let currentIndex = 0;

  async function load() {
    const data = await FocusStorage.get();
    const tasks = data.tasks || [];
    const completed = data.tasksCompleted || [];
    deck = tasks.map(t => ({
      ...t,
      done: completed.includes(t.id)
    }));
    currentIndex = 0;
  }

  function current() { return deck[currentIndex] || null; }
  function all() { return deck; }
  function isDone() { return deck.length > 0 && deck.every(t => t.done); }

  return { load, current, all, isDone };
})();
