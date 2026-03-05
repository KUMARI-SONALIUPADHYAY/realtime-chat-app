// client/chat.js

// IMPORTANT: connect to the same origin where the page is served.
// Using window.location.origin ensures the deployed host is used (not localhost).
const socket = io(window.location.origin, { transports: ["websocket", "polling"] });

const messagesEl = document.getElementById("messages");
const usersEl = document.getElementById("users");
const countEl = document.getElementById("count");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let username = localStorage.getItem("chat_username");
if (!username) {
  // use a prompt only once (only if user hasn't set username)
  username = window.prompt("Enter your name for chat:") || `User-${Math.floor(Math.random()*1000)}`;
  localStorage.setItem("chat_username", username);
}

// helper to append messages
function appendMessage({ user, text, time, system }) {
  if (system) {
    const div = document.createElement("div");
    div.className = "system";
    div.innerText = text;
    messagesEl.appendChild(div);
  } else {
    const wrapper = document.createElement("div");
    const bubble = document.createElement("div");
    bubble.className = "bubble " + (user === username ? "right" : "left");
    bubble.innerHTML = `<strong>${user}</strong><br>${text}<br><small style="opacity:0.7">${time}</small>`;
    wrapper.appendChild(bubble);
    messagesEl.appendChild(wrapper);
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// format time
function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString();
}

// when socket connects
socket.on("connect", () => {
  console.log("Connected to socket server");
  socket.emit("join", username);
});

// load previous messages
socket.on("loadMessages", (msgs) => {
  messagesEl.innerHTML = "";
  msgs.forEach(m => appendMessage({ user: m.user, text: m.text, time: m.time }));
});

// receive a message
socket.on("receiveMessage", (data) => {
  appendMessage({ user: data.user, text: data.text, time: data.time });
});

// system messages (join/leave)
socket.on("systemMessage", (text) => {
  appendMessage({ system: true, text });
});

// online users update
socket.on("onlineUsers", (list) => {
  usersEl.innerHTML = "";
  list.forEach(u => {
    const li = document.createElement("li");
    li.innerText = u;
    usersEl.appendChild(li);
  });
  countEl.innerText = `Online Users: ${list.length}`;
});

// typing indicator (optional)
let typingTimeout;
socket.on("typing", (who) => {
  // show simple "X is typing..." system message temporarily
  const tmpId = "typing-" + who;
  let el = document.getElementById(tmpId);
  if (!el) {
    el = document.createElement("div");
    el.id = tmpId;
    el.className = "system";
    el.innerText = `${who} is typing...`;
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    const e = document.getElementById(tmpId);
    if (e) e.remove();
  }, 1500);
});

// send message handler
function sendMessage() {
  const text = input.value.trim();
  if (!text) return;
  const data = { user: username, text, time: nowTime() };
  socket.emit("sendMessage", data);
  appendMessage(data); // show locally (server will broadcast to others)
  input.value = "";
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
  else socket.emit("typing", username); // notify others when typing
});