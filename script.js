const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');
const installBtn = document.getElementById('installBtn');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
const taskTitleInput = document.getElementById('taskTitleInput');
const taskTimeInput = document.getElementById('taskTimeInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const priorityList = document.getElementById('priorityList');
const scheduleList = document.getElementById('scheduleList');
const priorityCount = document.getElementById('priorityCount');
const greetingLine = document.getElementById('greetingLine');
const statusLine = document.getElementById('statusLine');
const assistantStatus = document.getElementById('assistantStatus');
const quickMessage = document.getElementById('quickMessage');

const voiceToggle = document.getElementById('voiceToggle');
const strictToggle = document.getElementById('strictToggle');
const lockToggle = document.getElementById('lockToggle');

let deferredPrompt = null;

const defaultTasks = [
  { id: 1, title: 'Finish project proposal', time: '11:00', category: 'Work', done: false },
  { id: 2, title: 'Buy groceries', time: '18:00', category: 'Personal', done: false },
  { id: 3, title: 'Workout', time: '19:00', category: 'Health', done: false }
];

const state = {
  tasks: loadTasks(),
  mood: 'happy',
  settings: {
    voice: true,
    strictMode: true,
    lockQuickView: true
  },
  chat: [
    { role: 'ai', text: 'Good morning, love. I’ve already mapped your day.' },
    { role: 'ai', text: 'You have three priorities and one recovery block.' },
    { role: 'user', text: 'Airi, what should I prioritize?' },
    { role: 'ai', text: 'Start with the proposal. I’ve protected your focus time.' }
  ]
};

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem('airi-tasks') || 'null');
    return saved && Array.isArray(saved) && saved.length ? saved : defaultTasks;
  } catch {
    return defaultTasks;
  }
}

function saveTasks() {
  localStorage.setItem('airi-tasks', JSON.stringify(state.tasks));
}

function renderHome() {
  const topTasks = state.tasks.slice(0, 3);
  priorityList.innerHTML = topTasks.map(task => `
    <li><span class="dot"></span>${task.title}</li>
  `).join('');

  priorityCount.textContent = `${topTasks.length} active`;

  const scheduleItems = [
    { title: 'Focus block', time: '09:00 - 10:30' },
    { title: 'Meeting prep', time: '10:45 - 11:00' },
    { title: 'Lunch break', time: '13:00 - 13:30' }
  ];

  scheduleList.innerHTML = scheduleItems.map(item => `
    <div class="schedule-item">
      <div class="icon-box">${item.title.startsWith('Focus') ? '◔' : item.title.startsWith('Meeting') ? '◌' : '✦'}</div>
      <div>
        <div class="schedule-title">${item.title}</div>
        <div class="schedule-time">${item.time}</div>
      </div>
    </div>
  `).join('');

  const isLate = false;
  const isStressed = false;

  if (isLate) {
    state.mood = 'strict';
    greetingLine.textContent = 'You’re behind schedule, but I’ve already adjusted your plan.';
    statusLine.textContent = 'We’re fixing it, and we’re doing it quickly.';
    assistantStatus.textContent = 'Strict mode is active.';
    quickMessage.textContent = 'Your next task has been rescheduled.';
  } else if (isStressed) {
    state.mood = 'caring';
    greetingLine.textContent = 'You’re under pressure, but your plan is still in control.';
    statusLine.textContent = 'I’ve simplified the noise and protected your focus.';
    assistantStatus.textContent = 'You’re doing fine. I’ve reduced the noise.';
    quickMessage.textContent = 'Take a breath. I’ve protected your next window.';
  } else {
    greetingLine.textContent = 'Good morning, love. I’ve already mapped your day.';
    statusLine.textContent = 'You’re on track today. I’ve kept your priorities clear.';
    assistantStatus.textContent = 'You’re on track today.';
    quickMessage.textContent = 'Your next task is in 20 minutes.';
  }
}

function renderTasks() {
  taskList.innerHTML = state.tasks.map(task => `
    <div class="task-item ${task.done ? 'done' : ''}" data-id="${task.id}">
      <div class="task-left">
        <span class="task-check" data-action="toggle" data-id="${task.id}"></span>
        <div>
          <div class="task-title">${task.title}</div>
          <div class="task-sub">${task.category}</div>
        </div>
      </div>
      <div class="task-time">${task.time}</div>
    </div>
  `).join('');

  taskList.querySelectorAll('[data-action="toggle"]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = Number(el.dataset.id);
      state.tasks = state.tasks.map(task =>
        task.id === id ? { ...task, done: !task.done } : task
      );
      saveTasks();
      renderTasks();
      renderHome();
    });
  });
}

function renderChat() {
  chatBox.innerHTML = state.chat.map(message => `
    <div class="msg ${message.role}">${message.text}</div>
  `).join('');
}

function addTask() {
  const title = taskTitleInput.value.trim();
  const time = taskTimeInput.value.trim() || 'Anytime';

  if (!title) return;

  state.tasks.push({
    id: Date.now(),
    title,
    time,
    category: 'Custom',
    done: false
  });

  saveTasks();
  renderTasks();
  renderHome();

  taskTitleInput.value = '';
  taskTimeInput.value = '';
}

function respondToUser(query) {
  const lower = query.toLowerCase();

  if (lower.includes('schedule')) {
    return 'Your day is mapped. Start with the proposal and keep your recovery block protected.';
  }
  if (lower.includes('remind')) {
    return 'I’ve set your reminder. You’ll be notified at the right time.';
  }
  if (lower.includes('late')) {
    return 'You’re behind schedule, but I’ve already adjusted your next task.';
  }
  if (lower.includes('break')) {
    return 'You’ve earned a break. I’ve protected time for you.';
  }
  if (lower.includes('priority')) {
    return 'Start with the proposal. It is the most important thing on your list.';
  }
  return 'I’m ready when you are, love. We’ll stay clean, purposeful, and on time.';
}

function sendChatMessage() {
  const value = chatInput.value.trim();
  if (!value) return;

  state.chat.push({ role: 'user', text: value });
  const reply = respondToUser(value);
  state.chat.push({ role: 'ai', text: reply });
  renderChat();
  chatInput.value = '';
}

function attachEvents() {
  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((item) => item.classList.remove('active'));
      btn.classList.add('active');
      screens.forEach((screen) => {
        screen.classList.toggle('hidden', screen.id !== btn.dataset.target);
      });
    });
  });

  addTaskBtn.addEventListener('click', addTask);
  sendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') sendChatMessage();
  });

  voiceToggle.addEventListener('change', (event) => {
    state.settings.voice = event.target.checked;
  });

  strictToggle.addEventListener('change', (event) => {
    state.settings.strictMode = event.target.checked;
  });

  lockToggle.addEventListener('change', (event) => {
    state.settings.lockQuickView = event.target.checked;
  });
}

window.addEventListener('beforeinstallprompt', (event) => {
  event.preventDefault();
  deferredPrompt = event;
  installBtn.classList.remove('hidden');
});

installBtn.addEventListener('click', async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  await deferredPrompt.userChoice;
  deferredPrompt = null;
  installBtn.classList.add('hidden');
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
      console.error('Service worker failed:', error);
    });
  });
}

function init() {
  attachEvents();
  renderHome();
  renderTasks();
  renderChat();
}

init();
