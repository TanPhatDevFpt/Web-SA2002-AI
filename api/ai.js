export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { messages } = req.body;

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.API_KEY}`,
          "HTTP-Referer": "https://web-sa-2002-ai.vercel.app",
          "X-Title": "SA2002 AI Chat"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: messages
        })
      }
    );

    const data = await response.json();
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
}
