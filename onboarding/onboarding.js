// Focus Extension — Onboarding Controller
document.addEventListener('DOMContentLoaded', () => {
  let chosenIntensity = 'soft';

  function goToStep(stepNum) {
    document.querySelectorAll('.step-card').forEach((el, idx) => {
      el.classList.toggle('active', idx + 1 === stepNum);
    });
    document.querySelectorAll('.dot').forEach((el, idx) => {
      el.classList.toggle('active', idx + 1 === stepNum);
    });
    if (stepNum === 3) {
      setTimeout(() => document.getElementById('obTasks')?.focus(), 100);
    }
  }

  // Navigation buttons
  document.getElementById('btnStep1Next')?.addEventListener('click', () => goToStep(2));
  document.getElementById('btnStep2Back')?.addEventListener('click', () => goToStep(1));
  document.getElementById('btnStep2Next')?.addEventListener('click', () => goToStep(3));
  document.getElementById('btnStep3Back')?.addEventListener('click', () => goToStep(2));
  document.getElementById('btnStep3Next')?.addEventListener('click', () => goToStep(4));
  document.getElementById('btnStep4Back')?.addEventListener('click', () => goToStep(3));

  // Intensity selection
  document.getElementById('optSoft')?.addEventListener('click', () => {
    chosenIntensity = 'soft';
    document.getElementById('optSoft').classList.add('selected');
    document.getElementById('optHard').classList.remove('selected');
  });

  document.getElementById('optHard')?.addEventListener('click', () => {
    chosenIntensity = 'hard';
    document.getElementById('optHard').classList.add('selected');
    document.getElementById('optSoft').classList.remove('selected');
  });

  // Finish setup
  document.getElementById('btnStep4Finish')?.addEventListener('click', async () => {
    const yt = document.getElementById('obYT').checked;
    const ig = document.getElementById('obIG').checked;
    const tt = document.getElementById('obTT').checked;
    const taskText = document.getElementById('obTasks').value.trim();

    let tasks = undefined;
    if (taskText) {
      tasks = taskText.split('\n')
        .map((line, i) => ({
          id: 'task_' + i + '_' + Date.now().toString(36),
          title: line.trim(),
          starred: false,
          type: 'task'
        }))
        .filter(t => t.title.length > 0);
    }

    const updates = {
      sites: { youtube: yt, instagram: ig, tiktok: tt },
      intensity: chosenIntensity,
      onboardingDone: true
    };
    if (tasks && tasks.length > 0) {
      updates.tasks = tasks;
    }

    await FocusStorage.set(updates);
    window.close();
  });
});
