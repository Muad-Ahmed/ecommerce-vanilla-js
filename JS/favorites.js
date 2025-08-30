// Load favorites page
function loadFavorites() {
  const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
  const container = document.getElementById("favorites-container");
  const emptyState = document.getElementById("empty-favorites");

  if (favorites.length === 0) {
    container.style.display = "none";
    emptyState.style.display = "block";
    return;
  }

  container.style.display = "grid";
  emptyState.style.display = "none";

  // Get all products data to match with favorites
  fetch("public/products.json")
    .then((response) => response.json())
    .then((data) => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];

      container.innerHTML = "";

      favorites.forEach((favorite) => {
        const product = data.find((p) => p.id === favorite.id);
        if (!product) return;

        const isInCart = cart.some((item) => item.id === product.id);
        const oldPriceParagraph = product.old_price
          ? `<p class="old-price">$${product.old_price}</p>`
          : "";
        const percentDisc = product.old_price
          ? Math.floor(
              ((product.old_price - product.price) / product.old_price) * 100
            )
          : 0;
        const percentDiscDiv = product.old_price
          ? `<span class="sale-present">%${percentDisc}</span>`
          : "";

        const productCard = `
          <div class="product">
            ${percentDiscDiv}
            <div class="img-product">
              <a href="productDetails.html?id=${product.id}"><img src="${
          product.img
        }" alt=""></a>
            </div>
            <div class="stars">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </div>
            <p class="name-product"><a href="productDetails.html?id=${
              product.id
            }">${product.name}</a></p>
            <div class="price">
              <p><span>$${product.price}</span></p>
              ${oldPriceParagraph}
            </div>
            <div class="icons">
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${
          product.id
        }">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product favorite" data-id="${product.id}">
                <i class="fa-solid fa-heart"></i>
              </span>
            </div>
            <a href="productDetails.html?id=${
              product.id
            }" class="card-link"></a>
          </div>
        `;

        container.innerHTML += productCard;
      });

      // Add event listeners to cart buttons
      const addToCartButtons = document.querySelectorAll(".btn-add-cart");
      addToCartButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const productId = button.getAttribute("data-id");
          const selectedProduct = data.find((p) => p.id == productId);

          addToCart(selectedProduct);

          const allMatchingButtons = document.querySelectorAll(
            `.btn-add-cart[data-id="${productId}"]`
          );
          allMatchingButtons.forEach((btn) => {
            btn.classList.add("active");
            btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`;
          });
        });
      });

      // Add event listeners to favorite buttons
      const favoriteButtons = document.querySelectorAll(".icon-product");
      favoriteButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();

          const productId = button.getAttribute("data-id");
          const selectedProduct = data.find((p) => p.id == productId);

          toggleFavorite(selectedProduct, button);

          // Remove from favorites page
          const productCard = button.closest(".product");
          if (productCard) {
            productCard.remove();

            // Check if no more favorites
            const remainingFavorites = document.querySelectorAll(".product");
            if (remainingFavorites.length === 0) {
              loadFavorites(); // This will show empty state
            }
          }
        });
      });
    });
}

// Load favorites when page loads
document.addEventListener("DOMContentLoaded", loadFavorites);
