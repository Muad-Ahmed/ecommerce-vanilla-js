// setup logging to verify script execution
console.log("script.js loaded");

const placeOrderBtn = document.querySelector("#place-order-btn");
const checkoutForm = document.querySelector("#form-contact");

// bind the same handler to the button and the form submission events
if (placeOrderBtn) {
  placeOrderBtn.addEventListener("click", handlePlaceOrder);
}
if (checkoutForm) {
  checkoutForm.addEventListener("submit", handlePlaceOrder);
}

async function handlePlaceOrder(e) {
  e.preventDefault(); // stop any form submission or default action
  e.stopPropagation();
  console.log("place-order-btn clicked");

  // always read the cart, even if empty
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  console.log("raw cart from localStorage", cart);

  // sanitize items - this mirrors backend expectations but won't stop the request
  const cartItems = cart
    .filter(
      (item) => Number.isFinite(Number(item.id)) && Number(item.quantity) > 0,
    )
    .map((item) => ({
      productId: Number(item.id),
      quantity: Number(item.quantity),
    }));

  if (cartItems.length === 0) {
    console.warn(
      "cartItems array is empty after filtering, sending empty array to server",
    );
  }

  console.log("Preparing to send cartItems", cartItems);

  try {
 
    const apiBase =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1"
        ? "http://localhost:3000"
        : "";

    const response = await fetch(`${apiBase}/api/create-checkout-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartItems }),
    });

    const data = await response.json();
    console.log("checkout response", data);

    if (data.url) {
      console.log("redirecting to Stripe session url");
      window.location.href = data.url;
      try {
        localStorage.removeItem("cart");
        console.log("localStorage.cart cleared after redirect");
      } catch (e) {
        console.warn("Could not clear cart from localStorage:", e);
      }
    } else {
      console.error("server responded without url", data);
      alert("Failed to create checkout session - check console/server logs");
    }
  } catch (err) {
    console.error("fetch error on checkout", err);
    alert("Checkout request failed - is the server running?");
  }
}
