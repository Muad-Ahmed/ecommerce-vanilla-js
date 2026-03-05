const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const fs = require("fs");
const path = require("path");

// Utility to load products from JSON
function loadProducts() {
  const productsPath = path.join(process.cwd(), "public", "products.json");
  return JSON.parse(fs.readFileSync(productsPath, "utf-8"));
}

// Utility to save orders to JSON
function saveOrder(order) {
  const ordersFile = path.join(process.cwd(), "data", "orders.json");
  if (!fs.existsSync(path.dirname(ordersFile))) {
    fs.mkdirSync(path.dirname(ordersFile), { recursive: true });
  }
  let orders = [];
  try {
    orders = JSON.parse(fs.readFileSync(ordersFile, "utf-8"));
  } catch (err) {}
  orders.push(order);
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end("Method Not Allowed");
  }

  try {
    const { cartItems } = req.body || {};
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      throw new Error("cartItems must be a non-empty array");
    }

    const PRODUCTS = loadProducts();

    const lineItems = cartItems.map((item) => {
      const product = PRODUCTS.find(
        (p) => Number(p.id) === Number(item.productId),
      );
      if (!product)
        throw new Error(`Product with ID ${item.productId} not found`);

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [
              product.img.startsWith(".")
                ? product.img.replace(/^\./, "")
                : product.img,
            ],
          },
          unit_amount: product.price * 100,
        },
        quantity: item.quantity,
      };
    });

    const deploymentOrigin = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `${req.headers["x-forwarded-proto"] || "http"}://${req.headers.host}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: lineItems,
      success_url: `${deploymentOrigin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${deploymentOrigin}/cancel.html`,
    });

    const newOrder = {
      id: `order_${Date.now()}`,
      sessionId: session.id,
      amount:
        lineItems.reduce(
          (sum, li) => sum + li.price_data.unit_amount * li.quantity,
          0,
        ) / 100,
      currency: "usd",
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    saveOrder(newOrder);

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session:", err);
    res.status(500).json({ error: err.message });
  }
};
