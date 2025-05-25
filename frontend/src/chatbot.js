import { setTheme } from './theme.js';
import { BACKEND_SOCKET_URL } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  setTheme('auto');
  new ChatbotWidget();
});

class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  async init() {
    const container = document.getElementById('chatbot-container');
    if (!container) return console.error('No #chatbot-container found');

    this.btn = document.createElement('div');
    this.btn.className = 'chatbot-button';
    this.btn.innerHTML = '<span class="material-icons">chat</span>';
    container.appendChild(this.btn);

    let html;
    try {
      const res = await fetch('src/chatbot.html');
      html = await res.text();
    } catch (err) {
      return console.error('Failed to load chatbot.html', err);
    }

    container.insertAdjacentHTML('beforeend', html);

    this.win = container.querySelector('.chatbot-window');
    this.msgs = container.querySelector('#chatbot-messages');
    this.input = container.querySelector('#chatbot-input');
    this.send = container.querySelector('#chatbot-send');
    if (!this.win || !this.msgs || !this.input || !this.send) {
      return console.error('Chatbot UI elements missing');
    }
    this.win.style.display = 'none';

    this.btn.addEventListener('click', () => {
      if (!this.isOpen) {
        this.btn.classList.add('rotate-out');
        this.btn.classList.remove('rotate-in');
      } else {
        this.btn.classList.add('rotate-in');
        this.btn.classList.remove('rotate-out');
      }

      this.isOpen = !this.isOpen;
      this.win.style.display = this.isOpen ? 'flex' : 'none';
      this.btn.classList.toggle('open', this.isOpen);
      this.win.classList.toggle('open', this.isOpen);

      this.btn.innerHTML = this.isOpen
        ? '<span class="material-icons">close</span>'
        : '<span class="material-icons">chat</span>';
    });

    this.send.addEventListener('click', () => this.sendMsg());
    this.input.addEventListener('keypress', e => e.key === 'Enter' && this.sendMsg());

    this.socket = io(BACKEND_SOCKET_URL);
    this.socket.on('connect', () => console.log('Socket connected'));
    this.socket.on('bot_message', d => this.handleBotMessage(d));
  }

  sendMsg() {
    const t = this.input.value.trim();
    if (!t) return;
    this.append('user', t); 
    this.appendLoading();
    this.socket.emit('user_message', { text: t });
    this.input.value = '';
  }

  append(sender, text) {
    const el = document.createElement('div');
    el.className = `chatbot-msg ${sender}`;
    if (sender === 'bot') {
      el.innerHTML = this.linkify(text);
    } else {
      el.textContent = text;
    }
    this.msgs.appendChild(el);
    this.msgs.scrollTop = this.msgs.scrollHeight;
  }

  appendLoading() {
    const el = document.createElement('div');
    el.className = 'chatbot-msg bot bot-typing';
    el.innerHTML = `
      <span class="loading-dots">
        <span></span><span></span><span></span>
      </span>`;
    this.msgs.appendChild(el);
    this.msgs.scrollTop = this.msgs.scrollHeight;
  }

  handleBotMessage(data) {
    const loadingEl = this.msgs.querySelector('.chatbot-msg.bot-typing');
    if (loadingEl) loadingEl.remove();
    this.append('bot', data.text);
  }

linkify(text) {
  const urlRegex = /(\bhttps?:\/\/[^\s]+)/gi;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;

  return text
    .replace(urlRegex, (url) => {
      const cleanUrl = url.replace(/\.$/, ''); 
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`;
    })
    .replace(emailRegex, (email) => {
      return `<a href="mailto:${email}">${email}</a>`;
    });
}

}
