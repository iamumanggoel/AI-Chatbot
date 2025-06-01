// Set theme (light, dark, auto)
function setTheme(mode = 'auto') {
  const html = document.documentElement;
  if (mode === 'light') {
    html.setAttribute('data-theme', 'light');
  } else if (mode === 'dark') {
    html.setAttribute('data-theme', 'dark');
  } else {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    html.setAttribute('data-theme', mql.matches ? 'dark' : 'light');
    mql.addEventListener('change', e => {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  }
}
setTheme('auto');

document.addEventListener('DOMContentLoaded', () => {
  setTheme('auto');
  new ChatbotWidget();
});

class ChatbotWidget {
  constructor() {
    this.isOpen = false;
    this.init();
  }

  init() {
    const container = document.getElementById('chatbot-container');
    if (!container) return console.error('No #chatbot-container found');

    // Create and append button
    this.btn = document.createElement('div');
    this.btn.className = 'chatbot-button';
    this.btn.innerHTML = '<span class="material-icons">chat</span>';
    container.appendChild(this.btn);

    // Chat window HTML
    const html = `
      <div class="chatbot-window">
        <div class="chatbot-header">Ask Me Anything</div>
        <div class="chatbot-messages" id="chatbot-messages"></div>
        <div class="chatbot-input">
          <input type="text" id="chatbot-input" placeholder="Type a message..." />
          <button id="chatbot-send">
              <span class="material-icons">send</span>
          </button>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', html);

    // Style
    const style = document.createElement('style');
    style.textContent = 
    `
      :root {
    --md-sys-color-primary: #005cbb;
    --md-sys-color-on-primary: #ffffff;
    --md-sys-color-surface: #ffffff;
    --md-sys-color-on-surface: #000000;
    --md-sys-color-secondary: #005cbb;
    --md-sys-color-on-secondary: #ffffff;
    --md-sys-color-outline: #e4e4e4;
    --md-sys-color-background: #e5ddd5;
    --chatbot-border-radius: 20px;
    --chatbot-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    --transparent-background: transparent;
    }

    html[data-theme="dark"] {
        --md-sys-color-primary: #abc7ff;
        --md-sys-color-on-primary: #002f65;
        --md-sys-color-surface: #121212;
        --md-sys-color-on-surface: #e0e0e0;
        --md-sys-color-secondary: #abc7ff;
        --md-sys-color-on-secondary: #ffffff;
        --md-sys-color-outline: #444444;
        --md-sys-color-background: #333333;
        --transparent-background: transparent;
    }

    * {
        scrollbar-width: thin;
        scrollbar-color: #6b7280 var(--md-sys-color-background);
    }

    *::-webkit-scrollbar {
        width: 0.5rem;
        height: 0.5rem;
    }

    *::-webkit-scrollbar-thumb {
        border-radius: 4px;
        background-clip: content-box;
    }

    *::-webkit-scrollbar-thumb:hover {
        background-color: #6b7280;
    }

    html, body{
        background: var(--transparent-background);
    }

    .chatbot-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        border-radius: 50%;
        width: 56px;
        height: 56px;
        font-size: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--chatbot-shadow);
        transition: all 0.3s ease;
        z-index: 1000;
    }

    .chatbot-button:hover {
        transform: scale(1.05);
    }

    @keyframes rotate-outward {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(-90deg); }
    }

    @keyframes rotate-inward {
        0% { transform: rotate(-90deg); }
        100% { transform: rotate(0deg); }
    }

    .chatbot-button.rotate-out {
        animation: rotate-outward 0.3s ease forwards;
    }

    .chatbot-button.rotate-in {
        animation: rotate-inward 0.3s ease forwards;
    }

    .chatbot-window {
        position: fixed;
        bottom: 90px;
        right: 20px;
        width: 360px;
        height: 500px;
        background: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        border-radius: var(--chatbot-border-radius);
        display: none;
        flex-direction: column;
        box-shadow: var(--chatbot-shadow);
        overflow: hidden;
        font-family: 'Roboto', sans-serif;
        z-index: 999;
        transition: transform 0.3s ease, opacity 0.3s ease;
        transform-origin: bottom right;
        opacity: 0;
    }

    .chatbot-window.open {
        opacity: 1;
    }

    .chatbot-header {
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        padding: 12px;
        text-align: center;
        font-weight: 500;
    }

    .chatbot-messages {
        flex: 1;
        padding: 16px 10px;
        overflow-y: auto;
        background: var(--md-sys-color-background);
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .chatbot-msg.user {
        align-self: flex-end;
        background: var(--md-sys-color-secondary);
        color: var(--md-sys-color-on-secondary);
        padding: 10px 16px;
        border-radius: 16px 16px 0 16px;
        max-width: 80%;
        font-size: 14px;
        line-height: 1.6;
        font-weight: 400;
    }

    .chatbot-msg a {
      color: #1a73e8;
      text-decoration: underline;
      word-break: break-word;
    }


    .chatbot-msg.bot {
        align-self: flex-start;
        background: var(--md-sys-color-outline);
        color: var(--md-sys-color-on-surface);
        padding: 10px 16px;
        border-radius: 16px 16px 16px 0;
        max-width: 80%;
        font-size: 14px;
        line-height: 1.6;
        font-weight: 400;
    }

    .chatbot-msg.bot .loading-dots {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 5px;
        margin-top: 6px;
        white-space: nowrap;
        padding: 5px 8px;
    }

    .loading-dots span {
        width: 6px;
        height: 6px;
        background-color: #aaa;
        border-radius: 50%;
        animation: bounce 1.2s infinite ease-in-out;
    }

    .loading-dots span:nth-child(1) {
        animation-delay: -0.24s;
    }

    .loading-dots span:nth-child(2) {
        animation-delay: -0.12s;
    }

    .loading-dots span:nth-child(3) {
        animation-delay: 0s;
    }

    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: scale(0);
        }
        40% {
            transform: scale(1);
        }
        60% {
            transform: scale(0.5);
        }
    }

    .chatbot-input {
        display: flex;
        padding: 12px;
        gap: 10px;
        border-top: 1px solid var(--md-sys-color-outline);
        background: var(--md-sys-color-surface);
    }

    .chatbot-input input {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid var(--md-sys-color-outline);
        border-radius: 20px;
        background: var(--md-sys-color-surface);
        color: var(--md-sys-color-on-surface);
        font-size: 14px;
        font-weight: 400;
        transition: border-color 0.3s ease;
    }

    .chatbot-input input:focus {
        outline: none;
        border-color: var(--md-sys-color-primary);
        box-shadow: 0 0 5px rgba(98, 0, 234, 0.3);
    }

    .chatbot-input input::placeholder {
        color: var(--md-sys-color-on-surface);
        opacity: 0.7;
        font-style: italic;
    }

    .chatbot-input button {
        padding: 0.7rem;
        background: var(--md-sys-color-primary);
        color: var(--md-sys-color-on-primary);
        border: none;
        border-radius: 50%;
        font-size: 20px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .chatbot-input button:hover {
        background: var(--md-sys-color-secondary);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    }

    .chatbot-input button:active {
        transform: scale(0.95);
        background: var(--md-sys-color-secondary);
    }

    `;
    
    document.head.appendChild(style);

    // Cache elements
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

    this.socket = io("http://127.0.0.1:5000");
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
