// ==========================================
// 1. LUXURY PRODUCT DATABASE (16 ITEMS)
// ==========================================
const productsDB = [
  // Grocery
  { id: 1, name: "Royal Basmati Rice (5kg)", category: "grocery", price: 549, rating: 4.8, desc: "Aged long-grain aromatic basmati rice ideal for gourmet meals.", icon: "🌾" },
  { id: 2, name: "Extra Virgin Olive Oil (1L)", category: "grocery", price: 899, rating: 4.7, desc: "Cold-pressed pure olive oil rich in antioxidants for elite cooking.", icon: "🫒" },
  { id: 3, name: "California Almonds (500g)", category: "grocery", price: 449, rating: 4.9, desc: "Crunchy, premium grade raw almonds packed with natural energy.", icon: "🥜" },
  { id: 4, name: "Roasted Arabica Coffee", category: "grocery", price: 399, rating: 4.6, desc: "Rich dark-roast ground coffee beans for a luxurious morning brew.", icon: "☕" },

  // Electronics
  { id: 5, name: "BassPro Wireless Headphones", category: "electronics", price: 2499, rating: 4.7, desc: "Active noise-cancelling over-ear headphones with 40-hour battery life.", icon: "🎧" },
  { id: 6, name: "FitPulse Smart Watch", category: "electronics", price: 3299, rating: 4.5, desc: "AMOLED display smartwatch with heart rate, SpO2, and fitness tracking.", icon: "⌚" },
  { id: 7, name: "BoomBox Bluetooth Speaker", category: "electronics", price: 1799, rating: 4.4, desc: "Waterproof portable wireless speaker with deep acoustic bass.", icon: "🔊" },
  { id: 8, name: "SwiftGlide Wireless Mouse", category: "electronics", price: 799, rating: 4.6, desc: "Ergonomic silent-click wireless optical mouse with adjustable DPI.", icon: "🖱️" },

  // Domestic
  { id: 9, name: "Non-Stick Granite Fry Pan", category: "domestic", price: 1199, rating: 4.8, desc: "PFOA-free heavy-duty induction base fry pan with ergonomic handle.", icon: "🍳" },
  { id: 10, name: "ThermoSteel Vacuum Flask", category: "domestic", price: 699, rating: 4.7, desc: "Double-wall stainless steel bottle keeps beverages hot or cold for 24 hrs.", icon: "🧴" },
  { id: 11, name: "WarmGlow Study Desk Lamp", category: "domestic", price: 849, rating: 4.4, desc: "Eye-care LED desk lamp with adjustable luxury lighting modes.", icon: "🛋️" },
  { id: 12, name: "QuickBoil Electric Kettle", category: "domestic", price: 1099, rating: 4.5, desc: "1.5L stainless steel electric kettle with auto shut-off safety feature.", icon: "🫖" },

  // Sports
  { id: 13, name: "English Willow Cricket Bat", category: "sports", price: 2899, rating: 4.9, desc: "Lightweight full-size cricket bat with thick edges and premium cane handle.", icon: "🏏" },
  { id: 14, name: "ProMatch FIFA Football", category: "sports", price: 999, rating: 4.6, desc: "Thermally bonded seamless match football for professional turf play.", icon: "⚽" },
  { id: 15, name: "HexaGrip Dumbbells (Pair)", category: "sports", price: 1499, rating: 4.8, desc: "Anti-roll rubber coated cast iron dumbbells for home workouts.", icon: "🏋️" },
  { id: 16, name: "CarbonLite Badminton Racket", category: "sports", price: 1299, rating: 4.7, desc: "High-tension graphite shaft badminton racket with elite protective cover.", icon: "🏸" }
];

// ==========================================
// 2. STATE & DOM REFERENCES
// ==========================================
let activeCategory = "all", showWishlistOnly = false, discountApplied = false;
let cart = JSON.parse(localStorage.getItem("auramart_cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("auramart_wish")) || [];

const $ = (id) => document.getElementById(id);
const productGrid = $("product-grid"), searchInput = $("search-input"), priceRange = $("price-range");
const priceVal = $("price-val"), sortSelect = $("sort-select"), resultsCount = $("results-count");
const wishlistFilterBtn = $("wishlist-filter-btn"), wishlistCountEl = $("wishlist-count");
const cartDrawer = $("cart-drawer"), cartBackdrop = $("cart-backdrop"), cartItemsList = $("cart-items-list");
const cartCountEl = $("cart-count"), cartSubtotalEl = $("cart-subtotal"), discountRow = $("discount-row");
const cartDiscountEl = $("cart-discount"), cartTotalEl = $("cart-total"), couponInput = $("coupon-input");
const couponMsg = $("coupon-msg"), orderConfirmedMsg = $("order-confirmed-msg");
const quickModal = $("quick-modal"), modalContent = $("modal-content"), toastEl = $("toast");

// ==========================================
// 3. INIT & FILTERING
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  updateWishlistBadge();
  updateCartUI();
  renderCatalog();
});

function filterByCategory(cat) {
  showWishlistOnly = false;
  wishlistFilterBtn.classList.remove("active");
  activeCategory = cat;
  document.querySelectorAll(".cat-tab").forEach(t => t.classList.toggle("active", t.dataset.category === cat));
  renderCatalog();
}

document.querySelectorAll(".cat-tab").forEach(tab => tab.addEventListener("click", () => filterByCategory(tab.dataset.category)));
wishlistFilterBtn.addEventListener("click", () => {
  showWishlistOnly = !showWishlistOnly;
  wishlistFilterBtn.classList.toggle("active", showWishlistOnly);
  renderCatalog();
});

searchInput.addEventListener("input", renderCatalog);
sortSelect.addEventListener("change", renderCatalog);
priceRange.addEventListener("input", () => { priceVal.textContent = `₹${priceRange.value}`; renderCatalog(); });

function renderCatalog() {
  const q = searchInput.value.toLowerCase().trim(), maxP = Number(priceRange.value), sort = sortSelect.value;
  let list = productsDB.filter(p => 
    (activeCategory === "all" || p.category === activeCategory) &&
    (p.name.toLowerCase().includes(q) || p.category.includes(q)) &&
    p.price <= maxP && (!showWishlistOnly || wishlist.includes(p.id))
  );

  if (sort === "price-low") list.sort((a, b) => a.price - b.price);
  else if (sort === "price-high") list.sort((a, b) => b.price - a.price);
  else if (sort === "rating") list.sort((a, b) => b.rating - a.rating);

  resultsCount.textContent = `Showing ${list.length} product${list.length === 1 ? "" : "s"}`;
  productGrid.innerHTML = list.length ? "" : `<p style="grid-column:1/-1;text-align:center;color:#526e60;padding:40px;">No luxury items found.</p>`;

  list.forEach(p => {
    const card = document.createElement("article");
    card.className = "product-card";
    card.innerHTML = `
      <button class="wish-icon-btn" onclick="toggleWishlist(${p.id})">${wishlist.includes(p.id) ? "❤️" : "🤍"}</button>
      <div class="product-visual" onclick="openQuickView(${p.id})">
        <span>${p.icon}</span>
      </div>
      <div class="product-body">
        <span class="cat-badge">${p.category}</span>
        <h3 class="product-name" onclick="openQuickView(${p.id})">${p.name}</h3>
        <div class="price-row">
          <span class="price-tag">₹${p.price}</span>
          <span class="rating-pill">★ ${p.rating}</span>
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${p.id})">+ Add to Bag</button>
      </div>`;
    productGrid.appendChild(card);
  });
}

// ==========================================
// 4. WISHLIST & QUICK VIEW
// ==========================================
function toggleWishlist(id) {
  wishlist = wishlist.includes(id) ? wishlist.filter(i => i !== id) : [...wishlist, id];
  localStorage.setItem("auramart_wish", JSON.stringify(wishlist));
  updateWishlistBadge();
  renderCatalog();
  showToast(wishlist.includes(id) ? "Saved to Wishlist ❤️" : "Removed from Wishlist");
}

function updateWishlistBadge() { wishlistCountEl.textContent = wishlist.length; }

function openQuickView(id) {
  const p = productsDB.find(x => x.id === id);
  modalContent.innerHTML = `
    <div style="text-align:center;background:#e2eee8;padding:24px;border-radius:12px;margin-bottom:14px;font-size:80px;">${p.icon}</div>
    <span class="cat-badge">${p.category}</span>
    <h2 style="font-size:22px;margin:4px 0 8px;color:#093824;">${p.name}</h2>
    <p style="color:#526e60;font-size:14px;margin-bottom:14px;">${p.desc}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
      <strong style="font-size:24px;color:#093824;">₹${p.price}</strong>
      <span class="rating-pill">★ ${p.rating} / 5</span>
    </div>
    <button class="add-to-cart-btn" onclick="addToCart(${p.id}); quickModal.classList.remove('open');">+ Add to Bag</button>`;
  quickModal.classList.add("open");
}

$("close-modal-btn").addEventListener("click", () => quickModal.classList.remove("open"));
quickModal.addEventListener("click", (e) => { if (e.target === quickModal) quickModal.classList.remove("open"); });

// ==========================================
// 5. CART, COUPON & DIRECT BUY NOW
// ==========================================
function addToCart(id) {
  const p = productsDB.find(x => x.id === id);
  const existing = cart.find(i => i.id === id);
  existing ? existing.qty++ : cart.push({ ...p, qty: 1 });
  orderConfirmedMsg.style.display = "none";
  saveCart();
  updateCartUI();
  showToast(`${p.name} added to bag!`);
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  saveCart();
  updateCartUI();
}

function saveCart() { localStorage.setItem("auramart_cart", JSON.stringify(cart)); }

function updateCartUI() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  const discount = (discountApplied && subtotal > 0) ? Math.round(subtotal * 0.2) : 0;

  cartCountEl.textContent = totalQty;
  cartSubtotalEl.textContent = `₹${subtotal}`;
  discountRow.style.display = discount > 0 ? "flex" : "none";
  cartDiscountEl.textContent = `-₹${discount}`;
  cartTotalEl.textContent = `₹${subtotal - discount}`;

  if (!cart.length) {
    cartItemsList.innerHTML = `<p style="text-align:center;color:#526e60;margin-top:40px;">Your shopping bag is empty.</p>`;
    return;
  }

  cartItemsList.innerHTML = cart.map(i => `
    <div class="cart-row">
      <div class="cart-row-info">
        <h4>${i.icon} ${i.name}</h4>
        <span>₹${i.price} × ${i.qty} = ₹${i.price * i.qty}</span>
      </div>
      <div class="qty-box">
        <button class="qty-btn" onclick="updateQty(${i.id}, -1)">-</button>
        <strong>${i.qty}</strong>
        <button class="qty-btn" onclick="updateQty(${i.id}, 1)">+</button>
      </div>
    </div>`).join("");
}

$("apply-coupon-btn").addEventListener("click", () => {
  if (couponInput.value.trim().toUpperCase() === "AURA20") {
    discountApplied = true;
    couponMsg.style.color = "#047857";
    couponMsg.textContent = "🎉 AURA20 applied! 20% Privilege OFF.";
  } else {
    discountApplied = false;
    couponMsg.style.color = "#9f1239";
    couponMsg.textContent = "❌ Invalid code. Try AURA20";
  }
  updateCartUI();
});

$("buy-now-btn").addEventListener("click", () => {
  if (!cart.length) return showToast("Your luxury bag is empty!");
  cart = [];
  discountApplied = false;
  couponInput.value = "";
  couponMsg.textContent = "";
  saveSaveCart = saveCart();
  updateCartUI();
  orderConfirmedMsg.style.display = "block";
});

$("open-cart-btn").addEventListener("click", () => {
  orderConfirmedMsg.style.display = "none";
  cartDrawer.classList.add("open");
  cartBackdrop.classList.add("open");
});

const closeCart = () => { cartDrawer.classList.remove("open"); cartBackdrop.classList.remove("open"); };
$("close-cart-btn").addEventListener("click", closeCart);
cartBackdrop.addEventListener("click", closeCart);

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 2000);
}