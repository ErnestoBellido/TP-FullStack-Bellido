const API_AUTH_URL = "http://localhost:50001/auth";

const loginForm = document.querySelector("#loginForm");
const registerForm = document.querySelector("#registerForm");
const statusNode = document.querySelector("#authStatus");
const isAdminNode = document.querySelector("#isAdmin");
const adminCodeGroup = document.querySelector("#adminCodeGroup");

function getRedirectUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("redirect") || "index.html";
}

function setStatus(message, type) {
  statusNode.textContent = message;
  statusNode.dataset.type = type || "";
}

function saveSession(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
}

async function login(email, password) {
  const response = await fetch(`${API_AUTH_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || data.error || "No se pudo iniciar sesion.");
  }

  saveSession(data);
  window.location.href = getRedirectUrl();
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Iniciando sesion...");

  const formData = new FormData(loginForm);

  try {
    await login(formData.get("email"), formData.get("password"));
  } catch (error) {
    setStatus(error.message, "error");
  }
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setStatus("Creando cuenta...");

  const formData = new FormData(registerForm);
  const email = formData.get("email");
  const password = formData.get("password");
  const isAdmin = formData.get("isAdmin") === "on";

  const payload = {
    name: formData.get("name"),
    email,
    password,
    role: isAdmin ? "admin" : "user",
    adminCode: isAdmin ? formData.get("adminCode") : ""
  };

  try {
    const response = await fetch(`${API_AUTH_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || data.error || "No se pudo crear la cuenta.");
    }

    await login(email, password);
  } catch (error) {
    setStatus(error.message, "error");
  }
});

isAdminNode.addEventListener("change", () => {
  adminCodeGroup.classList.toggle("admin-code--visible", isAdminNode.checked);
});
