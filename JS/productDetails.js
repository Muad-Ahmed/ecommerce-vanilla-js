const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get("id");

const img = document.getElementById("img");
const productName = document.getElementById("product-name");
const price = document.getElementById("price");
const productBrand = document.getElementById("brand");
const quantity = document.getElementById("quantity");

// Simplified fetch function
async function loadProductDetails() {
  try {
    const response = await fetch("public/products.json");
    if (!response.ok) {
      throw new Error("Failed to load products");
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading products:", error);
    return [];
  }
}

loadProductDetails().then((data) => {
  if (!data || data.length === 0) {
    console.error("No products data available");
    return;
  }

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
