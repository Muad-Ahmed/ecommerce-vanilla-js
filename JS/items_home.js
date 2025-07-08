fetch('products.json')
  .then(response => response.json())
  .then(data => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const swiperItemsSale = document.getElementById("swiper-items-sale");
    const swiperElectronics = document.getElementById("swiper-electronics");
    const swiperAppliances = document.getElementById("swiper-appliances");
    const swiperMobiles = document.getElementById("swiper-mobiles");

    // Products with discount
    data.forEach(product => {
      if (product.old_price) {
        const isInCart = cart.some(item => item.id === product.id);
        const percentDisc = Math.floor((product.old_price - product.price) / product.old_price * 100);

        swiperItemsSale.innerHTML += `
          <div class="swiper-slide product">
            <span class="sale-present">%${percentDisc}</span>
            <div class="img-product">
              <a href="#"><img src="${product.img}" alt=""></a>
            </div>
            <div class="stars">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </div>
            <p class="name-product"><a href="#">${product.name}</a></p>
            <div class="price">
              <p><span>$${product.price}</span></p>
              <p class="old-price">$${product.old_price}</p>
            </div>
            <div class="icons">
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${product.id}">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product"><i class="fa-regular fa-heart"></i></span>
            </div>
          </div>
        `;
      }
    });

    // Electronics category
    data.forEach(product => {
      if (product.category === "electronics") {
        const isInCart = cart.some(item => item.id === product.id);
        const oldPriceParagraph = product.old_price
          ? `<p class="old-price">$${product.old_price}</p>`
          : "";
        const percentDisc = product.old_price
          ? Math.floor((product.old_price - product.price) / product.old_price * 100)
          : 0;
        const percentDiscDiv = product.old_price
          ? `<span class="sale-present">%${percentDisc}</span>`
          : "";

        swiperElectronics.innerHTML += `
          <div class="swiper-slide product">
            ${percentDiscDiv}
            <div class="img-product">
              <a href="#"><img src="${product.img}" alt=""></a>
            </div>
            <div class="stars">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </div>
            <p class="name-product"><a href="#">${product.name}</a></p>
            <div class="price">
              <p><span>$${product.price}</span></p>
              ${oldPriceParagraph}
            </div>
            <div class="icons">
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${product.id}">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product"><i class="fa-regular fa-heart"></i></span>
            </div>
          </div>
        `;
      }
    });

    // Appliances category
    data.forEach(product => {
      if (product.category === "appliances") {
        const isInCart = cart.some(item => item.id === product.id);
        const oldPriceParagraph = product.old_price
          ? `<p class="old-price">$${product.old_price}</p>`
          : "";
        const percentDisc = product.old_price
          ? Math.floor((product.old_price - product.price) / product.old_price * 100)
          : 0;
        const percentDiscDiv = product.old_price
          ? `<span class="sale-present">%${percentDisc}</span>`
          : "";

        swiperAppliances.innerHTML += `
          <div class="swiper-slide product">
            ${percentDiscDiv}
            <div class="img-product">
              <a href="#"><img src="${product.img}" alt=""></a>
            </div>
            <div class="stars">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </div>
            <p class="name-product"><a href="#">${product.name}</a></p>
            <div class="price">
              <p><span>$${product.price}</span></p>
              ${oldPriceParagraph}
            </div>
            <div class="icons">
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${product.id}">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product"><i class="fa-regular fa-heart"></i></span>
            </div>
          </div>
        `;
      }
    });

    // Mobiles category
    data.forEach(product => {
      if (product.category === "mobiles") {
        const isInCart = cart.some(item => item.id === product.id);
        const oldPriceParagraph = product.old_price
          ? `<p class="old-price">$${product.old_price}</p>`
          : "";
        const percentDisc = product.old_price
          ? Math.floor((product.old_price - product.price) / product.old_price * 100)
          : 0;
        const percentDiscDiv = product.old_price
          ? `<span class="sale-present">%${percentDisc}</span>`
          : "";

        swiperMobiles.innerHTML += `
          <div class="swiper-slide product">
            ${percentDiscDiv}
            <div class="img-product">
              <a href="#"><img src="${product.img}" alt=""></a>
            </div>
            <div class="stars">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </div>
            <p class="name-product"><a href="#">${product.name}</a></p>
            <div class="price">
              <p><span>$${product.price}</span></p>
              ${oldPriceParagraph}
            </div>
            <div class="icons">
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${product.id}">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product"><i class="fa-regular fa-heart"></i></span>
            </div>
          </div>
        `;
      }
    });
  });
