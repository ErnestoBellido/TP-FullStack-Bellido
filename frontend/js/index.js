const productos = [
  {
    id: 1,
    name: "GeForce RTX 3060 12GB",
    category: "Placas de video",
    price: 420000,
    stock: 8,
    initials: "GPU",
    description: "Rinde bien para gaming en 1080p, render y edicion liviana."
  },
  {
    id: 2,
    name: "Ryzen 5 5600",
    category: "Procesadores",
    price: 185000,
    stock: 12,
    initials: "CPU",
    description: "Seis nucleos para una PC equilibrada de estudio, juego y trabajo."
  },
  {
    id: 3,
    name: "Motherboard B550M",
    category: "Motherboards",
    price: 142000,
    stock: 6,
    initials: "MB",
    description: "Formato compacto con M.2, USB 3.2 y soporte para Ryzen."
  },
  {
    id: 4,
    name: "Memoria DDR4 16GB",
    category: "Memorias",
    price: 69000,
    stock: 15,
    initials: "RAM",
    description: "Kit ideal para multitarea, navegacion y juegos actuales."
  },
  {
    id: 5,
    name: "SSD NVMe 1TB",
    category: "Almacenamiento",
    price: 98000,
    stock: 4,
    initials: "SSD",
    description: "Carga rapida de sistema, programas y proyectos pesados."
  },
  {
    id: 6,
    name: "Fuente 650W 80 Plus",
    category: "Fuentes",
    price: 116000,
    stock: 7,
    initials: "PSU",
    description: "Potencia estable para equipos gamer de gama media."
  }
];

const categoriesNode = document.querySelector("#categories");
const productsNode = document.querySelector("#products");
const productsTitleNode = document.querySelector("#productsTitle");
const productsCountNode = document.querySelector("#productsCount");
const cartCountNode = document.querySelector("#cartCount");
const accountLinkNode = document.querySelector("#accountLink");
const adminLinkNode = document.querySelector("#adminLink");

let activeCategory = "Todos";
let products = [];

const formatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0
});

const API_PRODUCTS_URL = "http://localhost:50001/products";
const API_CATEGORIES_URL = "http://localhost:50001/categories";

function formatoTitulo(text) {
  return String(text)
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function obtenerIniciales(product, category) {
  if (product.initials) {
    return product.initials;
  }

  const name = product.name || product.nombre || category;
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

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
    imageBox.appendChild(document.createTextNode(product.initials));
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

  if (!sources.length) {
    fallback();
    return;
  }

  img.src = sources[sourceIndex];
  imageBox.appendChild(img);
}

function normalizarProducto(product, index, categoriasPorId) {
  const categoryName = categoriasPorId[product.categoryId];
  const category = product.category || categoryName || `Categoria ${product.categoryId || "General"}`;
  const details = product.description || product.specs?.details || "Producto disponible en BTECH.";
  const initials = obtenerIniciales(product, category);

  return {
    id: product.id || product._id || index + 1,
    name: product.name || product.nombre,
    category,
    price: Number(product.price || product.precio || 0),
    stock: Number(product.stock || 0),
    initials,
    description: details,
    imagen: product.imagen || ""
  };
}

function normalizarCategorias(categories) {
  return categories.reduce((acc, category) => {
    acc[category.id] = formatoTitulo(category.name);
    return acc;
  }, {});
}

function getCategories() {
  return ["Todos", ...new Set(products.map((product) => product.category))];
}

function getProductsByCategory() {
  if (activeCategory === "Todos") {
    return products;
  }

  return products.filter((product) => product.category === activeCategory);
}

function renderCategories() {
  categoriesNode.innerHTML = getCategories()
    .map((category) => {
      const amount = category === "Todos"
        ? products.length
        : products.filter((product) => product.category === category).length;
      const isActive = category === activeCategory;

      return `
        <button class="category ${isActive ? "category--active" : ""}" type="button" data-category="${category}">
          <span>${category}</span>
          <span class="category__count">${amount}</span>
        </button>
      `;
    })
    .join("");
}

function renderProducts() {
  const visibleProducts = getProductsByCategory();
  productsTitleNode.textContent = activeCategory === "Todos" ? "Todos los productos" : activeCategory;
  productsCountNode.textContent = `${visibleProducts.length} productos`;

  cargarProductos(visibleProducts);
}

function cargarProductos(array) {
  productsNode.innerHTML = "";

  if (array.length === 0) {
    const empty = document.createElement("p");
    empty.classList.add("empty-message");
    empty.appendChild(document.createTextNode("No hay productos para mostrar."));
    productsNode.appendChild(empty);
    return;
  }

  for (let index = 0; index < array.length; index++) {
    const element = array[index];
    const sinStock = element.stock <= 0;

    const content_element = document.createElement("article");
    content_element.classList.add("product-card");
    if (sinStock) {
      content_element.classList.add("product-card--without-stock");
    }

    const imageBox = document.createElement("div");
    imageBox.classList.add("product-card__image");
    imageBox.setAttribute("aria-hidden", "true");

    appendImageOrInitials(imageBox, element);

    const body = document.createElement("div");
    body.classList.add("product-card__body");

    const category = document.createElement("span");
    category.classList.add("product-card__category");
    category.appendChild(document.createTextNode(element.category));

    const nombre = document.createElement("h3");
    nombre.appendChild(document.createTextNode(element.name));

    const desc = document.createElement("p");
    desc.classList.add("product-card__description");
    desc.appendChild(document.createTextNode(element.description));

    const meta = document.createElement("div");
    meta.classList.add("product-card__meta");

    const precio = document.createElement("span");
    precio.classList.add("product-card__price");
    precio.appendChild(document.createTextNode(formatter.format(element.price)));

    let stock = null;
    if (sinStock) {
      stock = document.createElement("span");
      stock.classList.add("stock", "stock--empty");
      stock.appendChild(document.createTextNode("Sin stock"));
    }

    const controls = document.createElement("div");
    controls.classList.add("product-card__controls");

    const cantidad = document.createElement("input");
    cantidad.type = "number";
    cantidad.min = 1;
    cantidad.max = Math.max(1, element.stock);
    cantidad.value = sinStock ? 0 : 1;
    cantidad.disabled = sinStock;
    cantidad.classList.add("product-card__quantity");
    cantidad.setAttribute("aria-label", `Cantidad de ${element.name}`);

    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("product-card__action");
    button.disabled = sinStock;
    button.appendChild(document.createTextNode(sinStock ? "No disponible" : "Agregar"));

    button.addEventListener("click", function () {
      if (sinStock) {
        return;
      }

      if (!localStorage.getItem("token")) {
        window.location.href = "login.html?redirect=index.html";
        return;
      }

      Ordenar(element, cantidad.value);
      button.textContent = "Agregado";

      window.setTimeout(() => {
        button.textContent = "Agregar";
      }, 900);
    });

    meta.appendChild(precio);
    if (stock) {
      meta.appendChild(stock);
    }

    controls.appendChild(cantidad);
    controls.appendChild(button);

    body.appendChild(category);
    body.appendChild(nombre);
    body.appendChild(desc);
    body.appendChild(meta);
    body.appendChild(controls);

    content_element.appendChild(imageBox);
    content_element.appendChild(body);

    productsNode.appendChild(content_element);
  }
}

function Ordenar(elemento, cantidad) {
  if (elemento.stock <= 0) {
    return;
  }

  const cantidadNumber = Number(cantidad);
  const cantidadFinal = Math.min(cantidadNumber > 0 ? cantidadNumber : 1, elemento.stock);
  const item = { cantidad: cantidadFinal, producto: elemento };
  const carrito_storage = localStorage.getItem("carrito");
  let carrito;

  if (carrito_storage != null) {
    carrito = JSON.parse(carrito_storage);
  } else {
    carrito = [];
  }

  carrito.push(item);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  actualizarContadorCarrito();
  console.log(carrito);
}

function actualizarContadorCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const total = carrito.reduce((acc, item) => acc + Number(item.cantidad), 0);
  cartCountNode.textContent = total;
}

function actualizarAccesos() {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (token && user) {
    accountLinkNode.textContent = user.name || "Mi cuenta";
    accountLinkNode.href = user.role === "admin" ? "admin.html" : "carrito.html";
  }

  adminLinkNode.classList.toggle("admin-link--visible", Boolean(token && user && user.role === "admin"));
}

async function obtenerProductos() {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(API_PRODUCTS_URL),
      fetch(API_CATEGORIES_URL)
    ]);

    if (!productsResponse.ok) {
      throw new Error("No se pudieron traer productos del backend.");
    }

    const productsData = productsResponse.status !== 204
      ? await productsResponse.json()
      : { products: [] };
    const categoriesData = categoriesResponse.ok && categoriesResponse.status !== 204
      ? await categoriesResponse.json()
      : { categories: [] };
    const categoriasPorId = normalizarCategorias(categoriesData.categories || []);

    products = productsData.products.map((product, index) => (
      normalizarProducto(product, index, categoriasPorId)
    ));
  } catch (error) {
    console.error("Error:", error);
    products = [];
  }

  renderCategories();
  renderProducts();
  actualizarContadorCarrito();
  actualizarAccesos();
}

categoriesNode.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");

  if (!button) {
    return;
  }

  activeCategory = button.dataset.category;
  renderCategories();
  renderProducts();
});

window.onload = function () {
  obtenerProductos();
};
