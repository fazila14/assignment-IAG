import React, { useState } from "react";
import MessageBubble from "./MessageBubble";
import SlidePreview from "./SlidePreview";
import { generateSlideData } from "../../services/gemini";
import pptxgen from "pptxgenjs";

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_KEY = "AIzaSyDf_-o706fzZ3YfA_QshseObM4yvaI9jug"; // Replace with your key

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const aiPrompt = `
      Generate structured JSON for PowerPoint slides.
      Format:
      {
        "slides": [
          {
            "title": "string",
            "content": ["point1", "point2"]
          }
        ]
      }

      User request: ${input}
    `;

    const data = await generateSlideData(aiPrompt, API_KEY);

    if (data && data.slides) {
      setSlides(data.slides);
      const aiMsg = { sender: "ai", text: "Slides generated successfully!" };
      setMessages((prev) => [...prev, aiMsg]);
    } else {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Failed to generate slides." },
      ]);
    }

    setLoading(false);
  };

  const handleGeneratePPT = () => {
    const pptx = new pptxgen();

    slides.forEach((slide) => {
      const s = pptx.addSlide();
      s.addText(slide.title, { x: 0.5, y: 0.5, fontSize: 24, bold: true });
      slide.content.forEach((line, i) => {
        s.addText(`• ${line}`, { x: 0.8, y: 1 + i * 0.6, fontSize: 18 });
      });
    });

    pptx.writeFile("AI_Presentation.pptx");
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((m, i) => (
          <MessageBubble key={i} message={m} />
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="Ask AI to make slides..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? "Generating..." : "Send"}
        </button>
      </div>

      {slides.length > 0 && (
        <div className="preview-section">
          <h3>Slide Preview</h3>
          <SlidePreview slides={slides} />
          <button onClick={handleGeneratePPT}>Download PPTX</button>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
