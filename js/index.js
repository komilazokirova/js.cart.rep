let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let fetchedProducts = [];

const grid = document.getElementById("productsGrid");
const wishId = document.getElementById("wishId");
const cartId = document.getElementById("cartId");

const API = "https://api.escuelajs.co/api/v1/products?limit=12&offset=10";

/* ── BADGES ── */
function updateBadges() {
    if (wishId) wishId.textContent = wishlist.length;
    if (cartId) cartId.textContent = cart.reduce((s, i) => s + i.quantity, 0);
}

/* ── TOAST ── */
let toastTimer;
function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

/* ── SAVE ── */
function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }
function saveWishlist() { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }

/* ── WISH BUTTON render ── */
function renderWishBtn(id) {
    const wrap = document.getElementById(`wish-wrap-${id}`);
    if (!wrap) return;
    const active = wishlist.some(i => i.id === id);
    wrap.innerHTML = active
        ? `<button class="wish-btn active" onclick="removeWish(${id})">
               <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
               Saved to Wishlist
           </button>`
        : `<button class="wish-btn" onclick="addWish(${id})">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
               Add to Wishlist
           </button>`;
}

/* ── CART CONTROL render ── */
function renderCartControl(id) {
    const wrap = document.getElementById(`cart-wrap-${id}`);
    if (!wrap) return;
    const item = cart.find(i => i.id === id);
    wrap.innerHTML = item
        ? `<div class="qty-control">
               <button class="qty-btn minus" onclick="decreaseCart(${id})">−</button>
               <span class="qty-count">${item.quantity}</span>
               <button class="qty-btn plus" onclick="increaseCart(${id})">+</button>
           </div>`
        : `<button class="cart-btn" onclick="addToCart(${id})">+ Add to Cart</button>`;
}

/* ── WISHLIST ACTIONS ── */
function addWish(id) {
    const p = fetchedProducts.find(p => p.id === id);
    if (!p) return;
    wishlist.push({ ...p, quantity: 1 });
    saveWishlist();
    updateBadges();
    renderWishBtn(id);
    showToast(`❤️ "${p.title}" saved to wishlist`);
}
function removeWish(id) {
    const p = fetchedProducts.find(p => p.id === id);
    wishlist = wishlist.filter(i => i.id !== id);
    saveWishlist();
    updateBadges();
    renderWishBtn(id);
    if (p) showToast(`🗑 "${p.title}" removed from wishlist`);
}

/* ── CART ACTIONS ── */
function addToCart(id) {
    const p = fetchedProducts.find(p => p.id === id);
    if (!p) return;
    cart.push({ ...p, quantity: 1 });
    saveCart();
    updateBadges();
    renderCartControl(id);
    showToast(`🛒 "${p.title}" added to cart`);
}
function increaseCart(id) {
    const item = cart.find(i => i.id === id);
    if (item) { item.quantity++; saveCart(); updateBadges(); renderCartControl(id); }
}
function decreaseCart(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].quantity--;
    if (cart[idx].quantity <= 0) cart.splice(idx, 1);
    saveCart();
    updateBadges();
    renderCartControl(id);
}

/* ── RENDER ── */
function getImg(product) {
    if (product.images && product.images[0]) {
        const clean = product.images[0].replace(/[\[\]\"]/g, "");
        if (clean.startsWith("http") && !clean.includes("imgur.com")) return clean;
    }
    return `https://picsum.photos/600/400?random=${product.id}`;
}

function renderProducts(products) {
    grid.innerHTML = "";
    products.forEach((p, i) => {
        const inWish = wishlist.some(w => w.id === p.id);
        const inCart = cart.find(c => c.id === p.id);
        const img = getImg(p);

        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${i * 0.05}s`;

        const wishHTML = inWish
            ? `<button class="wish-btn active" onclick="removeWish(${p.id})">
                   <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                   Saved to Wishlist
               </button>`
            : `<button class="wish-btn" onclick="addWish(${p.id})">
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                   Add to Wishlist
               </button>`;

        const cartHTML = inCart
            ? `<div class="qty-control">
                   <button class="qty-btn minus" onclick="decreaseCart(${p.id})">−</button>
                   <span class="qty-count">${inCart.quantity}</span>
                   <button class="qty-btn plus" onclick="increaseCart(${p.id})">+</button>
               </div>`
            : `<button class="cart-btn" onclick="addToCart(${p.id})">+ Add to Cart</button>`;

        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="${img}" alt="${p.title}" onerror="this.src='https://picsum.photos/600/400?random=${p.id}'"/>
            </div>
            <div class="card-body">
                <div class="card-category">${p.category?.name || "Product"}</div>
                <div class="card-title">${p.title}</div>
                <div class="card-price">$${p.price}</div>
                <div class="card-actions">
                    <div id="wish-wrap-${p.id}">${wishHTML}</div>
                    <div id="cart-wrap-${p.id}">${cartHTML}</div>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

/* ── FETCH ── */
async function fetchProducts() {
    try {
        const res = await fetch(API);
        if (!res.ok) throw new Error("Server error");
        fetchedProducts = await res.json();
        renderProducts(fetchedProducts);
    } catch (e) {
        grid.innerHTML = `<p style="color:#ff4d4d;grid-column:1/-1;text-align:center;padding:60px">Error: ${e.message}</p>`;
    }
}

fetchProducts();
updateBadges();