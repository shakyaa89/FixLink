// AI controller for chat and verification features
import axios from "axios";
import User from "../models/user.model.js";

const PROVIDER_INTENT_REGEX =
  /\b(list|show|find|recommend|suggest|get|nearby|available)\b.*\b(service provider|service providers|provider|providers|plumber|electrician|carpenter|painter|landscaper|repair)\b|\b(service provider|service providers|provider|providers|plumber|electrician|carpenter|painter|landscaper|repair)\b.*\b(list|show|find|recommend|suggest|get|nearby|available)\b/i;

// Check if user message asks for provider list
const isListProviderIntent = (message) => {
  if (typeof message !== "string") {
    return false;
  }

  return PROVIDER_INTENT_REGEX.test(message.trim());
};

// Build a plain text provider response
const formatProviderReply = (providers, city) => {
  if (!providers.length) {
    if (city) {
      return `I could not find verified service providers in ${city} right now.`;
    }

    return "I could not find verified service providers right now.";
  }

  const providerLines = providers.map((provider, index) => {
    const category = provider.providerCategory || "General Repairs";
    const rating =
      typeof provider.ratingAverage === "number" && provider.ratingAverage > 0
        ? `, rating ${provider.ratingAverage.toFixed(1)}`
        : "";

    return `${index + 1}. ${provider.fullName} (${category}${rating})`;
  });

  return providerLines.join(" ");
};

// Convert chat history to Gemini contents format
const buildContents = (history, message) => {
  const safeHistory = Array.isArray(history) ? history : [];
  // Keep only recent turns to limit token usage.
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

// Handle AI chat response for app users
export async function chatWithAi(req, res) {
  try {
    // Read current message and optional chat history.
    const { message, history } = req.body || {};
    const userMessage = typeof message === "string" ? message.trim() : "";

    // Stop when message text is empty.
    if (!userMessage) {
      return res.status(400).json({ message: "Message is required" });
    }

    if (isListProviderIntent(userMessage)) {
      // Handle provider listing locally without calling Gemini.
      // Prefer providers from the same city if available.
      const city = req.user?.city ? String(req.user.city) : "";
      const query = {
        role: "serviceProvider",
        verificationStatus: "verified",
      };

      if (city) {
        query.city = city;
      }

      const providers = await User.find(query)
        .select("fullName providerCategory city ratingAverage profilePicture")
        .sort({ ratingAverage: -1, createdAt: -1 })
        .limit(5)
        .lean();

      const reply = formatProviderReply(providers, city);

      // Return early for local provider-list intent.
      return res.status(200).json({
        reply,
      });
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
      "Generate only plain text no markdown or other formattings, Keep answers concise, friendly, and professional. Do not give users any fake service providers if asked" +
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
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`, payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.data;

    // Fallback reply when Gemini has no text output.
    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "I could not generate a response right now. Please try again.";

    // off-topic fallback.
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

// Verify service provider document using AI
export async function verifyServiceProvider(req, res) {
  try {
    // Read submitted document URL and declared category.
    const { verificationProofURL, category } = req.body;

    // Extract text first, then verify with Gemini.
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

    // Ask Gemini to validate category vs. document text.
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    // Return plain verification result.
    return res.status(201).json({ reply: reply.trim() })

  } catch (error) {
    if (error.response) {
      console.log("AI verify provider error:", error.response.data);
      return res.status(502).json({ message: "AI service error" });
    }

    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}

// Extract text from image URL using OCR API
async function extractTextFromImage(imageUrl) {
  // Read OCR API key from environment.
  const apiKey = process.env.OCR_SPACE_API_KEY;

  try {
    // Run OCR using image URL input.
    const response = await axios.get("https://api.ocr.space/parse/imageurl", {
      params: {
        apikey: apiKey,
        url: imageUrl,
        language: "eng",
        isOverlayRequired: false
      }
    });

    const result = response.data;
    // Return extracted text when OCR finds any.
    if (
      result.ParsedResults &&
      result.ParsedResults.length > 0 &&
      result.ParsedResults[0].ParsedText
    ) {
      return result.ParsedResults[0].ParsedText;
    } else {
      // Return empty text on no OCR match.
      return "";
    }
  } catch (error) {
    console.error("OCR extraction failed:", error);
    return "";
  }
}

// Verify job title, description, and price using AI
export async function verifyJob(req, res) {
  try {
    // Read job fields that need validation.
    const { title, description, userPrice } = req.body;

    const prompt = `
      You are FixLink’s AI Job Verification Assistant. Your task is to verify whether a job posted by a user is valid. You will be given a job title, job description, and the price provided by the user in Nepali Rupees. The job must belong to one of the supported categories: Plumbing, Electrical, Carpentry, Painting, Landscaping, or General Repairs. Check that the job title and description clearly describe a realistic service task and that they match each other. Also verify that the price entered by the user is valid; the price must be 500 NPR or higher, and any price below 500 NPR should be considered invalid. If all the provided fields are correct and meet these requirements, reply only with VALID. If any field is incorrect, unclear, unsupported, or the price is below 500 NPR, respond with a single-line explanation describing why the job is not valid so the user can understand and correct it.

      Job Title:
      ${title}

      Job Description:
      ${description}

      User Price:
      ${userPrice}
      `;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ]
    };

    // Ask Gemini to validate scope and minimum price.
    const response = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    // Return AI decision text directly.
    return res.status(201).json({ reply: reply.trim() })

  } catch (error) {
    if (error.response) {
      console.log("AI verify job error:", error.response.data);
      return res.status(502).json({ message: "AI service error" });
    }

    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
}
