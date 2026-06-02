async function loadProducts() {
  const res = await fetch("/api/products");
  const data = await res.json();

  const box = document.getElementById("products");

  data.forEach(p => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.margin = "10px";
    div.style.padding = "10px";

    div.innerHTML = `
      <h3>${p.name}</h3>
      <p>${p.price} تومان</p>
      <button onclick="alert('به سبد خرید اضافه شد')">خرید</button>
    `;

    box.appendChild(div);
  });
}

loadProducts();