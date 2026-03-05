const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// IMPORTANT: Vercel must NOT parse the body before we receive it,
// because Stripe signature verification requires the raw bytes.
// This config disables Vercel's automatic body parsing for this route only.
module.exports.config = {
  api: {
    bodyParser: false,
  },
};

/** Collect the raw request body as a Buffer. */
function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET env vars");
    return res.status(500).json({ error: "Webhook not configured" });
  }

  const sig = req.headers["stripe-signature"];
  if (!sig) {
    return res.status(400).json({ error: "Missing stripe-signature header" });
  }

  let buf;
  try {
    buf = await getRawBody(req);
  } catch (err) {
    console.error("Error reading raw body:", err);
    return res.status(400).json({ error: `Error reading body: ${err.message}` });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle events
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ Webhook: checkout.session.completed for", session.id);
      // NOTE: Vercel serverless functions have an ephemeral/read-only filesystem.
      // Persist order data in a real database (e.g. Vercel KV, Supabase, PlanetScale).
      // For now we just log — the success page reads the session status directly from Stripe.
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return res.status(200).json({ received: true });
};
