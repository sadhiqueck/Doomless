let chosenIntensity = 'soft';

function nextStep(stepNum) {
  document.querySelectorAll('.step-card').forEach((el, idx) => {
    el.classList.toggle('active', idx + 1 === stepNum);
  });
  document.querySelectorAll('.dot').forEach((el, idx) => {
    el.classList.toggle('active', idx + 1 === stepNum);
  });
}

function selectIntensity(val) {
  chosenIntensity = val;
  document.getElementById('optSoft').classList.toggle('selected', val === 'soft');
  document.getElementById('optHard').classList.toggle('selected', val === 'hard');
}

async function finishOnboarding() {
  const yt = document.getElementById('obYT').checked;
  const ig = document.getElementById('obIG').checked;
  const tt = document.getElementById('obTT').checked;
  const taskText = document.getElementById('obTasks').value.trim();

  const tasks = taskText ? taskText.split('
').map((line, i) => ({
    id: 'init_' + i + '_' + Date.now().toString(36),
    title: line.trim(),
    starred: false,
    type: 'task'
  })).filter(t => t.title) : [];

  await FocusStorage.set({
    sites: { youtube: yt, instagram: ig, tiktok: tt },
    tasks: tasks.length > 0 ? tasks : undefined,
    intensity: chosenIntensity,
    onboardingDone: true
  });

  window.close();
}
