const API_PRODUCTS_URL = "http://localhost:50001/products";
const API_CATEGORIES_URL = "http://localhost:50001/categories";
const API_USERS_URL = "http://localhost:50001/users";
const API_ORDERS_URL = "http://localhost:50001/orders";

const categoryForm = document.querySelector("#categoryForm");
const productForm = document.querySelector("#productForm");
const userForm = document.querySelector("#userForm");
const categorySelect = document.querySelector("#categorySelect");
const categoryList = document.querySelector("#categoryList");
const productList = document.querySelector("#productList");
const userList = document.querySelector("#userList");
const orderList = document.querySelector("#orderList");
const statusNode = document.querySelector("#adminStatus");
const logoutButton = document.querySelector("#logoutButton");

const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

function setStatus(message, type) {
  statusNode.textContent = message;
  statusNode.dataset.type = type || "";
}

function requireAdmin() {
  if (!token || !user || user.role !== "admin") {
    window.location.href = "login.html?redirect=admin.html";
  }
}

async function requestAdmin(url, options) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {})
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "No se pudo guardar.");
  }

  return data;
}

async function fetchAdmin(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (response.status === 204) {
    return {};
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "No se pudieron cargar los datos.");
  }

  return data;
}

function formatCategoryName(name) {
  return String(name)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function renderEmptyList(listNode, message) {
  listNode.innerHTML = `<li class="empty-message">${message}</li>`;
}

function formatOrderNumber(order) {
  return order.orderNumber || String(order._id).slice(-6).toUpperCase();
}

function formatOrderUser(order) {
  const name = order.user?.name || "Usuario eliminado";
  const email = order.user?.email ? ` - ${order.user.email}` : "";
  return `${name}${email} - ID ${order.userId}`;
}

async function loadCategories() {
  const response = await fetch(API_CATEGORIES_URL);
  const data = response.ok && response.status !== 204
    ? await response.json()
    : { categories: [] };

  const categories = data.categories || [];
  categorySelect.innerHTML = categories.length
    ? categories.map((category) => (
      `<option value="${category.id}">${formatCategoryName(category.name)}</option>`
    )).join("")
    : "<option value=''>Primero cargue una categoria</option>";

  if (!categories.length) {
    renderEmptyList(categoryList, "No hay categorias cargadas.");
    return;
  }

  categoryList.innerHTML = categories.map((category) => `
    <li class="admin-list__item">
      <div>
        <strong>${formatCategoryName(category.name)}</strong>
        <span>ID ${category.id}</span>
      </div>
      <button class="danger-button" type="button" data-delete-category="${category.id}">Eliminar</button>
    </li>
  `).join("");
}

async function loadProducts() {
  const response = await fetch(API_PRODUCTS_URL);
  const data = response.ok && response.status !== 204
    ? await response.json()
    : { products: [] };

  const products = data.products || [];

  if (!products.length) {
    renderEmptyList(productList, "No hay productos cargados.");
    return;
  }

  productList.innerHTML = products.map((product) => `
    <li class="admin-list__item">
      <div>
        <strong>${product.name}</strong>
        <span>Stock ${product.stock}</span>
      </div>
      <div class="admin-list__actions">
        <button class="stock-button" type="button" data-stock-product="${product._id}" data-stock-value="${product.stock - 1}" aria-label="Bajar stock de ${product.name}">-</button>
        <button class="stock-button" type="button" data-stock-product="${product._id}" data-stock-value="${product.stock + 1}" aria-label="Subir stock de ${product.name}">+</button>
        <button class="danger-button" type="button" data-delete-product="${product._id}">Eliminar</button>
      </div>
    </li>
  `).join("");
}

async function loadUsers() {
  const data = await fetchAdmin(API_USERS_URL);
  const users = data.users || [];

  if (!users.length) {
    renderEmptyList(userList, "No hay usuarios cargados.");
    return;
  }

  userList.innerHTML = users.map((item) => `
    <li class="admin-list__item">
      <div>
        <strong>${item.name}</strong>
        <span>${item.email} - ${item.role}</span>
      </div>
      <button class="danger-button" type="button" data-delete-user="${item._id}">Eliminar</button>
    </li>
  `).join("");
}

async function loadOrders() {
  const data = await fetchAdmin(API_ORDERS_URL);
  const orders = data.orders || [];

  if (!orders.length) {
    renderEmptyList(orderList, "No hay ordenes cargadas.");
    return;
  }

  orderList.innerHTML = orders.map((order) => `
    <li class="admin-list__item">
      <div>
        <strong>Orden #${formatOrderNumber(order)}</strong>
        <span>Total ${order.total} - ${order.status} - Usuario ${formatOrderUser(order)}</span>
      </div>
      <button class="danger-button" type="button" data-delete-order="${order._id}">Eliminar</button>
    </li>
  `).join("");
}

categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Guardando categoria...");

  const formData = new FormData(categoryForm);
  const payload = {
    id: Number(formData.get("id")),
    name: formData.get("name"),
    description: formData.get("description")
  };

  try {
    await requestAdmin(API_CATEGORIES_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    categoryForm.reset();
    await loadCategories();
    setStatus("Categoria guardada.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

productForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Guardando producto...");

  const formData = new FormData(productForm);
  const payload = {
    name: formData.get("name"),
    price: Number(formData.get("price")),
    categoryId: Number(formData.get("categoryId")),
    specs: {
      brand: formData.get("brand"),
      model: formData.get("model"),
      details: formData.get("details")
    },
    stock: Number(formData.get("stock"))
  };

  try {
    await requestAdmin(API_PRODUCTS_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    productForm.reset();
    await loadProducts();
    setStatus("Producto guardado.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Guardando usuario...");

  const formData = new FormData(userForm);
  const payload = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role")
  };

  try {
    await requestAdmin(API_USERS_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    userForm.reset();
    await loadUsers();
    setStatus("Usuario guardado.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

categoryList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-category]");

  if (!button) {
    return;
  }

  const categoryId = button.dataset.deleteCategory;
  setStatus("Eliminando categoria...");

  try {
    await requestAdmin(`${API_CATEGORIES_URL}/id/${categoryId}`, { method: "DELETE" });
    await loadCategories();
    await loadProducts();
    setStatus("Categoria eliminada.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

productList.addEventListener("click", async (event) => {
  const stockButton = event.target.closest("[data-stock-product]");
  const deleteButton = event.target.closest("[data-delete-product]");

  if (!stockButton && !deleteButton) {
    return;
  }

  if (stockButton) {
    const productId = stockButton.dataset.stockProduct;
    const stock = Math.max(0, Number(stockButton.dataset.stockValue));
    setStatus("Actualizando stock...");

    try {
      await requestAdmin(`${API_PRODUCTS_URL}/${productId}/stock`, {
        method: "PUT",
        body: JSON.stringify({ stock })
      });
      await loadProducts();
      setStatus("Stock actualizado.", "success");
    } catch (error) {
      setStatus(error.message, "error");
    }

    return;
  }

  const productId = deleteButton.dataset.deleteProduct;
  setStatus("Eliminando producto...");

  try {
    await requestAdmin(`${API_PRODUCTS_URL}/_id/${productId}`, { method: "DELETE" });
    await loadProducts();
    setStatus("Producto eliminado.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

userList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-user]");

  if (!button) {
    return;
  }

  const userId = button.dataset.deleteUser;
  setStatus("Eliminando usuario...");

  try {
    await requestAdmin(`${API_USERS_URL}/_id/${userId}`, { method: "DELETE" });
    await loadUsers();
    setStatus("Usuario eliminado.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

orderList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-delete-order]");

  if (!button) {
    return;
  }

  const orderId = button.dataset.deleteOrder;
  setStatus("Eliminando orden...");

  try {
    await requestAdmin(`${API_ORDERS_URL}/_id/${orderId}`, { method: "DELETE" });
    await loadOrders();
    setStatus("Orden eliminada.", "success");
  } catch (error) {
    setStatus(error.message, "error");
  }
});

logoutButton.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "index.html";
});

requireAdmin();
loadCategories();
loadProducts();
loadUsers();
loadOrders();
