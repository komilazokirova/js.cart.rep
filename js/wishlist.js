let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
wishlist = wishlist.map(i => ({ ...i, quantity: i.quantity || 1 }));

const grid = document.getElementById("wishGrid");
const totalBar = document.getElementById("totalBar");
const wishTotalEl = document.getElementById("wishTotal");

function saveWishlist() { localStorage.setItem("wishlist", JSON.stringify(wishlist)); }

function getImg(product) {
    if (product.images && product.images[0]) {
        const clean = product.images[0].replace(/[\[\]\"]/g, "");
        if (clean.startsWith("http") && !clean.includes("imgur.com")) return clean;
    }
    return `https://picsum.photos/600/400?random=${product.id}`;
}

function updateTotal() {
    const total = wishlist.reduce((s, i) => s + i.price * i.quantity, 0);
    wishTotalEl.textContent = `$${total}`;
    totalBar.style.display = wishlist.length ? "flex" : "none";
}

function updateCardQty(id) {
    const item = wishlist.find(i => i.id === id);
    if (!item) { renderWishlist(); return; }
    const countEl = document.getElementById(`qty-count-${id}`);
    const subtotalEl = document.getElementById(`subtotal-${id}`);
    if (countEl) countEl.textContent = item.quantity;
    if (subtotalEl) subtotalEl.textContent = `Subtotal: $${item.price * item.quantity}`;
    updateTotal();
}

function increase(id) {
    const item = wishlist.find(i => i.id === id);
    if (item) { item.quantity++; saveWishlist(); updateCardQty(id); }
}

function decrease(id) {
    const idx = wishlist.findIndex(i => i.id === id);
    if (idx === -1) return;
    wishlist[idx].quantity--;
    if (wishlist[idx].quantity <= 0) { wishlist.splice(idx, 1); saveWishlist(); renderWishlist(); return; }
    saveWishlist();
    updateCardQty(id);
}

function removeItem(id) {
    wishlist = wishlist.filter(i => i.id !== id);
    saveWishlist();
    renderWishlist();
}

function renderWishlist() {
    grid.innerHTML = "";
    if (wishlist.length === 0) {
        totalBar.style.display = "none";
        grid.innerHTML = `
            <div class="empty" style="grid-column:1/-1">
                <div class="empty-icon">❤️</div>
                <div class="empty-title">Your wishlist is empty</div>
                <p>Save products you love and find them here.</p>
                <a href="../index.html">Browse Products</a>
            </div>`;
        return;
    }

    wishlist.forEach((p, i) => {
        const img = getImg(p);
        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <div class="card-img-wrap">
                <img src="${img}" alt="${p.title}" onerror="this.src='https://picsum.photos/600/400?random=${p.id}'"/>
            </div>
            <div class="card-body">
                <div class="card-category">${p.category?.name || "Product"}</div>
                <div class="card-title">${p.title}</div>
                <div class="card-price">$${p.price}</div>
                <div class="qty-control">
                    <button class="qty-btn minus" onclick="decrease(${p.id})">−</button>
                    <span class="qty-count" id="qty-count-${p.id}">${p.quantity}</span>
                    <button class="qty-btn plus" onclick="increase(${p.id})">+</button>
                </div>
                <div class="card-subtotal" id="subtotal-${p.id}">Subtotal: $${p.price * p.quantity}</div>
                <button class="remove-btn" onclick="removeItem(${p.id})">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Remove from Wishlist
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    updateTotal();
}

renderWishlist();