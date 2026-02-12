import React, { useEffect, useRef } from "react";

function MessageList({ messages, currentUsername, typingUser }) {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="message-list">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`message ${
            msg.isSystem
              ? "system-message"
              : msg.username === currentUsername
                ? "sent"
                : "received"
          }`}
        >
          {!msg.isSystem && (
            <>
              <div className="message-header">
                <span className="username">{msg.username}</span>
                <span className="timestamp">{formatTime(msg.timestamp)}</span>
              </div>
              <div className="message-text">{msg.message}</div>
            </>
          )}
          {msg.isSystem && <div className="system-text">{msg.message}</div>}
        </div>
      ))}

      {typingUser && (
        <div className="typing-indicator">
          <span>{typingUser} is typing</span>
          <span className="dots">...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

export default MessageList;
