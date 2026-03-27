/* ----------------------------------------------------
   FULL SCREEN MENU
---------------------------------------------------- */
function openMenu() {
    document.getElementById("fullscreenMenu").classList.add("show");
}

function closeMenu() {
    document.getElementById("fullscreenMenu").classList.remove("show");
}

/* ----------------------------------------------------
   BUY POPUP
---------------------------------------------------- */
// Opens the small buy popup with product details
function openPopup(img, title, price) {
    // price should be passed as plain number string, e.g. "1800"
    document.getElementById("buy-img").src = img;
    document.getElementById("buy-title").innerText = title;
    document.getElementById("buy-price").innerText = "€" + price;
    document.getElementById("popup").style.display = "flex";
}

function closeBuyPopup() {
    document.getElementById("popup").style.display = "none";
}

/* ----------------------------------------------------
   IMAGE VIEW POPUP
---------------------------------------------------- */
// Opens big image viewer
function openImage(img) {
    document.getElementById("big-image").src = img;
    document.getElementById("imagePopup").style.display = "flex";
}

function closeImage() {
    document.getElementById("imagePopup").style.display = "none";
}

/* ----------------------------------------------------
   CART SYSTEM — CLEAN & MODERN
---------------------------------------------------- */

// Cart is stored as an array of objects: { title, price, quantity }
let cart = [];

/* Add item to cart (from product or popup) */
function addToCart(title, price) {
    // price can be "€1800" or "1800" – normalize it to a number
    const numericPrice = parseFloat(
        String(price).replace("€", "").replace(",", "").trim()
    );

    const existingItem = cart.find(item => item.title === title);

    if (existingItem) {
        // If item already in cart, increase quantity
        existingItem.quantity++;
    } else {
        // Otherwise add new item
        cart.push({
            title,
            price: numericPrice,
            quantity: 1
        });
    }

    updateCart();
}

/* Add from Buy Popup */
function addToCartFromPopup() {
    const title = document.getElementById("buy-title").innerText;
    const priceText = document.getElementById("buy-price").innerText; // e.g. "€1800"

    addToCart(title, priceText);
    closeBuyPopup();
    closeImage();
    openCart(); // auto-open cart after adding
}

/* Update Cart UI */
function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const cartCount = document.getElementById("cart-count");
    const cartTotal = document.getElementById("cart-total");

    if (!cartItems || !cartTotal) return;

    cartItems.innerHTML = "";
    let total = 0;

    cart.forEach((item, index) => {
        total += item.quantity * item.price;

        cartItems.innerHTML += `
            <div class="cart-item">
                <div class="cart-item-header">
                    <p>${item.title}</p>
                </div>

                <p class="cart-price">€${item.price.toFixed(2)}</p>

                <div class="qty-box">
                    <button onclick="changeQuantity(${index}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="changeQuantity(${index}, 1)">+</button>
                </div>
            </div>
        `;
    });

    cartTotal.innerText = total.toFixed(2);

    if (cartCount) {
        let totalItems = 0;
        cart.forEach(item => totalItems += item.quantity);
        cartCount.innerText = totalItems;
    }

}

/* Change Quantity */
function changeQuantity(index, amount) {
    cart[index].quantity += amount;

    // If quantity goes to 0 or below, remove item
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    updateCart();
}

/* Remove Item (not used in UI now, but kept if you want later) */
function removeItem(index) {
    cart.splice(index, 1);
    updateCart();
}

/* ----------------------------------------------------
   CART OPEN/CLOSE
---------------------------------------------------- */
function openCart() {
    const cartOverlay = document.getElementById("cart");
    if (cartOverlay) {
        cartOverlay.style.display = "flex";
    }
}

function closeCart() {
    const cartOverlay = document.getElementById("cart");
    if (cartOverlay) {
        cartOverlay.style.display = "none";
    }
}

/* ----------------------------------------------------
   CHECKOUT POPUP
---------------------------------------------------- */
function openCheckout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    closeCart(); // CLOSE CART FIRST
    document.getElementById("checkoutPopup").style.display = "flex";
}


function closeCheckout() {
    document.getElementById("checkoutPopup").style.display = "none";
}

/* ----------------------------------------------------
   CHECKOUT FORM SUBMIT
---------------------------------------------------- */
const checkoutForm = document.getElementById("checkoutForm");

if (checkoutForm) {
    checkoutForm.addEventListener("submit", function (e) {
        e.preventDefault();

        // Collect order data
        window.orderData = {
            name: document.getElementById("name").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value,
            address: document.getElementById("address").value,
            items: cart,
            total: document.getElementById("cart-total").innerText
        };

        closeCheckout();
        openPaymentOptions();
    });
}

/* ----------------------------------------------------
   PAYMENT POPUPS
---------------------------------------------------- */
function openPaymentOptions() {
    document.getElementById("paymentPopup").style.display = "flex";
}

function closePaymentPopup() {
    document.getElementById("paymentPopup").style.display = "none";
}

function openOnlinePayment() {
    document.getElementById("onlinePaymentPopup").style.display = "flex";
}

function closeOnlinePayment() {
    document.getElementById("onlinePaymentPopup").style.display = "none";
}

/* ----------------------------------------------------
   PAYMENT METHODS
---------------------------------------------------- */
function payWithPhonePe() {
    alert("Redirecting to PhonePe...");
    window.location.href =
        "upi://pay?pa=yourupi@bank&pn=YourShop&am=" + window.orderData.total;
}

function payWithGooglePay() {
    alert("Redirecting to Google Pay...");
    window.location.href =
        "upi://pay?pa=yourupi@bank&pn=YourShop&am=" + window.orderData.total;
}

function confirmOnlinePayment() {
    handlePaymentSuccess();
}

function confirmCOD() {
    alert("Cash on Delivery selected");
    handlePaymentSuccess();
}

/* ----------------------------------------------------
   PAYMENT SUCCESS HANDLER
---------------------------------------------------- */
async function handlePaymentSuccess() {
    try {
        const response = await fetch("http://127.0.0.1:5001/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(window.orderData)
        });

        const result = await response.json();

        // Generate a simple order ID
        const orderId = "ORD" + Math.floor(Math.random() * 90000 + 10000);

        // Save last order in localStorage
        localStorage.setItem(
            "lastOrder",
            JSON.stringify({
                orderId,
                ...window.orderData
            })
        );

        // Redirect to success page
        window.location.href = "success.html";
    } catch (error) {
        console.error("Error sending order:", error);
        alert(
            "Payment succeeded but order failed to save. Please contact support."
        );
    }
}
