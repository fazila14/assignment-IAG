import axios from "axios";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-05-06:generateContent";

export const generateSlideData = async (prompt, apiKey) => {
  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("Gemini API raw response:", response.data);

    const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No text content in response");

    // Expect JSON output
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API error:", error.response?.data || error.message);
    return null;
  }
};
