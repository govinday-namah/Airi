const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');
const installBtn = document.getElementById('installBtn');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');

let deferredPrompt = null;

function showScreen(id) {
  screens.forEach((screen) => {
    screen.classList.toggle('hidden', screen.id !== id);
  });

  navItems.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.target === id);
  });
}

navItems.forEach((btn) => {
  btn.addEventListener('click', () => showScreen(btn.dataset.target));
});

function addMessage(text, isUser = false) {
  const msg = document.createElement('div');
  msg.className = `msg ${isUser ? 'user' : 'ai'}`;
  msg.textContent = text;
  chatBox.appendChild(msg);
}

sendBtn.addEventListener('click', () => {
  const value = chatInput.value.trim();
  if (!value) return;

  addMessage(value, true);

  const lower = value.toLowerCase();
  let reply = 'I’m ready when you are, love.';

  if (lower.includes('schedule')) {
    reply = 'Your day is organized. Start with the proposal and keep your recovery block protected.';
  } else if (lower.includes('remind')) {
    reply = 'I’ve set your reminder. You’ll be notified at the correct time.';
  } else if (lower.includes('late')) {
    reply = 'You’re behind schedule, but I’ve adjusted your next task.';
  } else if (lower.includes('break')) {
    reply = 'You’ve earned a break. I’ve protected time for you.';
  } else if (lower.includes('priority')) {
    reply = 'Start with the proposal. It is the most important thing on your list.';
  }

  setTimeout(() => addMessage(reply), 220);
  chatInput.value = '';
});

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
      console.error('Service worker registration failed:', error);
    });
  });
}

showScreen('home-screen');
