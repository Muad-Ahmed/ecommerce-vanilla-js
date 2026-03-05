const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");

    if (req.method !== "GET") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const sessionId = req.query.session_id;
    if (!sessionId) {
        return res.status(400).json({ error: "Missing session_id query parameter" });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ error: "Stripe not configured" });
    }

    try {
        // Retrieve the Checkout Session directly from Stripe — no local DB needed.
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (!session) {
            return res.status(404).json({ status: "not_found" });
        }

        const isPaid =
            session.payment_status === "paid" || session.status === "complete";

        return res.status(200).json({
            status: isPaid ? "paid" : "pending",
            amount: session.amount_total ? session.amount_total / 100 : null,
            currency: session.currency || "usd",
        });
    } catch (err) {
        console.error("Stripe order-status lookup error:", err.message);
        return res.status(500).json({ error: err.message });
    }
};
