let cart = JSON.parse(localStorage.getItem("cart")) || [];

const grid = document.getElementById("cartGrid");
const summary = document.getElementById("cartSummary");
const summaryCount = document.getElementById("summaryCount");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryTotal = document.getElementById("summaryTotal");

function saveCart() { localStorage.setItem("cart", JSON.stringify(cart)); }

function getImg(product) {
    if (product.images && product.images[0]) {
        const clean = product.images[0].replace(/[\[\]\"]/g, "");
        if (clean.startsWith("http") && !clean.includes("imgur.com")) return clean;
    }
    return `https://picsum.photos/600/400?random=${product.id}`;
}

function updateSummary() {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const totalPrice = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    summaryCount.textContent = totalItems;
    summarySubtotal.textContent = `$${totalPrice}`;
    summaryTotal.textContent = `$${totalPrice}`;
    summary.style.display = cart.length ? "block" : "none";
}

function updateCardQty(id) {
    const item = cart.find(i => i.id === id);
    const countEl = document.getElementById(`qty-count-${id}`);
    const subtotalEl = document.getElementById(`subtotal-${id}`);
    if (!item) {
        renderCart();
        return;
    }
    if (countEl) countEl.textContent = item.quantity;
    if (subtotalEl) subtotalEl.textContent = `Subtotal: $${item.price * item.quantity}`;
    updateSummary();
}

function increase(id) {
    const item = cart.find(i => i.id === id);
    if (item) { item.quantity++; saveCart(); updateCardQty(id); updateSummary(); }
}

function decrease(id) {
    const idx = cart.findIndex(i => i.id === id);
    if (idx === -1) return;
    cart[idx].quantity--;
    if (cart[idx].quantity <= 0) { cart.splice(idx, 1); saveCart(); renderCart(); return; }
    saveCart();
    updateCardQty(id);
    updateSummary();
}

function removeItem(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
    renderCart();
}

function renderCart() {
    grid.innerHTML = "";
    if (cart.length === 0) {
        summary.style.display = "none";
        grid.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🛒</div>
                <div class="empty-title">Your cart is empty</div>
                <p>Looks like you haven't added anything yet.</p>
                <a href="../index.html">Browse Products</a>
            </div>`;
        return;
    }

    cart.forEach((p, i) => {
        const img = getImg(p);
        const card = document.createElement("div");
        card.className = "card";
        card.style.animationDelay = `${i * 0.05}s`;
        card.innerHTML = `
            <img class="card-img" src="${img}" alt="${p.title}" onerror="this.src='https://picsum.photos/600/400?random=${p.id}'"/>
            <div class="card-body">
                <div class="card-title">${p.title}</div>
                <div class="card-price">$${p.price}</div>
                <div class="qty-control">
                    <button class="qty-btn minus" onclick="decrease(${p.id})">−</button>
                    <span class="qty-count" id="qty-count-${p.id}">${p.quantity}</span>
                    <button class="qty-btn plus" onclick="increase(${p.id})">+</button>
                </div>
                <div class="card-subtotal" id="subtotal-${p.id}">Subtotal: $${p.price * p.quantity}</div>
                <button class="remove-btn" onclick="removeItem(${p.id})">✕ Remove</button>
            </div>
        `;
        grid.appendChild(card);
    });

    updateSummary();
}

renderCart();