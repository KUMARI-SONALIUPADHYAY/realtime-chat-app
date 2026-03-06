// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const path = require("path");

// Message model (inline simple schema so you can copy/paste easily)
const messageSchema = new mongoose.Schema({
  user: String,
  text: String,
  time: String,
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

const app = express();

// Serve client static files from /client folder
app.use(express.static(path.join(__dirname, "../client")));

// Always send chat.html for root (for SPA)
app.get("/", (req, res) => {
 res.sendFile(path.join(__dirname, "../client", "chat.html"));
});

const server = http.createServer(app);

// Configure Socket.IO with permissive CORS (adjust in prod if needed)
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  },
});

// MongoDB connection — read from env first (Render sets this via environment variables)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/realtimechat";


mongoose.connect("mongodb+srv://upadhyaysonali2005_db_user:d6wwJx4RgjPSetEY@cluster0.wpsgc22.mongodb.net/realtimechat")
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.log("MongoDB connection error:", err);
});


let users = {}; // socket.id -> username

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // send last 50 messages on new connection (optional)
  Message.find().sort({ createdAt: 1 }).limit(50).exec()
    .then(messages => socket.emit("loadMessages", messages))
    .catch(err => console.error(err));

  socket.on("join", (username) => {
    users[socket.id] = username || "Anonymous";
    io.emit("onlineUsers", Object.values(users));
    socket.broadcast.emit("systemMessage", `${users[socket.id]} joined the chat`);
    console.log(`${users[socket.id]} joined`);
  });

  socket.on("sendMessage", async (data) => {
    // data should be { user, text, time }
    try {
      const msg = new Message(data);
      await msg.save();
    } catch(err) {
      console.error("Error saving message:", err);
    }
    io.emit("receiveMessage", data);
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);
  });

  socket.on("disconnect", () => {
    const username = users[socket.id];
    if (username) {
      delete users[socket.id];
      io.emit("onlineUsers", Object.values(users));
      io.emit("systemMessage", `${username} left the chat`);
      console.log(`${username} disconnected`);
    }
  });
});

// Use port from environment (Render) or fallback 3000 for local dev
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));