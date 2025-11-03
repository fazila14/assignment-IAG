// src/services/gemini.jsx
const API_KEY = "AIzaSyDC32YWx3zNDjOLLMiNTyh-XTDLSU0Y81w";
const MODEL = "gemini-2.0-flash";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * @param {string} userPrompt - e.g. "2 slides on rainbows"
 * @param {number} slideCount - extracted from prompt
 */
export const generateSlideData = async (userPrompt, slideCount = 5) => {
  const count = Math.max(1, Math.min(20, slideCount)); // clamp 1–20

  const prompt = `
    You are a professional presentation designer.
    Generate **exactly ${count} slides** in strict JSON format.
    Return **only** the JSON, no extra text, no markdown.

    JSON structure:
    {
      "slides": [
        {
          "title": "Slide title (5–8 words)",
          "content": ["Bullet 1", "Bullet 2", "..."],
          "notes": "Optional speaker notes"
        }
      ]
    }

    Topic: ${userPrompt}
    First slide = introduction. Last slide = conclusion.
    Make each slide clear, engaging, and professional.
  `.trim();

  const url = `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 2500,
        responseMimeType: "application/json", // Force JSON
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini ${response.status}: ${err}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  // Try to extract JSON block
  const jsonMatch = raw.match(/```(?:json)?\n?([\s\S]*?)\n?```/) || [null, raw];
  const jsonStr = jsonMatch[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (e) {
    console.error("Invalid JSON from AI:", jsonStr);
    throw new Error("AI returned invalid JSON. Try a clearer prompt.");
  }

  // Final safety: enforce exact count
  if (!Array.isArray(parsed.slides)) {
    throw new Error("No 'slides' array in response");
  }

  if (parsed.slides.length !== count) {
    console.warn(`AI gave ${parsed.slides.length} slides, expected ${count}`);
    // Trim to requested count
    parsed.slides = parsed.slides.slice(0, count);
  }

  return parsed;
};