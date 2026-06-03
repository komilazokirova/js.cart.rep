let cart = JSON.parse(localStorage.getItem("cart")) || [];
const cartContainer = document.querySelector(".cartContainer");

cart = cart.map(item => ({ ...item, quantity: item.quantity || 1 }));

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function getTotalPrice() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function renderTotal() {
    let totalEl = document.getElementById("cartTotal");
    if (!totalEl) {
        totalEl = document.createElement("div");
        totalEl.id = "cartTotal";
        totalEl.className = "text-right mt-8 text-xl font-bold text-gray-800";
        cartContainer.parentElement.appendChild(totalEl);
    }
    if (cart.length === 0) {
        totalEl.textContent = "";
    } else {
        totalEl.textContent = `Total Price: $${getTotalPrice()}`;
    }
}

function renderCart() {
    if (!cartContainer) return;
    cartContainer.innerHTML = "";

    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="col-span-full text-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <p class="text-xl font-semibold text-gray-500 mb-4">Savatingiz hozircha bo'sh 🛒</p>
                <a href="index.html" class="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-blue-700 transition">
                    Xarid qilish
                </a>
            </div>
        `;
        renderTotal();
        return;
    }

    cart.forEach((product, index) => {
        let productImg = "https://picsum.photos/600/400";
        if (product.images && product.images[0]) {
            let cleanImg = product.images[0].replace(/[\[\]\"]/g, "");
            if (cleanImg.startsWith("http") && !cleanImg.includes("imgur.com")) {
                productImg = cleanImg;
            } else {
                productImg = `https://picsum.photos/600/400?random=${product.id}`;
            }
        }

        const subtotal = product.price * product.quantity;

        const card = document.createElement("div");
        card.className = "bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <div class="w-full bg-gray-50 rounded-xl overflow-hidden mb-4">
                    <img class="w-full h-[220px] object-cover rounded-xl" src="${productImg}" alt="${product.title}" onerror="this.src='https://picsum.photos/600/400?random=${product.id}'" />
                </div>
                <h3 class="text-base font-bold text-gray-800 line-clamp-1">${product.title}</h3>
                <p class="text-sm font-semibold text-blue-600 mt-1">Price: $${product.price}</p>
            </div>
            <div class="mt-3">
                <div class="flex items-center gap-3 mb-2">
                    <button onclick="changeQuantity(${index}, -1)" class="w-8 h-8 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition cursor-pointer flex items-center justify-center text-lg">−</button>
                    <span class="text-base font-bold text-gray-800">${product.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)" class="w-8 h-8 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition cursor-pointer flex items-center justify-center text-lg">+</button>
                </div>
                <p class="text-sm font-semibold text-gray-700 mb-3">Subtotal: $${subtotal}</p>
                <button onclick="removeItemFromCart(${index})" class="w-full py-2.5 bg-gray-900 hover:bg-gray-700 text-white font-semibold text-sm rounded-xl transition cursor-pointer">
                    Remove Product
                </button>
            </div>
        `;
        cartContainer.appendChild(card);
    });

    renderTotal();
}

function changeQuantity(index, delta) {
    cart[index].quantity = (cart[index].quantity || 1) + delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    saveCart();
    renderCart();
}

function removeItemFromCart(index) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
}

renderCart();