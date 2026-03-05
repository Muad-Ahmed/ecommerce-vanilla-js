// This file is intentionally left as a no-op.
// Vercel uses file-based routing: each file in /api is its own serverless function.
// The previous serverless-http wrapper is no longer needed and was causing conflicts.
// Routes handled by individual files:
//   POST /api/create-checkout-session  → api/create-checkout-session.js
//   POST /api/webhook                  → api/webhook.js
