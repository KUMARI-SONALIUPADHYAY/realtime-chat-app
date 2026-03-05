const socket = io();

let username = prompt("Enter your name");

socket.emit("join", username);

const messageInput = document.getElementById("messageInput");
const messages = document.getElementById("messages");
const userList = document.getElementById("userList");
const onlineCount = document.getElementById("onlineCount");
const typing = document.getElementById("typing");

function sendMessage(){

    const msg = messageInput.value;

    if(msg === "") return;

    const data = {
        username: username,
        message: msg,
        time: new Date().toLocaleTimeString()
    };

    socket.emit("sendMessage", data);

    messageInput.value = "";
}

socket.on("receiveMessage",(data)=>{

    const div = document.createElement("div");

    div.innerHTML =
    "<b>"+data.username+"</b>: "
    +data.message+
    " <small>"+data.time+"</small>";

    messages.appendChild(div);

});

socket.on("onlineUsers",(users)=>{

    userList.innerHTML = "";

    users.forEach(user=>{
        const li = document.createElement("li");
        li.textContent = user;
        userList.appendChild(li);
    });

    onlineCount.innerText = "Online Users: " + users.length;

});

messageInput.addEventListener("input",()=>{
    socket.emit("typing",username);
});

socket.on("typing",(user)=>{
    typing.innerText = user + " is typing...";

    setTimeout(()=>{
        typing.innerText="";
    },2000);
});