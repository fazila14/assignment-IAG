import React from "react";

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";
  return (
    <div
      style={{
        textAlign: isUser ? "right" : "left",
        margin: "10px 0",
      }}
    >
      <div
        style={{
          display: "inline-block",
          background: isUser ? "#0078FF" : "#EAEAEA",
          color: isUser ? "white" : "black",
          padding: "10px 15px",
          borderRadius: "10px",
          maxWidth: "70%",
        }}
      >
        {message.text}
      </div>
    </div>
  );
};

export default MessageBubble;
