const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const path = require("path");
const fs = require("fs");

// Load products from the bundled JSON at cold-start
const productsPath = path.join(process.cwd(), "public", "products.json");
const PRODUCTS = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

module.exports = async (req, res) => {
  // Allow CORS preflight
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: "Stripe secret key is not configured" });
  }

  try {
    const { cartItems } = req.body || {};
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ error: "cartItems must be a non-empty array" });
    }

    const lineItems = cartItems.map((item) => {
      const product = PRODUCTS.find(
        (p) => Number(p.id) === Number(item.productId)
      );
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      // Build absolute image URL for Stripe (must be https)
      let imgPath = product.img || "";
      if (imgPath.startsWith(".")) imgPath = imgPath.replace(/^\./, "");

      // Prefer the stable production URL over the per-deployment preview URL
      const origin =
        process.env.VERCEL_PROJECT_PRODUCTION_URL
          ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
          : process.env.VERCEL_URL
            ? `https://${process.env.VERCEL_URL}`
            : `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

      const imageUrl = imgPath
        ? `${origin}${imgPath}`
        : "https://placehold.co/300x300?text=Product";

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [imageUrl],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: Number(item.quantity) || 1,
      };
    });

    // Determine the base URL for success/cancel redirects
    const baseUrl =
      process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${baseUrl}/public/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/public/cancel.html`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err.message);
    return res.status(500).json({ error: err.message });
  }
};
