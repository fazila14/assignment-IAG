import React from "react";

const MessageBubble = ({ message }) => {
  const isUser = message.sender === "user";

  return (
    <div className={`message ${isUser ? "user" : "ai"}`}>
      <div className="bubble">
        {message.slides ? (
          <>
            <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
            <div className="mini-preview">
              {message.slides.slice(0, 3).map((s, i) => (
                <div key={i} className="mini-slide">
                  <strong>{s.title}</strong>
                  <ul>{s.content.slice(0, 2).map((c, j) => <li key={j}>{c}</li>)}</ul>
                </div>
              ))}
              {message.slides.length > 3 && <div className="more">+{message.slides.length - 3} more</div>}
            </div>
          </>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        )}
      </div>
    </div>
  );
};

export default MessageBubble;