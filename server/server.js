const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

const Message = require("./models/Message");

const app = express();

// serve frontend
app.use(express.static(path.join(__dirname, "../client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/chat.html"));
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/realtimechat")
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

let users = {};

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("join", (username) => {

    users[socket.id] = username;

    io.emit("onlineUsers", Object.values(users));

    socket.broadcast.emit("systemMessage", username + " joined the chat");

  });

  socket.on("sendMessage", async (data) => {

    const msg = new Message(data);
    await msg.save();

    io.emit("receiveMessage", data);

  });

  socket.on("typing", (username) => {

    socket.broadcast.emit("typing", username);

  });

  socket.on("disconnect", () => {

    const username = users[socket.id];

    delete users[socket.id];

    io.emit("onlineUsers", Object.values(users));

    if (username) {
      io.emit("systemMessage", username + " left the chat");
    }

    console.log("User disconnected");

  });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});