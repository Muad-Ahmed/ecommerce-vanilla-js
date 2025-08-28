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
    } else {
      console.error("Product not Found");
    }
  });
