export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(200).end(); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Method not allowed" }); return; }

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) { res.status(500).json({ error: "Stripe secret key not configured" }); return; }

  const { tier, priceId, email } = req.body;

  if (!priceId || !priceId.startsWith("price_")) {
    res.status(400).json({ error: "Invalid price ID" }); return;
  }

  try {
    const params = new URLSearchParams({
      "payment_method_types[]": "card",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      "mode": tier === "federal" ? "payment" : "subscription",
      "success_url": "https://fed-prep.vercel.app?session_id={CHECKOUT_SESSION_ID}&upgraded=true",
      "cancel_url": "https://fed-prep.vercel.app?upgrade=cancelled",
    });

    if (email) params.append("customer_email", email);

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const data = await stripeRes.json();
    if (!stripeRes.ok) { res.status(500).json({ error: data.error?.message || "Stripe error" }); return; }

    res.status(200).json({ url: data.url });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
