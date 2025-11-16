const BOOKS_URL = "books.json"; // you can replace with a hosted JSON or Google Sheets JSON endpoint
const PAYMENT_LINK = "PAYMENT_LINK"; // <-- REPLACE this with your payment URL (Razorpay/Instamojo/PayPal/Gumroad)

let books = [];
const cart = JSON.parse(localStorage.getItem("cart") || "{}");

// DOM refs
const catalog = document.getElementById("catalog");
const search = document.getElementById("search");
const cartBtn = document.getElementById("cart-btn");
const cartCount = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const closeCart = document.getElementById("close-cart");
const cartList = document.getElementById("cart-list");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout");
const yearSpan = document.getElementById("year");

yearSpan.textContent = new Date().getFullYear();

function updateCartCount() {
  const qty = Object.values(cart).reduce((s, v) => s + v, 0);
  cartCount.textContent = qty;
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  saveCart();
}

function removeFromCart(id) {
  delete cart[id];
  saveCart();
  renderCart();
}

function qtyChange(id, delta) {
  cart[id] = Math.max(0, (cart[id] || 0) + delta);
  if (cart[id] === 0) delete cart[id];
  saveCart();
  renderCart();
}

function renderCatalog(list) {
  catalog.innerHTML = "";
  list.forEach((b) => {
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
    <img src="${b.image}" alt="${b.title}">
    <div class="title">${b.title}</div>
    <div class="author">${b.author} — ${b.category}</div>
    <div class="price">₹${b.price.toFixed(2)}</div>
    <div style="margin-top:.5rem;display:flex;gap:.5rem">
      <button class="btn primary" data-id="${b.id}">Add to cart</button>
      <a class="btn ghost" href="${
        b.detail_link || "#"
      }" target="_blank">Details</a>
    </div>
  `;
    catalog.appendChild(el);
  });
  // attach add-to-cart
  document.querySelectorAll(".btn.primary").forEach(
    (btn) =>
      (btn.onclick = () => {
        addToCart(btn.dataset.id);
      })
  );
}

function renderCart() {
  cartList.innerHTML = "";
  let total = 0;
  if (Object.keys(cart).length === 0) {
    cartList.innerHTML = "<p>Your cart is empty.</p>";
    cartTotal.textContent = "Total: ₹0";
    return;
  }
  Object.keys(cart).forEach((id) => {
    const book = books.find((b) => b.id == id);
    const qty = cart[id];
    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <img src="${book.image}">
      <div style="flex:1">
        <div style="font-weight:600">${book.title}</div>
        <div style="font-size:.9rem;color:#666">${book.author}</div>
        <div style="margin-top:.4rem">₹${book.price.toFixed(2)} × ${qty} = ₹${(
      book.price * qty
    ).toFixed(2)}</div>
        <div style="margin-top:.4rem"><button class="btn" data-id="${id}" data-op="-">-</button> <button class="btn" data-id="${id}" data-op="+">+</button> <button class="btn" data-id="${id}" data-op="r">Remove</button></div>
      </div>
    `;
    cartList.appendChild(row);
    total += book.price * qty;
  });
  cartTotal.textContent = `Total: ₹${total.toFixed(2)}`;
  // attach handlers
  cartList.querySelectorAll(".btn").forEach((b) => {
    b.onclick = () => {
      const id = b.dataset.id;
      const op = b.dataset.op;
      if (op === "+") qtyChange(id, 1);
      if (op === "-") qtyChange(id, -1);
      if (op === "r") removeFromCart(id);
    };
  });
}

function openCart() {
  cartModal.setAttribute("aria-hidden", "false");
  renderCart();
}
function closeCartModal() {
  cartModal.setAttribute("aria-hidden", "true");
}

checkoutBtn.onclick = () => {
  // Build order summary
  const items = Object.keys(cart)
    .map((id) => {
      const b = books.find((x) => x.id == id);
      return `${b.title} x${cart[id]}`;
    })
    .join(", ");
  const total = Object.keys(cart)
    .reduce((s, id) => s + books.find((b) => b.id == id).price * cart[id], 0)
    .toFixed(2);

  // If PAYMENT_LINK is unchanged, warn
  if (PAYMENT_LINK === "PAYMENT_LINK") {
    alert(
      "Please replace PAYMENT_LINK in assets/app.js with your real payment URL before checking out."
    );
    return;
  }

  // Redirect to payment provider with order info as query params (providers ignore but it's useful)
  const url =
    PAYMENT_LINK +
    `?amount=${encodeURIComponent(total)}` +
    `&items=${encodeURIComponent(items)}`;
  window.location.href = url;
};

cartBtn.onclick = openCart;
closeCart.onclick = closeCartModal;
search.oninput = () => {
  const q = search.value.trim().toLowerCase();
  if (!q) renderCatalog(books);
  else
    renderCatalog(
      books.filter((b) =>
        (b.title + " " + b.author + " " + b.category).toLowerCase().includes(q)
      )
    );
};

// Load books.json
fetch(BOOKS_URL)
  .then((r) => r.json())
  .then((data) => {
    books = data;
    renderCatalog(books);
    updateCartCount();
  })
  .catch((err) => {
    console.error("Failed to load books.json", err);
    // fallback sample data
    books = [
      {
        id: 1,
        title: "Sample Book",
        author: "Author Name",
        category: "Fiction",
        price: 199.0,
        image: "https://via.placeholder.com/240x320?text=Book+1",
      },
    ];
    renderCatalog(books);
    updateCartCount();
  });

// keyboard shortcut: c to open cart
window.addEventListener("keydown", (e) => {
  if (e.key === "c") openCart();
});

/*
How to replace PAYMENT_LINK with a Razorpay link:
- Create a payment link on Razorpay/Instamojo/PayPal/Gumroad and copy the URL.
- Paste it into PAYMENT_LINK constant above.

If you want per-book payment page:
- Add "payment_link" field to each book object in books.json and add a direct Buy button linking to it.
*/
