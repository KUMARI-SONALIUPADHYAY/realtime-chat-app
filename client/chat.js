const socket = io("http://localhost:3000");

/* STEP 1 — Ask username when user opens chat */
const username = prompt("Enter your name");

/* STEP 2 — Send message */
function sendMessage(){

const input = document.getElementById("messageInput");

input.addEventListener("keypress", ()=>{
socket.emit("typing", username);
});

const message = input.value;

const data = {
user: username,
message: message,
time: new Date().toLocaleTimeString()
};

socket.emit("sendMessage", data);

input.value = "";

}

socket.on("typing",(name)=>{
document.getElementById("typing").innerText = name + " is typing...";

setTimeout(()=>{
document.getElementById("typing").innerText = "";
},2000);
});

/* STEP 3 — Receive message */
socket.on("receiveMessage", (data) => {

const messages = document.getElementById("messages");

const div = document.createElement("div");

/* create avatar */
const avatar = document.createElement("div");
avatar.innerText = data.user.charAt(0).toUpperCase();
avatar.classList.add("avatar");

/* message bubble */
const bubble = document.createElement("div");
bubble.classList.add("bubble");

bubble.innerHTML = `
<div class="name">${data.user}</div>
<div>${data.message}</div>
<div class="time">${data.time}</div>
`;

div.classList.add("message-row");

/* align messages */
if(data.user === username){
div.classList.add("own");
}

div.appendChild(avatar);
div.appendChild(bubble);

messages.appendChild(div);

messages.scrollTop = messages.scrollHeight;

});

/* Auto scroll */
messages.scrollTop = messages.scrollHeight;
socket.on("onlineUsers", (count) => {
    document.getElementById("users").innerText = count;
});