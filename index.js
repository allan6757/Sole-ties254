const API_URL = "http://localhost:3001/products";

// Select elements
const productList = document.getElementById("product-list");
const formSection = document.getElementById("add-edit-section");
const form = document.getElementById("product-form");
const showAddFormBtn = document.getElementById("show-add-form");
const cancelEditBtn = document.getElementById("cancel-edit");
const formTitle = document.getElementById("form-title");
const messageBox = document.getElementById("message");

const cartBtn = document.getElementById("cart-btn");
const cartSidebar = document.getElementById("cart-sidebar");
const cartCountSpan = document.getElementById("cart-count");
const cartItemsList = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const closeCartBtn = document.getElementById("close-cart");

const shoppedSection = document.getElementById("shopped-section");
const shoppedList = document.getElementById("shopped-list");
const navLinks = document.querySelectorAll('.nav-link');

let editingId = null;
let cart = JSON.parse(localStorage.getItem("soleTiesCart") || "[]");
let shopped = JSON.parse(localStorage.getItem("soleTiesShopped") || "[]");

// Show a message
function showMessage(msg, timeout = 2000) {
    messageBox.textContent = msg;
    messageBox.classList.remove("hidden");
    clearTimeout(showMessage.timer);
    showMessage.timer = setTimeout(() => messageBox.classList.add("hidden"), timeout);
}

// Smooth navigation between sections
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        const id = link.getAttribute('href').replace('#', '');
        // Hide all main sections
        document.querySelectorAll('main > section').forEach(sec => sec.classList.add('hidden'));
        // Show the right section
        const target = document.getElementById(id);
        if (target) {
            target.classList.remove('hidden');
            window.scrollTo({ top: target.offsetTop - 60, behavior: 'smooth' });
            if (id === "shopped-section") renderShopped();
        }
        // Always prevent default anchor jump
        e.preventDefault();
    });
});

// Load all products
function loadProducts() {
    fetch(API_URL)
        .then(res => res.json())
        .then(products => {
            productList.innerHTML = "";
            products.forEach(product => renderProductCard(product));
        });
}

// Render a product card
function renderProductCard(product) {
    const card = document.createElement("div");
    card.className = "product-card";
    card.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <h3>${product.name}</h3>
    <p><strong>Price:</strong> KES ${product.price}</p>
    <p><strong>Size:</strong> ${product.size}</p>
    <p><strong>Condition:</strong> ${product.condition}</p>
    <div class="card-actions">
      <button class="buy-btn">Buy</button>
      <button class="cart-btn">Add to Cart</button>
      <button class="edit-btn">Edit</button>
      <button class="delete-btn">Delete</button>
    </div>
  `;
    // Buy button (direct from products)
    card.querySelector(".buy-btn").onclick = () => {
        buyProductFromProducts(product);
    };
    // Add to cart
    card.querySelector(".cart-btn").onclick = () => {
        addToCart(product);
    };
    // Edit product
    card.querySelector(".edit-btn").onclick = () => {
        startEdit(product);
    };
    // Delete product
    card.querySelector(".delete-btn").onclick = () => {
        if (confirm("Delete this product?")) {
            fetch(`${API_URL}/${product.id}`, { method: "DELETE" })
                .then(() => {
                    showMessage("Product deleted");
                    loadProducts();
                });
        }
    };
    productList.appendChild(card);
}

// Buy from products section (adds to shopped)
function buyProductFromProducts(product) {
    addToShopped(product);
    showMessage(`You bought "${product.name}"!`);
}

// Show add form
showAddFormBtn.onclick = () => {
    editingId = null;
    formTitle.textContent = "Add New Product";
    form.reset();
    cancelEditBtn.classList.add("hidden");
    formSection.classList.remove("hidden");
    window.scrollTo({ top: formSection.offsetTop, behavior: 'smooth' });
};

// Cancel edit
cancelEditBtn.onclick = () => {
    editingId = null;
    form.reset();
    cancelEditBtn.classList.add("hidden");
    formSection.classList.add("hidden");
    showMessage("Edit cancelled.");
};

// Add or update product
form.onsubmit = function (e) {
    e.preventDefault();
    const product = {
        name: form.name.value.trim(),
        price: Number(form.price.value),
        size: form.size.value.trim(),
        condition: form.condition.value.trim(),
        image: form.image.value.trim(),
        status: "available"
    };

    if (editingId) {
        fetch(`${API_URL}/${editingId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        })
            .then(res => res.json())
            .then(() => {
                showMessage("Product updated!");
                editingId = null;
                form.reset();
                cancelEditBtn.classList.add("hidden");
                formSection.classList.add("hidden");
                loadProducts();
            });
    } else {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(product)
        })
            .then(res => res.json())
            .then(() => {
                showMessage("Product added!");
                form.reset();
                formSection.classList.add("hidden");
                loadProducts();
            });
    }
};

// Start editing a product
function startEdit(product) {
    editingId = product.id;
    formTitle.textContent = "Edit Product";
    form.name.value = product.name;
    form.price.value = product.price;
    form.size.value = product.size;
    form.condition.value = product.condition;
    form.image.value = product.image;
    formSection.classList.remove("hidden");
    cancelEditBtn.classList.remove("hidden");
    window.scrollTo({ top: formSection.offsetTop, behavior: 'smooth' });
}

// --- CART FUNCTIONS ---

function updateCartCount() {
    cartCountSpan.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}
function saveCart() {
    localStorage.setItem("soleTiesCart", JSON.stringify(cart));
    updateCartCount();
}
function openCart() {
    renderCartItems();
    cartSidebar.classList.remove("hidden");
    closeCartBtn.focus();
}
function closeCart() {
    cartSidebar.classList.add("hidden");
    cartBtn.focus();
}
function renderCartItems() {
    cartItemsList.innerHTML = '';
    if (cart.length === 0) {
        cartItemsList.innerHTML = '<li>Your cart is empty.</li>';
        cartTotal.textContent = '';
        return;
    }
    let total = 0;
    cart.forEach(item => {
        total += item.price * item.qty;
        const li = document.createElement("li");
        li.innerHTML = `
      <span>${item.name} (x${item.qty})<br/>Ksh ${item.price}</span>
      <span>
        <button class="cart-buy-btn" aria-label="Buy ${item.name}">Buy</button>
        <button aria-label="Remove ${item.name} from cart">&times;</button>
      </span>
    `;
        // Buy button in cart
        li.querySelector(".cart-buy-btn").onclick = () => {
            buyProductFromCart(item);
        };
        // Remove from cart
        li.querySelectorAll("button")[1].onclick = () => {
            removeFromCart(item.id);
        };
        cartItemsList.appendChild(li);
    });
    cartTotal.textContent = `Total: Ksh ${total}`;
}
function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
    }
    saveCart();
    showMessage(`Added "${product.name}" to cart!`);
}
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCartItems();
}

// Buy product from cart (move to shopped, remove from cart)
function buyProductFromCart(item) {
    // Add to shopped
    addToShopped(item);
    // Remove from cart
    removeFromCart(item.id);
    showMessage(`You bought "${item.name}"!`);
}

// Shopped (bought) items functions
function addToShopped(product) {
    // Avoid duplicates
    if (!shopped.find(item => item.id === product.id)) {
        shopped.push({ ...product });
        localStorage.setItem("soleTiesShopped", JSON.stringify(shopped));
    }
    renderShopped();
}
function renderShopped() {
    shoppedList.innerHTML = '';
    if (!shopped.length) {
        shoppedList.innerHTML = `<div style="padding:2rem;text-align:center;">No shopped items yet.</div>`;
        return;
    }
    shopped.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card bought";
        card.innerHTML = `
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p><strong>Price:</strong> KES ${product.price}</p>
      <p><strong>Size:</strong> ${product.size || ""}</p>
      <p><strong>Condition:</strong> ${product.condition || ""}</p>
    `;
        shoppedList.appendChild(card);
    });
}

// Cart events
cartBtn.onclick = openCart;
closeCartBtn.onclick = closeCart;
cartSidebar.addEventListener("keydown", e => {
    if (e.key === "Escape") closeCart();
});

// On page load
window.onload = () => {
    // Only show products section on load
    document.querySelectorAll('main > section').forEach((sec, i) => {
        sec.classList.toggle('hidden', sec.id !== "products-section");
    });
    loadProducts();
    updateCartCount();
    renderShopped();
};