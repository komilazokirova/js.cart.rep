let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let fetchedProducts = [];

const productsContainer = document.querySelector(".productsContainer");
const wishListBadge = document.getElementById("wishId");
const cartBadge = document.getElementById("cartId");

const api = "https://api.escuelajs.co/api/v1/products?limit=12&offset=10";

function updateBadges() {
    if (wishListBadge) wishListBadge.textContent = wishlist.reduce((sum, i) => sum + i.quantity, 0);
    if (cartBadge) cartBadge.textContent = cart.reduce((sum, i) => sum + i.quantity, 0);
}

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function setWishBtn(btn, added) {
    if (!btn) return;
    if (added) {
        btn.textContent = "✓ Added to Wishlist";
        btn.style.background = "#16a34a";
        btn.style.cursor = "not-allowed";
        btn.style.opacity = "0.9";
    } else {
        btn.textContent = "+ Add to Wishlist";
        btn.style.background = "#2563eb";
        btn.style.cursor = "pointer";
        btn.style.opacity = "1";
    }
}

function renderCartControl(id) {
    const cartItem = cart.find(item => item.id === id);
    const wrapper = document.getElementById(`cart-control-${id}`);
    if (!wrapper) return;

    if (cartItem) {
        wrapper.innerHTML = `
            <div class="flex items-center justify-between w-full bg-gray-100 rounded-xl overflow-hidden">
                <button onclick="decreaseCart(${id})" class="w-10 h-10 bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition cursor-pointer">−</button>
                <span class="font-bold text-gray-800 text-sm">${cartItem.quantity}</span>
                <button onclick="increaseCart(${id})" class="w-10 h-10 bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition cursor-pointer">+</button>
            </div>
        `;
    } else {
        wrapper.innerHTML = `
            <button
                id="cart-btn-${id}"
                onclick="addToCart(${id})"
                class="w-full py-2.5 text-white font-semibold text-sm rounded-xl transition"
                style="background:#7c3aed; cursor:pointer;">
                + Add to Cart
            </button>
        `;
    }
}

function increaseCart(id) {
    const item = cart.find(p => p.id === id);
    if (item) {
        item.quantity++;
        saveCart();
        updateBadges();
        renderCartControl(id);
    }
}

function decreaseCart(id) {
    const index = cart.findIndex(p => p.id === id);
    if (index !== -1) {
        cart[index].quantity--;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCart();
        updateBadges();
        renderCartControl(id);
    }
}

async function fetchProducts() {
    try {
        const response = await fetch(api);
        if (!response.ok) throw new Error("Serverda xatolik");
        fetchedProducts = await response.json();
        renderProducts(fetchedProducts);
    } catch (error) {
        console.error("Xatolik yuz berdi:", error);
        if (productsContainer) {
            productsContainer.innerHTML = `<p class="col-span-full text-center text-red-500 py-10 font-bold">Internet yoki API'da xatolik: ${error.message}</p>`;
        }
    }
}

function renderProducts(products) {
    if (!productsContainer) return;
    productsContainer.innerHTML = "";

    products.forEach((product) => {
        let productImg = "https://picsum.photos/600/400";
        if (product.images && product.images[0]) {
            let cleanImg = product.images[0].replace(/[\[\]\"]/g, "");
            if (cleanImg.startsWith("http") && !cleanImg.includes("imgur.com")) {
                productImg = cleanImg;
            } else {
                productImg = `https://picsum.photos/600/400?random=${product.id}`;
            }
        }

        const inWishlist = wishlist.some(item => item.id === product.id);
        const inCart = cart.find(item => item.id === product.id);

        const wishBtnStyle = inWishlist
            ? "background:#16a34a; cursor:not-allowed; opacity:0.9;"
            : "background:#2563eb; cursor:pointer; opacity:1;";

        const cartControlHTML = inCart
            ? `<div class="flex items-center justify-between w-full bg-gray-100 rounded-xl overflow-hidden">
                <button onclick="decreaseCart(${product.id})" class="w-10 h-10 bg-red-500 hover:bg-red-600 text-white font-bold text-lg transition cursor-pointer">−</button>
                <span class="font-bold text-gray-800 text-sm">${inCart.quantity}</span>
                <button onclick="increaseCart(${product.id})" class="w-10 h-10 bg-green-500 hover:bg-green-600 text-white font-bold text-lg transition cursor-pointer">+</button>
               </div>`
            : `<button
                id="cart-btn-${product.id}"
                onclick="addToCart(${product.id})"
                class="w-full py-2.5 text-white font-semibold text-sm rounded-xl transition"
                style="background:#7c3aed; cursor:pointer;">
                + Add to Cart
               </button>`;

        const cardElement = document.createElement("div");
        cardElement.className = "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between";
        cardElement.innerHTML = `
            <div>
                <div class="w-full bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center mb-4">
                    <img class="w-full h-[220px] object-cover rounded-xl" src="${productImg}" alt="${product.title}" onerror="this.src='https://picsum.photos/600/400?random=${product.id}'" />
                </div>
                <h3 class="text-base font-bold text-gray-800 line-clamp-1">${product.title}</h3>
                <p class="text-xl font-extrabold text-blue-600 mt-1.5">$${product.price}</p>
            </div>
            <div class="mt-4 space-y-2">
                <button
                    id="wish-btn-${product.id}"
                    onclick="addToWishlist(${product.id})"
                    class="w-full py-2.5 text-white font-semibold text-sm rounded-xl transition"
                    style="${wishBtnStyle}">
                    ${inWishlist ? "✓ Added to Wishlist" : "+ Add to Wishlist"}
                </button>
                <div id="cart-control-${product.id}">
                    ${cartControlHTML}
                </div>
            </div>
        `;
        productsContainer.appendChild(cardElement);
    });
}

function addToCart(id) {
    const product = fetchedProducts.find(p => p.id === id);
    if (!product) return;

    cart.push({ ...product, quantity: 1 });
    saveCart();
    updateBadges();
    renderCartControl(id);
}

function addToWishlist(id) {
    const product = fetchedProducts.find(p => p.id === id);
    if (!product) return;

    const exists = wishlist.some(item => item.id === id);
    if (exists) {
        alert(`"${product.title}" allaqachon wishlistga qo'shilgan!`);
    } else {
        wishlist.push({ ...product, quantity: 1 });
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
        updateBadges();
        setWishBtn(document.getElementById(`wish-btn-${id}`), true);
    }
}

fetchProducts();
updateBadges();