const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const connectDB = require("./config/db");
const Message = require("./models/Message");

const app = express();
app.get("/messages", async (req,res)=>{
const messages = await Message.find();
res.json(messages);
});
connectDB();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }
});

io.on("connection", (socket) => {

  console.log("User connected");

  socket.on("sendMessage", async (data) => {

    const message = new Message(data);

    await message.save();

    io.emit("receiveMessage", data);

  });

});
let users = 0;

io.on("connection", (socket) => {

    users++;
    io.emit("onlineUsers", users);

    // typing event
    socket.on("typing", (name) => {
        socket.broadcast.emit("typing", name);
    });

    // disconnect event
    socket.on("disconnect", () => {
        users--;
        io.emit("onlineUsers", users);
    });

});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});