const socket = io();

const chatBox = document.getElementById("chatBox");
const usersList = document.getElementById("users");
const userCount = document.getElementById("userCount");
const messageInput = document.getElementById("messageInput");

let username = prompt("Enter your name");

socket.emit("join", username);

function addMessage(data){

const div = document.createElement("div");

if(data.system){

div.className="system";
div.innerText=data.text;

}else{

div.className="message " + (data.user===username ? "mine":"other");

div.innerHTML=
"<b>"+data.user+"</b><br>"+
data.text+
"<br><small>"+data.time+"</small>";

}

chatBox.appendChild(div);
chatBox.scrollTop=chatBox.scrollHeight;

}

function sendMessage(){

const text = messageInput.value.trim();

if(!text) return;

const data={
user:username,
text:text,
time:new Date().toLocaleTimeString()
};

socket.emit("sendMessage",data);

messageInput.value="";

}

socket.on("receiveMessage",(data)=>{
addMessage(data);
});

socket.on("systemMessage",(msg)=>{
addMessage({system:true,text:msg});
});

socket.on("onlineUsers",(users)=>{

usersList.innerHTML="";

users.forEach(u=>{
const li=document.createElement("li");
li.innerText=u;
usersList.appendChild(li);
});

userCount.innerText="Online Users: "+users.length;

});