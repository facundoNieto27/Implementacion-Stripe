// Configuración de Stripe
const stripe = Stripe(
  "pk_test_51RVgPB2eKOzixHiV09sWn8TLXwHXgEnmLDTbdt8OOujhGCNhGxiF0dLOh8yBSpKTgto5WEEaBPE8uqhWDmibMZKX001ogEcWRi"
);
const elements = stripe.elements();

// Datos de productos
const products = [
  {
    id: 1,
    name: "Auriculares Premium",
    description:
      "Auriculares inalámbricos con cancelación de ruido y batería de 30 horas",
    price: 15999, // En centavos (159.99 USD)
    emoji: "🎧",
  },
  {
    id: 2,
    name: "Smartwatch Pro",
    description:
      "Reloj inteligente con GPS, monitor cardíaco y resistencia al agua",
    price: 29999, // En centavos (299.99 USD)
    emoji: "⌚",
  },
  {
    id: 3,
    name: "Cámara Digital 4K",
    description:
      "Cámara profesional con grabación 4K, estabilización y lente intercambiable",
    price: 89999, // En centavos (899.99 USD)
    emoji: "📷",
  },
];

let selectedProduct = null;
let cardNumber, cardExpiry, cardCvc;

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", function () {
  renderProducts();
  setupStripeElements();
  setupEventListeners();
  checkUrlParams();
});

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.innerHTML = `
      <div class="product-image">${product.emoji}</div>
      <div class="product-name">${product.name}</div>
      <div class="product-description">${product.description}</div>
      <div class="product-price">$${(product.price / 100).toFixed(2)} USD</div>
      <button class="btn" onclick="selectProduct(${product.id})">
          Comprar Ahora
      </button>
    `;
    grid.appendChild(productCard);
  });
}

function setupStripeElements() {
  const style = {
    base: {
      fontSize: "16px",
      color: "#424770",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
  };

  // Crear elementos individuales
  cardNumber = elements.create("cardNumber", {
    style: style,
    placeholder: "Número de tarjeta",
  });
  cardExpiry = elements.create("cardExpiry", { style: style });
  cardCvc = elements.create("cardCvc", { style: style, placeholder: "CVC" });

  // Montar elementos en el DOM
  cardNumber.mount("#card-number-element");
  cardExpiry.mount("#card-expiry-element");
  cardCvc.mount("#card-cvc-element");

  // Escuchar cambios en cada elemento para mostrar errores
  [cardNumber, cardExpiry, cardCvc].forEach((element) => {
    element.on("change", function (event) {
      const displayError = document.getElementById("card-errors");
      if (event.error) {
        displayError.textContent = event.error.message;
      } else {
        displayError.textContent = "";
      }
    });
  });
}

function setupEventListeners() {
  // Cerrar modal
  document.querySelector(".close").onclick = function () {
    document.getElementById("checkout-modal").style.display = "none";
  };

  // Cerrar modal clickeando fuera
  window.onclick = function (event) {
    const modal = document.getElementById("checkout-modal");
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Manejar envío del formulario
  document
    .getElementById("payment-form")
    .addEventListener("submit", handlePayment);
}

function selectProduct(productId) {
  selectedProduct = products.find((p) => p.id === productId);
  if (selectedProduct) {
    showCheckoutModal();
  }
}

function showCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  const orderDetails = document.getElementById("order-details");

  orderDetails.innerHTML = `
    <div class="order-item">
      <span>${selectedProduct.emoji} ${selectedProduct.name}</span>
      <span>$${(selectedProduct.price / 100).toFixed(2)}</span>
    </div>
    <div class="order-item total">
      <span>Total</span>
      <span>$${(selectedProduct.price / 100).toFixed(2)} USD</span>
    </div>
  `;

  modal.style.display = "block";
}

async function handlePayment(event) {
  event.preventDefault();

  const submitButton = document.getElementById("submit-payment");
  const buttonText = document.getElementById("button-text");

  // Mostrar loading
  submitButton.disabled = true;
  buttonText.innerHTML = '<div class="loading"></div>Procesando...';

  try {
    // Obtener datos del formulario
    const customerName = document.getElementById("customer-name").value;
    const customerEmail = document.getElementById("customer-email").value;

    // Crear token de la tarjeta
    const { token, error } = await stripe.createToken(cardNumber);

    if (error) {
      throw new Error(error.message);
    }

    // Enviar al backend
    const response = await fetch("/api/payments/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customerData: {
          name: customerName,
          email: customerEmail,
        },
        paymentMethodToken: token.id,
        paymentData: {
          amount: selectedProduct.price,
          currency: "usd",
          description: `Compra de ${selectedProduct.name}`,
          metadata: {
            product_id: selectedProduct.id,
            product_name: selectedProduct.name,
          },
        },
      }),
    });

    const result = await response.json();

    if (result.success) {
      // Pago exitoso
      window.location.href = `/api/payments/success?payment_intent=${result.data.paymentIntentId}`;
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    console.error("Error:", error);
    showAlert("Error al procesar el pago: " + error.message, "error");

    // Restaurar botón
    submitButton.disabled = false;
    buttonText.textContent = "Pagar Ahora";
  }
}

function showAlert(message, type) {
  const alertsContainer = document.getElementById("alerts");
  const alert = document.createElement("div");
  alert.className = `alert alert-${type}`;
  alert.textContent = message;

  alertsContainer.appendChild(alert);

  // Remover después de 5 segundos
  setTimeout(() => {
    alert.remove();
  }, 5000);
}

function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const status = urlParams.get("status");
  const message = urlParams.get("message");
  const paymentIntent = urlParams.get("payment_intent");

  if (status === "success") {
    showAlert("¡Pago realizado exitosamente! 🎉", "success");
    // Limpiar URL
    window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else if (status === "cancelled") {
          showAlert(message || "Pago cancelado", "info");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        } else if (status === "error") {
          showAlert(message || "Error en el pago", "error");
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }
      }
