const POLLINATIONS_URL = "https://text.pollinations.ai/";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  const apiKey = process.env.POLLINATIONS_API_KEY?.trim();
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing POLLINATIONS_API_KEY." });
  }

  const prompt = req.body?.prompt?.trim();
  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const upstream = await fetch(POLLINATIONS_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "claude",
        private: true,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const text = await upstream.text();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: text || `Pollinations request failed with status ${upstream.status}.`,
      });
    }

    return res.status(200).json({ text });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return res.status(500).json({ error: message });
  }
}
