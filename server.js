require("dotenv").config();
const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const path = require("path");

const app = express();

app.use((req, res, next) => {
  if (req.url.startsWith("/api/")) {
    req.url = req.url.slice(4); // remove "/api"
  }
  next();
});

if (!process.env.VERCEL) {
  app.use(express.static(path.join(__dirname, "public")));
  // also serve root (including html subfolder) and provide explicit html directory
  app.use(express.static(path.join(__dirname, "/")));
  app.use(express.static(path.join(__dirname, "html")));
}

// Redirect old root URLs to the new html directory so bookmarks/links still work
[
  "/checkout.html",
  "/favorites.html",
  "/productDetails.html",
  "/search.html",
].forEach((route) => {
  app.get(route, (req, res) => {
    res.redirect("/html" + req.path);
  });
});

// Webhook Route (Optional)
app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("✅ Payment confirmed via Webhook:", session.id);

    // Update order status
    let orders = [];
    try {
      orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
    } catch (err) {}

    const order = orders.find((o) => o.sessionId === session.id);
    if (order) {
      order.status = "paid";
      fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
      console.log("Order marked as paid:", order.id);
    }
  }

  res.json({ received: true });
});

// Middleware
app.use(express.json());
app.use(cors());

// Paths
const productsPath = path.join(__dirname, "public", "products.json");
const PRODUCTS = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

const ordersFile = path.join(__dirname, "data/orders.json");
if (!fs.existsSync(path.join(__dirname, "data")))
  fs.mkdirSync(path.join(__dirname, "data"));
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, "[]");

// Helper: Save order
function saveOrder(order) {
  let orders = [];
  try {
    orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
  } catch (err) {}
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

// Checkout Session Route
app.post("/create-checkout-session", async (req, res) => {
  try {
    const cartItems = req.body.cartItems || req.body.items || [];
    if (!Array.isArray(cartItems) || cartItems.length === 0)
      throw new Error("cartItems must be a non-empty array");

    const lineItems = cartItems.map((item, idx) => {
      const rawId = item?.productId ?? item?.id ?? item?.productID;
      const productIdNum = Number(rawId);
      const product = PRODUCTS.find((p) => Number(p.id) === productIdNum);
      if (!product) throw new Error("Product with ID " + rawId + " not found");

      // Build absolute image URL for Stripe
      let imagePath = product.img || "";

      if (imagePath.startsWith(".")) imagePath = imagePath.replace(/^\./, "");
      // build the origin dynamically;
      const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : req.protocol + "://" + req.get("host");
      const absoluteImageUrl = origin + imagePath;

      const fallbackImageUrl =
        "https://placehold.co/300x300?text=Product+Image";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [absoluteImageUrl || fallbackImageUrl],
          },
          unit_amount: product.price * 100,
        },
        quantity: Number(item.quantity) || 1,
      };
    });

    const deploymentOrigin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${deploymentOrigin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${deploymentOrigin}/cancel.html`,
    });

    // Save order immediately (Demo mode without Webhook)
    const newOrder = {
      id: `order_${Date.now()}`,
      sessionId: session.id,
      amount: lineItems.reduce(
        (sum, li) => sum + (li.unit_amount / 100) * li.quantity,
        0,
      ),
      currency: "usd",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveOrder(newOrder);

    res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Order Status Route
app.get("/order-status", async (req, res) => {
  const sessionId = req.query.session_id;
  if (!sessionId) return res.status(400).json({ error: "Missing session_id" });

  let orders = [];
  try {
    orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
  } catch (err) {}

  const order = orders.find((o) => o.sessionId === sessionId);
  if (order) {
    return res.json({
      status: order.status,
      amount: order.amount,
      createdAt: order.createdAt,
    });
  }

  // If the order isn't in the local JSON (ephemeral on serverless), try
  // fetching the Checkout Session from Stripe as a fallback.
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(404).json({ status: "not_found" });
  }

  try {
    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (
      stripeSession &&
      (stripeSession.payment_status === "paid" ||
        stripeSession.status === "complete")
    ) {
      // Persist a minimal order record for demo purposes
      const newOrder = {
        id: `order_${Date.now()}`,
        sessionId: sessionId,
        amount: stripeSession.amount_total
          ? stripeSession.amount_total / 100
          : null,
        currency: stripeSession.currency || "usd",
        status: "paid",
        createdAt: new Date().toISOString(),
      };
      try {
        saveOrder(newOrder);
      } catch (e) {}

      return res.json({
        status: "paid",
        amount: newOrder.amount,
        createdAt: newOrder.createdAt,
      });
    }

    return res.status(404).json({ status: "not_found" });
  } catch (err) {
    console.error(
      "Stripe lookup error:",
      err && err.message ? err.message : err,
    );
    return res.status(500).json({ error: err.message || String(err) });
  }
});

// --- export/app startup ---

if (require.main === module) {
  app.listen(3000, () => console.log("Server running on port 3000"));
}

module.exports = app;
