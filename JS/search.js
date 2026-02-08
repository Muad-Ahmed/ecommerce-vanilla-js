let allProducts = []; // Global variable to store fetched products

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search")?.toLowerCase().trim() || "";
  const categoryQuery = urlParams.get("category") || "All categories";

  const titleElement = document.getElementById("search-title");
  if (titleElement) {
    titleElement.innerText = searchQuery
      ? `Results for: "${searchQuery}"`
      : `Category: ${categoryQuery}`;
  }

  fetch("public/products.json")
    .then((response) => response.json())
    .then((data) => {
      const resultsContainer = document.getElementById(
        "search-results-container",
      );
      if (!resultsContainer) return;

      // 1. Remove duplicates based on product image (product.img)
      const seenImages = new Set();
      allProducts = data.filter((product) => {
        if (!seenImages.has(product.img)) {
          seenImages.add(product.img);
          return true;
        }
        return false;
      });

      // 2. Filter products based on search query and category
      const filteredProducts = allProducts.filter((product) => {
        const matchesName = product.name.toLowerCase().includes(searchQuery);
        const matchesCategory =
          categoryQuery === "All categories" ||
          product.category.toLowerCase() === categoryQuery.toLowerCase();
        return matchesName && matchesCategory;
      });

      // 3. Render results
      renderResults(filteredProducts, resultsContainer);
    });
});

function renderResults(items, container) {
  if (items.length === 0) {
    container.innerHTML = `<div class="no-results"><h3>No products found.</h3></div>`;
    return;
  }

  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  container.innerHTML = items
    .map((product) => {
      const isInCart = cart.some((item) => item.id === product.id);
      const isInFav = favorites.some((item) => item.id === product.id);

      return `
            <div class="product">
                <div class="img-product">
                    <a href="productDetails.html?id=${product.id}">
                        <img src="${product.img}" alt="">
                    </a>
                </div>
                <p class="name-product">
                    <a href="productDetails.html?id=${product.id}">${product.name}</a>
                </p>
                <div class="price">
                    <p><span>$${product.price}</span></p>
                    ${product.old_price ? `<p class="old-price">$${product.old_price}</p>` : ""}
                </div>
                <div class="icons">
                    <span class="btn-add-cart ${isInCart ? "active" : ""}" onclick="handleAddToCart(${product.id}, this)">
                        <i class="fa-solid fa-cart-shopping"></i> ${isInCart ? "In Cart" : "Add to Cart"}
                    </span>
                    <span class="icon-product ${isInFav ? "favorite" : ""}" onclick="handleToggleFavorite(${product.id}, this)">
                        <i class="${isInFav ? "fa-solid" : "fa-regular"} fa-heart"></i>
                    </span>
                </div>
            </div>`;
    })
    .join("");
}

// --- Functional Helpers ---

// Handle Add to Cart
function handleAddToCart(id, btn) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const product = allProducts.find((p) => p.id === id);

  if (!cart.some((item) => item.id === id)) {
    cart.push({ ...product, quantity: 1 });
    btn.classList.add("active");
    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> In Cart`;
  } else {
    cart = cart.filter((item) => item.id !== id);
    btn.classList.remove("active");
    btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Add to Cart`;
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCounters(); // Ensure this function exists in main.js to update header
}

// Handle Favorite Toggle
function handleToggleFavorite(id, btn) {
  let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const product = allProducts.find((p) => p.id === id);
  const icon = btn.querySelector("i");

  if (!favorites.some((item) => item.id === id)) {
    favorites.push(product);
    btn.classList.add("favorite");
    icon.classList.replace("fa-regular", "fa-solid");
  } else {
    favorites = favorites.filter((item) => item.id !== id);
    btn.classList.remove("favorite");
    icon.classList.replace("fa-solid", "fa-regular");
  }

  localStorage.setItem("favorites", JSON.stringify(favorites));
  updateCounters();
}

// Function to sync header counters
function updateCounters() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

  document
    .querySelectorAll(".count-item-header")
    .forEach((el) => (el.innerText = cart.length));
  document
    .querySelectorAll(".count-favourite")
    .forEach((el) => (el.innerText = favorites.length));
  document
    .querySelectorAll(".count-item-cart")
    .forEach((el) => (el.innerText = cart.length));
}
