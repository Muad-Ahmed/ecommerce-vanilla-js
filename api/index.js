// This file runs on Vercel as a serverless function. It reuses the express
// app defined in the root `server.js` file and wraps it with
// `serverless-http` so that Vercel can invoke it.

const serverless = require("serverless-http");
const app = require("../server");

// tell serverless-http that the function is mounted at /api, so it will
// adjust the request path accordingly. this mirrors the local prefix-stripping
// middleware in server.js and keeps both environments consistent.
module.exports = serverless(app, { basePath: "/api" });
