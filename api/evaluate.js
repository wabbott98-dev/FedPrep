export default async function handler(req, res) {
  // Allow CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const { question, competency, format, response } = req.body;

  if (!question || !response) {
    res.status(400).json({ error: "Missing question or response" });
    return;
  }

  const systemPrompt = `You are a federal law enforcement interview coach with 20+ years evaluating CBP, USDA, and Border Patrol oral board panels. Return ONLY valid JSON, no markdown, no preamble.
SCORING (1-5 each): structure, relevance, specificity, competency_alignment, professionalism.
RULES: Flag missing STAR components, vague language, blame toward supervisors, "we did" without personal ownership.
Return ONLY: {"scores":{"structure":0,"relevance":0,"specificity":0,"competency_alignment":0,"professionalism":0},"total":0,"strengths":[],"improvements":[],"suggested_answer":"","flags":[],"next_tip":""}`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: "user",
          content: `QUESTION: ${question}\nCOMPETENCY: ${competency}\nFORMAT: ${format}\nRESPONSE: ${response}\n\nScore this and return JSON only.`
        }]
      })
    });

    const data = await anthropicRes.json();
    if (!anthropicRes.ok) {
      res.status(500).json({ error: `Anthropic error: ${data.error?.message || "Unknown"}` });
      return;
    }

    const raw = data.content.map(b => b.text || "").join("");
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    res.status(200).json(parsed);

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
