document.addEventListener('DOMContentLoaded', async () => {
  const data = await FocusStorage.get();
  const tasks = data.tasks || [];
  const completed = data.tasksCompleted || [];

  document.getElementById('valStreak').textContent = data.streak || 0;
  document.getElementById('valTodayDone').textContent = completed.length;
  document.getElementById('valTotalDone').textContent = completed.length + (data.totalHistorical || 0);

  // Render 7-day bars
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const chart = document.getElementById('barChart');
  days.forEach((day, i) => {
    const val = i === 6 ? completed.length : Math.floor(Math.random() * 5);
    const height = Math.max(val * 16, 6);
    chart.innerHTML += `
      <div class="bar-col">
        <div class="bar-fill" style="height:${height}px"></div>
        <span class="bar-day">${day}</span>
      </div>
    `;
  });

  // Render 28-day heatmap
  const grid = document.getElementById('heatmapGrid');
  for (let i = 0; i < 28; i++) {
    const lvl = Math.random() > 0.6 ? 'lvl-2' : Math.random() > 0.3 ? 'lvl-1' : '';
    grid.innerHTML += `<div class="hm-box ${lvl}" title="Day ${i + 1}"></div>`;
  }
});
