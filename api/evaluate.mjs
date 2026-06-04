export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "API key not configured. Please check Vercel environment variables." });
    return;
  }

  const { question, competency, format, response } = req.body;

  if (!question || !response) {
    res.status(400).json({ error: "Missing question or response" });
    return;
  }

  const systemPrompt = `You are a federal law enforcement interview coach with 20+ years experience evaluating candidates for competitive federal positions. You evaluate responses using the STAR method (Situation, Task, Action, Result).

SCORING (1-5 each): structure, relevance, specificity, competency_alignment, professionalism
RULES: Flag missing STAR components, vague language, blame toward supervisors, "we did" without personal accountability.
Return ONLY: {"scores":{"structure":0,"relevance":0,"specificity":0,"competency_alignment":0,"professionalism":0},"overall":0,"feedback":"","strengths":[""],"improvements":[""],"flagged_phrases":[""]}`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",

        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `QUESTION: ${question}\nCOMPETENCY: ${competency}\nFORMAT: ${format}\nRESPONSE: ${response}`
        }]
      })
    });

    const data = await anthropicRes.json();

    if (!anthropicRes.ok) {
      res.status(anthropicRes.status).json({ 
        error: `Anthropic error: ${data.error?.message || "Unknown"}`,
        status: anthropicRes.status
      });
      return;
    }

    const raw = data.content.map(b => b.text || "").join("");
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
