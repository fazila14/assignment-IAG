import React from "react";
import ChatWindow from "./components/ChatWindow";
import "./App.css";

function App() {
  return (
    <div className="app-container">
      <header className="header">
        <h1>IAG AI</h1>
        <p>Generate professional PowerPoint slides in seconds with AI</p>
      </header>
      <main className="main-content">
        <ChatWindow />
      </main>
      <footer className="footer">
        <p>Powered by Gemini 2.0 Flash • Free Tier: 250 requests/day</p>
      </footer>
    </div>
  );
}

export default App;