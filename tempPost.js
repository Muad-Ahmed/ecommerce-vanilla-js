const http = require("http");
const data = JSON.stringify({ cartItems: [] });
const req = http.request(
  {
    hostname: "localhost",
    port: 3000,
    path: "/api/create-checkout-session",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  },
  (res) => {
    console.log("status", res.statusCode);
    let body = "";
    res.on("data", (d) => (body += d));
    res.on("end", () => console.log("body", body));
  },
);
req.on("error", (e) => console.error("err", e));
req.write(data);
req.end();
