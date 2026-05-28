const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

const API_ORDERS_URL = "http://localhost:50001/orders";
const logoutButton = document.getElementById("logoutButton");
const ordersSection = document.getElementById("ordersSection");
const ordersList = document.getElementById("mis_ordenes");
const paymentForm = document.getElementById("paymentForm");
const paymentStatus = document.getElementById("paymentStatus");
const cancelPaymentButton = document.getElementById("cancelPaymentButton");
const confirmPaymentButton = document.getElementById("confirmPaymentButton");
const successToast = document.getElementById("successToast");

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function categoryImageCandidates(category) {
  const slug = slugify(category);

  return [
    `images/categorias/${slug}.png`,
    `images/categorias/${slug}.jpg`,
    `images/categorias/${slug}.jpeg`,
    `images/categorias/${slug}.webp`,
    `images/${slug}.png`,
    `images/${slug}.jpg`,
    `images/${slug}.jpeg`,
    `images/${slug}.webp`
  ];
}

function appendImageOrInitials(imageBox, product) {
  const fallback = () => {
    imageBox.innerHTML = "";
    imageBox.appendChild(document.createTextNode(product.initials || "BT"));
  };

  const sources = product.imagen
    ? [`images/${product.imagen}`, ...categoryImageCandidates(product.category)]
    : categoryImageCandidates(product.category);
  let sourceIndex = 0;
  const img = document.createElement("img");
  img.alt = product.name;

  img.addEventListener("error", () => {
    sourceIndex += 1;

    if (sourceIndex >= sources.length) {
      fallback();
      return;
    }

    img.src = sources[sourceIndex];
  });

  img.src = sources[sourceIndex];
  imageBox.appendChild(img);
}

function mostrarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito"));
  const lista = document.getElementById("lista_carrito");
  const total_div = document.getElementById("total");
  let total = 0;

  lista.innerHTML = "";
  total_div.innerHTML = "";

  if (!carrito || carrito.length === 0) {
    const empty = document.createElement("li");
    empty.classList.add("empty-message");
    empty.appendChild(document.createTextNode("Carrito vacio."));
    lista.appendChild(empty);
    return;
  }

  for (let index = 0; index < carrito.length; index++) {
    const element = carrito[index];
    const producto = element.producto;
    const subtotal = Number(producto.price) * Number(element.cantidad);
    total += subtotal;

    const li = document.createElement("li");
    li.classList.add("cart-item");

    const imgBox = document.createElement("div");
    imgBox.classList.add("cart-item__image");

    appendImageOrInitials(imgBox, producto);

    const info = document.createElement("div");
    info.classList.add("cart-item__info");

    const nombre = document.createElement("p");
    nombre.classList.add("cart-item__name");
    nombre.appendChild(document.createTextNode(producto.name));

    const precio = document.createElement("p");
    precio.classList.add("cart-item__price");
    precio.appendChild(document.createTextNode(formatter.format(producto.price)));

    const cantidad = document.createElement("h2");
    cantidad.classList.add("cart-item__quantity");
    cantidad.appendChild(document.createTextNode(`x${element.cantidad}`));

    const subtotalTag = document.createElement("strong");
    subtotalTag.appendChild(document.createTextNode(formatter.format(subtotal)));

    info.appendChild(nombre);
    info.appendChild(precio);

    li.appendChild(imgBox);
    li.appendChild(info);
    li.appendChild(cantidad);
    li.appendChild(subtotalTag);

    lista.appendChild(li);
  }

  if (total > 0) {
    const total_tag = document.createElement("h2");
    const total_txt = document.createTextNode(`Total: ${formatter.format(total)}`);
    total_tag.appendChild(total_txt);
    total_div.appendChild(total_tag);
  }
}

function limpiarCarrito() {
  localStorage.removeItem("carrito");
  ocultarPago();
  mostrarCarrito();
}

function mostrarPago() {
  if (!localStorage.getItem("token")) {
    window.location.href = "login.html?redirect=carrito.html";
    return;
  }

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (!carrito.length) {
    alert("El carrito esta vacio.");
    return;
  }

  paymentStatus.textContent = "";
  paymentForm.classList.add("payment-panel--visible");
}

function ocultarPago() {
  paymentForm.classList.remove("payment-panel--visible");
  paymentStatus.textContent = "";
}

function mostrarCelebracion() {
  successToast.classList.add("success-toast--visible");

  for (let index = 0; index < 18; index++) {
    const piece = document.createElement("span");
    piece.classList.add("confetti-piece");
    piece.style.left = `${15 + Math.random() * 70}%`;
    piece.style.background = index % 2 === 0 ? "#2fd17c" : "#f7b955";
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    document.body.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 1200);
  }

  window.setTimeout(() => {
    successToast.classList.remove("success-toast--visible");
  }, 2600);
}

async function Comprar(paymentMethod) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  paymentStatus.textContent = "Registrando compra...";
  confirmPaymentButton.disabled = true;

  try {
    const response = await fetch(`${API_ORDERS_URL}/checkout-local`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({
        items: carrito,
        paymentMethod
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "No se pudo registrar la compra.");
    }

    localStorage.removeItem("carrito");
    paymentStatus.textContent = "";
    ocultarPago();
    mostrarCarrito();
    await cargarMisOrdenes();
    mostrarCelebracion();
  } catch (error) {
    paymentStatus.textContent = error.message;
  } finally {
    confirmPaymentButton.disabled = false;
  }
}

function actualizarSesion() {
  if (!localStorage.getItem("token")) {
    logoutButton.style.display = "none";
    ordersSection.style.display = "none";
  }
}

function traducirEstado(status) {
  const estados = {
    pending: "Pendiente",
    paid: "Pagado",
    cancelled: "Cancelado"
  };

  return estados[status] || status;
}

function traducirPago(paymentMethod) {
  const metodos = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer: "Transferencia"
  };

  return metodos[paymentMethod] || paymentMethod;
}

function numeroOrden(order) {
  if (order.orderNumber) {
    return order.orderNumber;
  }

  return String(order._id).slice(-6).toUpperCase();
}

function diasEntrega(order) {
  if (order.deliveryDays) {
    return order.deliveryDays;
  }

  const parsed = parseInt(String(order._id).slice(-1), 16);
  return Number.isNaN(parsed) ? 4 : (parsed % 10) + 1;
}

async function cargarMisOrdenes() {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  try {
    const response = await fetch(`${API_ORDERS_URL}/my`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (response.status === 204) {
      ordersList.innerHTML = "<li class='empty-message'>Todavia no tenes ordenes.</li>";
      return;
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "No se pudieron cargar las ordenes.");
    }

    const orders = data.orders || [];
    ordersList.innerHTML = orders.map((order) => `
      <li class="order-card">
        <details>
          <summary>
            <span>
              <strong>Orden #${numeroOrden(order)}</strong>
              <small>${traducirEstado(order.status)} - ${traducirPago(order.paymentMethod)}</small>
              <small>Se entrega en ${diasEntrega(order)} dias</small>
            </span>
            <span>${order.products.length} prod.</span>
            <strong>${formatter.format(order.total)}</strong>
          </summary>
          <div class="order-detail">
            ${(order.products || []).map((item) => `
              <p>
                <span>${item.productName || "Producto"}</span>
                <span>x${item.quantity}</span>
                <strong>${formatter.format(item.subtotal || 0)}</strong>
              </p>
            `).join("")}
          </div>
        </details>
      </li>
    `).join("");
  } catch (error) {
    ordersList.innerHTML = `<li class='empty-message'>${error.message}</li>`;
  }
}

logoutButton.addEventListener("click", function () {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

paymentForm.addEventListener("submit", function (event) {
  event.preventDefault();
  const formData = new FormData(paymentForm);
  Comprar(formData.get("paymentMethod"));
});

cancelPaymentButton.addEventListener("click", ocultarPago);

window.onload = function () {
  actualizarSesion();
  mostrarCarrito();
  cargarMisOrdenes();
};
