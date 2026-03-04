const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const path = require("path");

// utility that reads the products JSON and ensures the data folder exists
function loadProducts() {
  const productsPath = path.join(process.cwd(), "public", "products.json");
  return JSON.parse(fs.readFileSync(productsPath, "utf-8"));
}

function ensureOrdersFile() {
  const ordersDir = path.join(process.cwd(), "data");
  const ordersFile = path.join(ordersDir, "orders.json");
  if (!fs.existsSync(ordersDir)) {
    fs.mkdirSync(ordersDir, { recursive: true });
  }
  if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, "[]");
  }
  return ordersFile;
}

function saveOrder(order) {
  const ordersFile = ensureOrdersFile();
  let orders = [];
  try {
    orders = JSON.parse(fs.readFileSync(ordersFile, "utf8"));
  } catch (err) {
    orders = [];
  }
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const body = req.body || {};
    const cartItems = body.cartItems || body.items || [];
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("cartItems must be a non-empty array");
    }

    const PRODUCTS = loadProducts();

    const lineItems = cartItems.map((item) => {
      const rawId = item?.productId ?? item?.id ?? item?.productID;
      const productIdNum = Number(rawId);
      const product = PRODUCTS.find((p) => Number(p.id) === productIdNum);
      if (!product) throw new Error("Product with ID " + rawId + " not found");

      let imagePath = product.img || "";
      if (imagePath.startsWith(".")) imagePath = imagePath.replace(/^\./, "");

      const origin = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;
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
      : `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${deploymentOrigin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${deploymentOrigin}/cancel.html`,
    });

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

    return res.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err.message || err);
    return res.status(500).json({ error: err.message || String(err) });
  }
};
