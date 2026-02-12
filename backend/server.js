// Dependencies import karo
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const Message = require("./models/Message");

// Express app initialize karo
const app = express();
const server = http.createServer(app);

// Socket.io setup with CORS
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected Successfully!"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// Basic route
app.get("/", (req, res) => {
  res.send("Chat Server is Running! 🚀");
});

// API: Get all previous messages
app.get("/api/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(50);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Socket.io Connection Handler
io.on("connection", (socket) => {
  console.log("👤 New user connected:", socket.id);

  socket.on("user-joined", (username) => {
    console.log(`${username} joined the chat`);
    socket.broadcast.emit("user-joined", username);
  });

  socket.on("send-message", async (data) => {
    try {
      const newMessage = new Message({
        username: data.username,
        message: data.message,
      });
      await newMessage.save();

      io.emit("receive-message", {
        username: data.username,
        message: data.message,
        timestamp: newMessage.timestamp,
      });

      console.log(`Message from ${data.username}: ${data.message}`);
    } catch (error) {
      console.log("Error saving message:", error);
    }
  });

  socket.on("typing", (username) => {
    socket.broadcast.emit("user-typing", username);
  });

  socket.on("disconnect", () => {
    console.log("👋 User disconnected:", socket.id);
  });
});

// Server start karo
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
