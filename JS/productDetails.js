const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const img = document.getElementById("img");
const productName = document.getElementById("product-name");
const price = document.getElementById("price");
const productBrand = document.getElementById("brand");
const quantity = document.getElementById("quantity");

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
    const selectedProduct = data.find(
      (product) => product.id === Number(productId)
    );

    if (selectedProduct) {
      img.src = selectedProduct.img;
      productName.textContent = selectedProduct.name;
      price.textContent = `$${selectedProduct.price}`;
      productBrand.textContent = selectedProduct.brand;
      quantity.textContent = selectedProduct.quantity;
    } else {
      console.error("Product not Found");
    }
  });
