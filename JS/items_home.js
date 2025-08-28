fetch("public/products.json")
  .then((response) => response.json())
  .then((data) => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const swipers = {
      sale: document.getElementById("swiper-items-sale"),
      electronics: document.getElementById("swiper-electronics"),
      appliances: document.getElementById("swiper-appliances"),
      mobiles: document.getElementById("swiper-mobiles"),
    };

    // Products with discount
    data.forEach((product) => {
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

      if (product.old_price) {
        swipers["sale"].innerHTML += `
        <a href="productDetails.html?id=${product.id}">
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
              <span class="icon-product"><i class="fa-regular fa-heart"></i></span>
            </div>
          </div>
          </a>
        `;
      }
    });

    data.forEach((product) => {
      let key;
      if (product.category in swipers) key = product.category;
      else return;

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

      let html = `
         <a href="productDetails.html?id=${product.id}">
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
              <span class="btn-add-cart ${isInCart ? "active" : ""}" data-id="${
        product.id
      }">
                <i class="fa-solid fa-cart-shopping"></i>
                ${isInCart ? "Item in cart" : "add to cart"}
              </span>
              <span class="icon-product"><i class="fa-regular fa-heart"></i></span>
            </div>
          </div>
         </a>
        `;

      swipers[key].innerHTML += html;
    });
  });
