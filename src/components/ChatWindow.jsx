// src/components/ChatWindow.jsx
import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";
import SlidePreview from "./SlidePreview";
import { generateSlideData } from "../services/gemini";
import pptxgen from "pptxgenjs";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hi! I'm IAG AI. Tell me how many slides you want (e.g. *“3 slides on climate change”*).",
    },
  ]);
  const [input, setInput] = useState("");
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, slides]);

  const extractCount = (text) => {
    const match = text.match(/(\d+)\s*slides?/i);
    return match ? Math.max(1, Math.min(20, parseInt(match[1], 10))) : 5;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userPrompt = input.trim();
    const userMsg = { sender: "user", text: userPrompt };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const requestedCount = extractCount(userPrompt);

    try {
      const data = await generateSlideData(userPrompt, requestedCount);
      const actualCount = data.slides?.length || 0;

      setSlides(data.slides || []);

      const aiText =
        actualCount === requestedCount
          ? `Here are your **${actualCount} slides** on **"${userPrompt.replace(/^\d+\s*slides?\s*/i, "")}"**!`
          : `Warning: Generated **${actualCount} slides** (you asked for ${requestedCount}).`;

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiText,
          slides: data.slides || [],
          prompt: userPrompt,
          count: actualCount,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (msg) => {
    setLoading(true);
    try {
      const data = await generateSlideData(msg.prompt, msg.count);
      const newSlides = data.slides || [];
      setSlides(newSlides);

      // Replace the old AI message
      setMessages((prev) =>
        prev.map((m) =>
          m === msg
            ? {
                ...m,
                text: `Regenerated: **${newSlides.length} slides** on **"${msg.prompt.replace(/^\d+\s*slides?\s*/i, "")}"**!`,
                slides: newSlides,
              }
            : m
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m === msg ? { ...m, text: `Regenerate failed: ${err.message}` } : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
    alert("Prompt copied to clipboard!");
  };

  const handleClear = () => {
    setMessages([
      {
        sender: "ai",
        text: "Chat cleared. Start a new presentation!",
      },
    ]);
    setSlides([]);
  };

  const handleGeneratePPT = () => {
    const pptx = new pptxgen();
    pptx.layout = "LAYOUT_WIDE";

    slides.forEach((s, i) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };

      slide.addText(`Slide ${i + 1}`, {
        x: 0.3, y: 0.2, w: 1, h: 0.4,
        fontSize: 11, color: "4285F4", bold: true,
      });

      slide.addText(s.title, {
        x: 0.5, y: 0.7, w: 8.5,
        fontSize: 28, bold: true, color: "1A237E",
      });

      s.content.forEach((line, j) => {
        slide.addText(`• ${line}`, {
          x: 0.8, y: 1.6 + j * 0.5, w: 8,
          fontSize: 18, color: "333333", bullet: true,
        });
      });

      if (s.notes) {
        slide.addText(`Notes: ${s.notes}`, {
          x: 0.5, y: 4.8, w: 8.5,
          fontSize: 11, italic: true, color: "666666",
        });
      }
    });

    pptx.writeFile({
      fileName: `IAG_Slides_${new Date().toISOString().slice(0, 10)}.pptx`,
    });
  };

  return (
    <div className="chat-window">
      <div className="messages-container">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.sender}`}>
            <div className="bubble">
              {/* User message */}
              {m.sender === "user" && (
                <div dangerouslySetInnerHTML={{ __html: m.text }} />
              )}

              {/* AI message with slides */}
              {m.sender === "ai" && m.slides && (
                <>
                  <div dangerouslySetInnerHTML={{ __html: m.text }} />
                  <div className="slide-preview-inline">
                    <SlidePreview slides={m.slides} />
                  </div>
                  <div className="ai-actions">
                    <button
                      onClick={() => handleRegenerate(m)}
                      className="action-btn regenerate"
                      disabled={loading}
                    >
                      Regenerate
                    </button>
                    <button
                      onClick={() => handleCopyPrompt(m.prompt)}
                      className="action-btn copy"
                    >
                      Copy Prompt
                    </button>
                    <button
                      onClick={handleGeneratePPT}
                      className="action-btn download"
                    >
                      Download PPTX
                    </button>
                  </div>
                </>
              )}

              {/* AI error or plain text */}
              {m.sender === "ai" && !m.slides && (
                <div dangerouslySetInnerHTML={{ __html: m.text }} />
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai">
            <div className="bubble">
              <div className="typing">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-container">
        <input
          type="text"
          placeholder="e.g., '4 slides on AI ethics'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={loading}
        />
        <button onClick={handleSend} disabled={loading} className="send-btn">
          {loading ? "Generating…" : "Generate"}
        </button>
        <button onClick={handleClear} className="clear-btn">
          Clear
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;