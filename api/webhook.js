const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const getRawBody = require("raw-body");
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  const sig = req.headers["stripe-signature"];
  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res
      .status(400)
      .json({ error: "Missing Stripe signature or webhook secret" });
  }

  let buf;
  try {
    buf = await getRawBody(req);
  } catch (err) {
    console.error("Error reading raw body:", err);
    return res.status(400).send(`Error reading body: ${err.message}`);
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Path to orders file (project root)
  const ordersFile = path.join(process.cwd(), "data", "orders.json");
  if (!fs.existsSync(path.dirname(ordersFile))) {
    try {
      fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
    } catch (e) {}
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Webhook: checkout.session.completed for", session.id);

    let orders = [];
    try {
      orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
    } catch (err) {
      orders = [];
    }

    const order = orders.find((o) => o.sessionId === session.id);
    if (order) {
      order.status = "paid";
      try {
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
        console.log("Order marked as paid:", order.id || order.sessionId);
      } catch (err) {
        console.error("Failed to write orders file:", err);
      }
    } else {
      // If order doesn't exist locally, add a minimal record (demo only)
      const newOrder = {
        id: `order_${Date.now()}`,
        sessionId: session.id,
        amount: session.amount_total ? session.amount_total / 100 : null,
        currency: session.currency || "usd",
        status: "paid",
        createdAt: new Date().toISOString(),
      };
      orders.push(newOrder);
      try {
        fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
        console.log("New order saved from webhook:", newOrder.id);
      } catch (err) {
        console.error("Failed to write new order to file:", err);
      }
    }
  }

  res.json({ received: true });
};
