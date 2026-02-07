fetch("public/products.json")
  .then((response) => response.json())
  .then((data) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    const swipers = {
      sale: document.getElementById("swiper-items-sale"),
      electronics: document.getElementById("swiper-electronics"),
      appliances: document.getElementById("swiper-appliances"),
      mobiles: document.getElementById("swiper-mobiles"),
    };

    // Products with discount
    data.forEach((product) => {
      const isInCart = cart.some((item) => item.id === product.id);
      const isInFavorites = favorites.some((item) => item.id === product.id);
      const oldPriceParagraph = product.old_price
        ? `<p class="old-price">$${product.old_price}</p>`
        : "";
      const percentDisc = product.old_price
        ? Math.floor(
            ((product.old_price - product.price) / product.old_price) * 100,
          )
        : 0;
      const percentDiscDiv = product.old_price
        ? `<span class="sale-present">%${percentDisc}</span>`
        : "";

      if (product.old_price) {
        swipers["sale"].innerHTML += `
          <div class="swiper-slide product">
            <span class="sale-present">%${percentDisc}</span>
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
            <p class="name-product"> <a href="productDetails.html?id=${
              product.id
            }">${product.name}</a></p>
            <div class="price">
              <p><span>$${product.price}</span></p>
              <p class="old-price">$${product.old_price}</p>
            </div>
            <div class="icons">
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${
                product.id
              }">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product ${
                isInFavorites ? "favorite" : ""
              }" data-id="${product.id}">
                <i class="${
                  isInFavorites ? "fa-solid" : "fa-regular"
                } fa-heart"></i>
              </span>
            </div>
            <a href="productDetails.html?id=${
              product.id
            }" class="card-link"></a>
          </div>
        `;
      }
    });

    data.forEach((product) => {
      let key;
      if (product.category in swipers) key = product.category;
      else return;

      const isInCart = cart.some((item) => item.id === product.id);
      const isInFavorites = favorites.some((item) => item.id === product.id);
      const oldPriceParagraph = product.old_price
        ? `<p class="old-price">$${product.old_price}</p>`
        : "";
      const percentDisc = product.old_price
        ? Math.floor(
            ((product.old_price - product.price) / product.old_price) * 100,
          )
        : 0;
      const percentDiscDiv = product.old_price
        ? `<span class="sale-present">%${percentDisc}</span>`
        : "";

      let html = `
           <div class="swiper-slide product" id="product-card">
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
               <span class="btn-add-cart ${
                 isInCart ? "active" : ""
               }" data-id="${product.id}">
                 <i class="fa-solid fa-cart-shopping"></i>
                 ${isInCart ? "Item in cart" : "add to cart"}
               </span>
               <span class="icon-product ${
                 isInFavorites ? "favorite" : ""
               }" data-id="${product.id}">
                 <i class="${
                   isInFavorites ? "fa-solid" : "fa-regular"
                 } fa-heart"></i>
               </span>
             </div>
             <a href="productDetails.html?id=${
               product.id
             }" class="card-link"></a>
           </div>
          `;

      swipers[key].innerHTML += html;
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
          `.btn-add-cart[data-id="${productId}"]`,
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

        // Update all matching favorite buttons
        const allMatchingButtons = document.querySelectorAll(
          `.icon-product[data-id="${productId}"]`,
        );
        allMatchingButtons.forEach((btn) => {
          const isInFavorites = JSON.parse(
            localStorage.getItem("favorites") || "[]",
          ).some((item) => item.id == productId);

          if (isInFavorites) {
            btn.classList.add("favorite");
            btn.innerHTML = `<i class="fa-solid fa-heart"></i>`;
          } else {
            btn.classList.remove("favorite");
            btn.innerHTML = `<i class="fa-regular fa-heart"></i>`;
          }
        });
      });
    });
    initProductSwipers();
    function initProductSwipers() {
      document.querySelectorAll(".slide-product .swiper").forEach((slider) => {
        const wrapper = slider.querySelector(".swiper-wrapper");
        const slidesCount = wrapper.querySelectorAll(".swiper-slide").length;

        if (!slidesCount) return;

        const swiperInstance = new Swiper(slider, {
          wrapperClass: "swiper-wrapper",
          slideClass: "swiper-slide",

          slidesPerView: 5,
          spaceBetween: 20,

          loop: slidesCount > 5,

          autoplay:
            slidesCount > 5
              ? {
                  delay: 2500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: false,
                }
              : false,

          navigation: {
            nextEl: ".top-slide .swiper-button-next",
            prevEl: ".top-slide .swiper-button-prev",
          },

          observer: true,
          observeParents: true,

          watchSlidesProgress: true,
          watchSlidesVisibility: true,

          breakpoints: {
            1200: { slidesPerView: 5 },
            1000: { slidesPerView: 4 },
            700: { slidesPerView: 3 },
            0: { slidesPerView: 2 },
          },
        });

        swiperInstance.on("touchEnd", () => {
          swiperInstance.autoplay?.start();
        });

        swiperInstance.on("slideChange", () => {
          swiperInstance.autoplay?.start();
        });
      });
    }
  });
