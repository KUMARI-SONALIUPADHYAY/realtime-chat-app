const socket = io("http://localhost:3000");

const messages = document.getElementById("messages");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const typingDiv = document.getElementById("typing");
const usersList = document.getElementById("usersList");
const onlineCount = document.getElementById("onlineCount");
const msgSound = document.getElementById("msgSound");

const username = prompt("Enter your name");

socket.emit("join", username);

sendBtn.addEventListener("click", sendMessage);

messageInput.addEventListener("keypress",(e)=>{
    if(e.key === "Enter"){
        sendMessage();
    }
});

messageInput.addEventListener("input",()=>{
    socket.emit("typing", username);
});

function sendMessage(){

    const message = messageInput.value;

    if(message.trim()==="") return;

    const data = {
        user: username,
        message: message,
        time: new Date().toLocaleTimeString()
    };

    socket.emit("sendMessage", data);

    messageInput.value="";
}

socket.on("receiveMessage",(data)=>{

    msgSound.play();

    const div = document.createElement("div");
    div.classList.add("message");

    const avatar = document.createElement("div");
    avatar.classList.add("avatar");
    avatar.innerText = data.user.charAt(0).toUpperCase();

    const bubble = document.createElement("div");
    bubble.classList.add("bubble");

    bubble.innerHTML = `
        <div class="name">${data.user}</div>
        <div>${data.message}</div>
        <div class="time">${data.time}</div>
    `;

    if(data.user === username){
        div.classList.add("own");
    }

    div.appendChild(avatar);
    div.appendChild(bubble);

    messages.appendChild(div);

    messages.scrollTo({
        top: messages.scrollHeight,
        behavior: "smooth"
    });

});

socket.on("typing",(user)=>{

    typingDiv.innerText = user + " is typing...";

    setTimeout(()=>{
        typingDiv.innerText="";
    },2000);

});

socket.on("systemMessage",(msg)=>{

    const div = document.createElement("div");
    div.classList.add("system");
    div.innerText = msg;

    messages.appendChild(div);

});

socket.on("onlineUsers",(users)=>{

    onlineCount.innerText = users.length;

    usersList.innerHTML="";

    users.forEach(user=>{

        const li = document.createElement("li");
        li.innerText = user;

        usersList.appendChild(li);

    });

});