export const chat = async (req, res) => {
  const message = String(req.body.message || "").trim();

  if (!message || message.length > 8000) {
    return res.status(400).json({
      message: "Please provide a valid question under 8,000 characters",
    });
  }

  if (!process.env.AI_API_KEY) {
    return res.status(503).json({
      message:
        "AI service is not configured yet. Add AI_API_KEY on the server to enable it.",
    });
  }

  const provider = (process.env.AI_PROVIDER || "groq").toLowerCase();

  if (provider !== "groq") {
    return res.status(501).json({
      message: `The ${provider} adapter has not been configured yet.`,
    });
  }

  const history = Array.isArray(req.body.history)
    ? req.body.history
        .slice(-10)
        .map((item) => ({
          role: item?.role === "assistant" ? "assistant" : "user",
          content: String(item?.content || "").slice(0, 8000),
        }))
        .filter((item) => item.content)
    : [];

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "llama-3.1-8b-instant",

          messages: [
            {
              role: "system",
              content:
                "You are a concise, helpful developer learning assistant. Explain concepts clearly, help debug code, and put code examples in fenced Markdown blocks. Never claim to have run code you have not run.",
            },

            ...history,

            {
              role: "user",
              content: message,
            },
          ],

          temperature: 0.7,
          max_tokens: 1000,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Groq response error:",
        data?.error?.message || response.status
      );

      return res.status(502).json({
        message:
          data?.error?.message ||
          "The AI service is temporarily unavailable. Please try again.",
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(502).json({
        message:
          "The AI service returned an empty response. Please try again.",
      });
    }

    return res.json({
      reply,
    });
  } catch (error) {
    console.error("Groq request failed:", error.message);

    return res.status(502).json({
      message: "Unable to reach the AI service. Please try again.",
    });
  }
};