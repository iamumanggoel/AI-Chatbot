import { BACKEND_SOCKET_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", () => {
  new ChatbotWidget();
});

class ChatbotWidget {
  constructor() {
    this.OnInit();
  }

  async OnInit() {
    const containerDiv = document.getElementById("chatbot-container");
    if (!containerDiv) {
      console.error("Chatbot container not found!");
      return;
    }

    const chatButton = document.createElement("div");
    chatButton.classList.add("chatbot-button");
    chatButton.innerHTML = "💬";
    containerDiv.appendChild(chatButton);

    const html = await this.loadHtml("./src/chatbot.html");
    containerDiv.insertAdjacentHTML("beforeend", html);

    this.chatWindow = containerDiv.querySelector(".chatbot-window");
    this.messagesDiv = containerDiv.querySelector("#chatbot-messages");
    this.inputField = containerDiv.querySelector("#chatbot-input");
    this.sendButton = containerDiv.querySelector("#chatbot-send");

    this.chatWindow.style.display = "none";

    chatButton.addEventListener("click", () => {
      this.chatWindow.style.display =
        this.chatWindow.style.display === "none" ? "flex" : "none";
    });

    this.sendButton.addEventListener("click", () => this.sendMessage());

    this.connectSocket();
  }

  async loadHtml(url) {
    const res = await fetch(url);
    return await res.text();
  }

  connectSocket() {
    this.socket = io(BACKEND_SOCKET_URL);
    this.socket.on("connect", () => {
      console.log("Connected to server");
    });

    this.socket.on("bot_message", (data) => {
      this.appendMessage("bot", data.text);
    });
  }

  sendMessage() {
    const msg = this.inputField.value.trim();
    if (msg) {
      this.appendMessage("user", msg);
      this.socket.emit("user_message", { text: msg });
      this.inputField.value = "";
    }
  }

  appendMessage(sender, text) {
    const msgEl = document.createElement("div");
    msgEl.classList.add("chatbot-msg", sender);
    msgEl.textContent = text;
    this.messagesDiv.appendChild(msgEl);
    this.messagesDiv.scrollTop = this.messagesDiv.scrollHeight;
  }
}
