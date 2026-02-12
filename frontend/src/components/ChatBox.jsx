import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import "./ChatBox.css";

const socket = io("https://chat-application-backend-7tmp.onrender.com");

function ChatBox() {
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [isJoined, setIsJoined] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(1);
  const [typingUser, setTypingUser] = useState("");

  useEffect(() => {
    fetch("https://chat-application-backend-7fmp.onrender.com/api/messages")
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch((err) => console.log("Error fetching messages:", err));

    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on("user-joined", (username) => {
      setMessages((prev) => [
        ...prev,
        {
          username: "System",
          message: `${username} joined the chat`,
          timestamp: new Date(),
          isSystem: true,
        },
      ]);
      setOnlineUsers((prev) => prev + 1);
    });

    socket.on("user-typing", (username) => {
      setTypingUser(username);
      setTimeout(() => setTypingUser(""), 2000);
    });

    return () => {
      socket.off("receive-message");
      socket.off("user-joined");
      socket.off("user-typing");
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setIsJoined(true);
      socket.emit("user-joined", username);
    }
  };

  const handleSendMessage = (message) => {
    if (message.trim()) {
      socket.emit("send-message", {
        username: username,
        message: message,
      });
    }
  };

  const handleTyping = () => {
    socket.emit("typing", username);
  };

  if (!isJoined) {
    return (
      <div className="join-container">
        <div className="join-box">
          <h1>💬 Group Chat</h1>
          <p>Enter your name to join</p>
          <form onSubmit={handleJoin}>
            <input
              type="text"
              placeholder="Your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
            <button type="submit">Join Chat</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Group Chat</h2>
        <span className="online-badge">🟢 {onlineUsers} online</span>
      </div>

      <MessageList
        messages={messages}
        currentUsername={username}
        typingUser={typingUser}
      />

      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
}

export default ChatBox;
