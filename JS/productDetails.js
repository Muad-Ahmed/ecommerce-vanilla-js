const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const img = document.getElementById("img");
const productName = document.getElementById("product-name");
const price = document.getElementById("price");
const productBrand = document.getElementById("brand");
const quantity = document.getElementById("quantity");

fetch("public/products.json")
  .then((response) => response.json())
  .then((data) => {
    const selectedProduct = data.find(
      (product) => product.id === Number(productId)
    );

    if (selectedProduct) {
      img.src = selectedProduct.img;
      productName.textContent = selectedProduct.name;
      price.textContent = `$${selectedProduct.price}`;
      productBrand.textContent = selectedProduct.brand;
      quantity.textContent = selectedProduct.quantity;

      // Set product ID for add to cart button
      const addToCartBtn = document.querySelector(".btn-add-cart");
      addToCartBtn.setAttribute("data-id", selectedProduct.id);

      // Check if product is in cart
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const isInCart = cart.some((item) => item.id === selectedProduct.id);
      if (isInCart) {
        addToCartBtn.classList.add("active");
        addToCartBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`;
      }

      // Check if product is in favorites
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      const isInFavorites = favorites.some(
        (item) => item.id === selectedProduct.id
      );
      const favoriteBtn = document.querySelector(".icon-product");
      if (isInFavorites) {
        favoriteBtn.classList.add("favorite");
        favoriteBtn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
      }

      // Add event listener for add to cart button
      addToCartBtn.addEventListener("click", () => {
        addToCart(selectedProduct);
        addToCartBtn.classList.add("active");
        addToCartBtn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> Item in cart`;
      });

      // Add event listener for favorite button
      favoriteBtn.addEventListener("click", () => {
        toggleFavorite(selectedProduct, favoriteBtn);

        // Update button appearance
        const isInFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        ).some((item) => item.id === selectedProduct.id);

        if (isInFavorites) {
          favoriteBtn.classList.add("favorite");
          favoriteBtn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
        } else {
          favoriteBtn.classList.remove("favorite");
          favoriteBtn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
        }
      });
    } else {
      console.error("Product not Found");
    }
  });
