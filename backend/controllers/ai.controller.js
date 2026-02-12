const ALLOWED_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Carpentry",
  "Painting",
  "Landscaping",
  "General Repairs",
];

const buildContents = (history, message) => {
  const safeHistory = Array.isArray(history) ? history : [];
  const trimmedHistory = safeHistory.slice(-10);

  const contents = trimmedHistory
    .map((item) => {
      if (!item || typeof item.content !== "string") {
        return null;
      }

      const role = item.role === "assistant" ? "model" : "user";
      return { role, parts: [{ text: item.content }] };
    })
    .filter(Boolean);

  contents.push({ role: "user", parts: [{ text: message }] });

  return contents;
};

export async function chatWithAi(req, res) {
  try {
    const { message, history } = req.body || {};
    const userMessage = typeof message === "string" ? message.trim() : "";

    if (!userMessage) {
      return res.status(400).json({ message: "Message is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "Gemini API key not configured" });
    }

    const systemPrompt =
      "You are FixLink's AI support assistant. Only answer questions about home service categories " +
      "Plumbing, Electrical, Carpentry, Painting, Landscaping, and General Repairs. " +
      "Generate only plain text no markdown or other formattings, Keep answers concise, friendly, and professional" +
      "If the user asks about anything else, reply exactly: I can help only with home service questions in these categories: Plumbing, Electrical, Carpentry, Painting, Landscaping, and General Repairs. Please ask about one of these."

    const payload = {
      contents: [
        {
          // acts like a system message
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        ...buildContents(history, userMessage),
      ],
      generationConfig: {
        temperature: 0.4,
        topP: 0.9,
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.log("Gemini API error:", errorText);
      return res.status(502).json({ message: "AI service error" });
    }

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I could not generate a response right now. Please try again.";

    const offTopic = reply === "I can help only with home service questions in these categories: Plumbing, Electrical, Carpentry, Painting, Landscaping, and General Repairs. Please ask about one of these.";

    return res.status(200).json({ reply, offTopic });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}
