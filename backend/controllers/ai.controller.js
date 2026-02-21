import axios from "axios";

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

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log(response)

    const data = await response.data;

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I could not generate a response right now. Please try again.";

    const offTopic = reply === "I can help only with home service questions in these categories: Plumbing, Electrical, Carpentry, Painting, Landscaping, and General Repairs. Please ask about one of these.";

    return res.status(200).json({ reply, offTopic });
  } catch (error) {
    if (error.response) {
      console.log("Gemini API error:", error.response.data);
      return res.status(502).json({ message: "AI service error" });
    }

    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

export async function verifyServiceProvider(req, res) {
  try {
    const { verificationProofURL, category } = req.body;

    const extractedText = await extractTextFromImage(verificationProofURL);

    const prompt = `
      You are FixLink's AI verification assistant.
      Your task is to verify service providers.
      Supported categories: Plumbing, Electrical, Carpentry, Painting, Landscaping, and General Repairs.

      You will be given the text extracted from a service provider’s license and their declared category.
      Determine if the license matches the declared category.
      if the document is valid then reply with: PROPER
      if the document is not valid then reply with why the document is not valid in 1 line for the users to see.

      Extracted License Text:
      ${extractedText}

      Declared Category:
      ${category}
      `;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ]
    };

    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    return res.status(201).json({ reply: reply.trim() })

  } catch (error) {

  }
}


async function extractTextFromImage(imageUrl) {
  const apiKey = process.env.OCR_SPACE_API_KEY;

  try {
    const response = await axios.get("https://api.ocr.space/parse/imageurl", {
      params: {
        apikey: apiKey,
        url: imageUrl,
        language: "eng",
        isOverlayRequired: false
      }
    });

    const result = response.data;
    if (
      result.ParsedResults &&
      result.ParsedResults.length > 0 &&
      result.ParsedResults[0].ParsedText
    ) {
      return result.ParsedResults[0].ParsedText;
    } else {
      return "";
    }
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return "";
  }
}