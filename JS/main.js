let categoryNavList = document.querySelector(".category-nav-list");

function Open_Categ_list() {
  categoryNavList.classList.toggle("active");
}

function open_close_cart() {
  let cartEl = document.querySelector(".cart");
  cartEl.classList.toggle("active");
}

let navLinks = document.querySelector(".nav-links");

function open_menu() {
  navLinks.classList.toggle("active");
}

const paths = [
  "/products.json",
  "public/products.json",
  "./public/products.json",
];

function fetchAny(paths) {
  return new Promise((resolve, reject) => {
    (function tryNext(i) {
      if (i >= paths.length)
        return reject(new Error("products.json not found"));
      fetch(paths[i])
        .then((res) => {
          if (!res.ok) return tryNext(i + 1);
          return res.json().then(resolve);
        })
        .catch(() => tryNext(i + 1));
    })(0);
  });
}

fetchAny(paths).then((data) => {
  const addToCartButtons = document.querySelectorAll(".btn-add-cart");

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.target.getAttribute("data-id");
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
});

function addToCart(product) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.push({ ...product, quantity: 1 });
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function updateCart() {
  const cartItemsContainer = document.getElementById("cart-items");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const checkoutItems = document.getElementById("checkout-items");

  if (checkoutItems) checkoutItems.innerHTML = "";

  let totalPrice = 0;
  let totalCount = 0;

  cartItemsContainer.innerHTML = "";
  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    totalPrice += itemTotal;
    totalCount += item.quantity;

    cartItemsContainer.innerHTML += `
      <div class="item-cart">
        <img src="${item.img}" alt="">
        <div class="content">
          <h4>${item.name}</h4>
          <p class="price-cart">$${itemTotal}</p>
          <div class="quantity-control">
            <button class="decrease-quantity" data-index="${index}">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="increase-quantity" data-index="${index}">+</button>
          </div>
        </div>
        <button class="delete-item" data-index="${index}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;

    if (checkoutItems) {
      checkoutItems.innerHTML += `
        <div class="item-cart">
          <div class="image-name">
            <img src="${item.img}" alt="">
            <div class="content">
              <h4>${item.name}</h4>
              <p class="price-cart">$${itemTotal}</p>
              <div class="quantity-control">
                <button class="decrease-quantity" data-index="${index}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase-quantity" data-index="${index}">+</button>
              </div>
            </div>
          </div>
          <button class="delete-item" data-index="${index}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    }
  });

  document.querySelector(".price-cart-total").innerHTML = `$ ${totalPrice}`;
  document.querySelector(".count-item-cart").innerHTML = totalCount;
  document.querySelector(".count-item-header").innerHTML = totalCount;

  if (checkoutItems) {
    document.querySelector(".subtotal-checkout").innerHTML = `$ ${totalPrice}`;
    document.querySelector(".total-checkout").innerHTML = `$ ${
      totalPrice + 20
    }`;
  }

  document
    .querySelectorAll(".increase-quantity")
    .forEach((btn) =>
      btn.addEventListener("click", (e) =>
        increaseQuantity(e.target.getAttribute("data-index"))
      )
    );
  document
    .querySelectorAll(".decrease-quantity")
    .forEach((btn) =>
      btn.addEventListener("click", (e) =>
        decreaseQuantity(e.target.getAttribute("data-index"))
      )
    );
  document.querySelectorAll(".delete-item").forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = e.target.closest("button").getAttribute("data-index");
      removeFromCart(idx);
    })
  );
}

updateCart();

function increaseQuantity(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity++;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function decreaseQuantity(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  if (cart[index].quantity > 1) cart[index].quantity--;
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const removed = cart.splice(index, 1)[0];
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCart();
  updateButtonsState(removed.id);
}

function updateButtonsState(productId) {
  document
    .querySelectorAll(`.btn-add-cart[data-id="${productId}"]`)
    .forEach((btn) => {
      btn.classList.remove("active");
      btn.innerHTML = `<i class="fa-solid fa-cart-shopping"></i> add to cart`;
    });
}
