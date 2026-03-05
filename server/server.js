const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const Message = require("./models/Message");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

mongoose.connect("mongodb://127.0.0.1:27017/realtimechat")
.then(()=> console.log("MongoDB connected"))
.catch(err => console.log(err));

let users = {};

io.on("connection",(socket)=>{

    console.log("User connected");

    socket.on("join",(username)=>{

        users[socket.id] = username;

        io.emit("onlineUsers", Object.values(users));

        socket.broadcast.emit("systemMessage", username + " joined the chat");

    });

    socket.on("sendMessage", async(data)=>{

        const msg = new Message(data);
        await msg.save();

        io.emit("receiveMessage", data);

    });

    socket.on("typing",(username)=>{

        socket.broadcast.emit("typing", username);

    });

    socket.on("disconnect",()=>{

        const username = users[socket.id];

        delete users[socket.id];

        io.emit("onlineUsers", Object.values(users));

        if(username){
            io.emit("systemMessage", username + " left the chat");
        }

        console.log("User disconnected");

    });

});

server.listen(3000,()=>{
    console.log("Server running on port 3000");
});