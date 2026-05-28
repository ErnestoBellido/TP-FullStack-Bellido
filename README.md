# TP FullStack - Bellido

Proyecto fullstack de una tienda de productos de informatica orientada al armado de PCs. La aplicacion permite navegar un catalogo, registrarse, iniciar sesion, armar un carrito, confirmar una compra y administrar productos, categorias, usuarios y ordenes desde un panel de administrador.

El backend esta hecho con Node.js, Express y MongoDB. El frontend esta hecho con HTML, CSS y JavaScript puro, y se sirve desde el mismo servidor Express.

## Tecnologias

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- JSON Web Token (JWT)
- bcryptjs
- HTML
- CSS
- JavaScript
- localStorage

## Estructura del proyecto

```txt
TP-FullStack-Bellido/
|-- backend/
|   |-- app/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   `-- routes/
|   |-- package.json
|   `-- server.js
|-- frontend/
|   |-- css/
|   |-- images/
|   |-- js/
|   |-- admin.html
|   |-- carrito.html
|   |-- index.html
|   `-- login.html
`-- README.md
```

## Como levantar el proyecto

Entrar a la carpeta del backend:

```bash
cd backend
```

Instalar dependencias:

```bash
npm install
```

Levantar el servidor:

```bash
npm start
```

La aplicacion queda disponible en:

```txt
http://localhost:50001
```

Al entrar a esa URL se carga el frontend. Las rutas de la API tambien usan el mismo puerto.

## Configuracion

La configuracion principal esta en:

```txt
backend/app/config/config.js
```

Valores principales:

```js
PORT: 50001
DB: "conexion de MongoDB"
JWT_SECRET: "secreto"
JWT_EXPIRES: "1d"
ADMIN_CODE: "admin123"
```

Para crear un usuario administrador desde el registro hay que usar el codigo:

```txt
admin123
```

## Frontend

El frontend se encuentra en la carpeta `frontend/`.

Pantallas principales:

- `index.html`: catalogo general de productos.
- `login.html`: registro e inicio de sesion.
- `carrito.html`: carrito, pago local y ordenes del usuario.
- `admin.html`: panel de administracion.

Archivos JavaScript principales:

- `frontend/js/index.js`: carga productos y categorias, renderiza el catalogo, maneja filtros y agrega productos al carrito.
- `frontend/js/auth.js`: registra usuarios, inicia sesion y guarda la sesion.
- `frontend/js/carrito.js`: muestra el carrito, calcula total, confirma compras y muestra ordenes del usuario.
- `frontend/js/admin.js`: administra categorias, productos, stock, usuarios y ordenes.

Archivo de estilos:

- `frontend/css/styles.css`

## Funcionalidades del usuario

Un usuario comun puede:

- Ver el catalogo de productos.
- Filtrar productos por categoria.
- Ver productos aunque no tengan stock.
- Agregar productos con stock al carrito.
- Ver el total del carrito.
- Vaciar el carrito.
- Elegir metodo de pago.
- Confirmar la compra.
- Ver sus ordenes.

Cuando un producto no tiene stock:

- Sigue apareciendo en el catalogo.
- Muestra un cartel rojo que dice `Sin stock`.
- El selector de cantidad queda deshabilitado.
- El boton cambia a `No disponible`.
- No se puede agregar al carrito.

## Funcionalidades del administrador

Un usuario administrador puede:

- Crear categorias.
- Eliminar categorias.
- Crear productos.
- Eliminar productos.
- Subir o bajar el stock de productos.
- Crear usuarios.
- Eliminar usuarios.
- Ver ordenes.
- Eliminar ordenes.

El acceso al panel admin esta protegido. Si el usuario no inicio sesion o no tiene rol `admin`, se lo redirige al login.

## Uso de localStorage

El frontend usa `localStorage` para mantener informacion entre paginas y recargas.

Claves utilizadas:

```txt
token
user
carrito
```

`token` guarda el JWT que devuelve el backend al iniciar sesion. Se usa para acceder a rutas protegidas.

`user` guarda datos basicos del usuario logueado:

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "role": "admin"
}
```

`carrito` guarda los productos elegidos antes de confirmar la compra:

```json
[
  {
    "cantidad": 1,
    "producto": {
      "id": "ID_DEL_PRODUCTO",
      "name": "RTX 5070",
      "price": 1200000,
      "stock": 6
    }
  }
]
```

No se usa `sessionStorage` ni cookies.

Al cerrar sesion se eliminan:

```js
localStorage.removeItem("token");
localStorage.removeItem("user");
```

Al vaciar el carrito o terminar una compra se elimina:

```js
localStorage.removeItem("carrito");
```

## Flujo basico de uso

1. Entrar a `http://localhost:50001`.
2. Registrarse o iniciar sesion desde `Mi cuenta`.
3. Navegar el catalogo.
4. Agregar productos disponibles al carrito.
5. Entrar a `Mi carrito`.
6. Confirmar la compra con un metodo de pago.
7. Ver la orden generada.

## Flujo de administrador

1. Entrar a `Mi cuenta`.
2. Registrarse como admin usando `role: admin` y el codigo `admin123`.
3. Iniciar sesion.
4. Entrar a `Admin tools`.
5. Cargar categorias.
6. Cargar productos asociados a esas categorias.
7. Ajustar stock con los botones `+` y `-`.
8. Revisar usuarios y ordenes.

## Autenticacion y roles

El backend usa JWT. Cuando el usuario inicia sesion, el backend devuelve:

```json
{
  "token": "JWT",
  "user": {
    "name": "Usuario",
    "email": "usuario@test.com",
    "role": "user"
  }
}
```

Para consumir rutas protegidas se envia el token en el header:

```txt
Authorization: Bearer TOKEN
```

Roles disponibles:

- `user`: puede comprar y ver sus ordenes.
- `admin`: puede administrar productos, categorias, usuarios y ordenes.

## Rutas del frontend

```txt
GET /
GET /index.html
GET /login.html
GET /carrito.html
GET /admin.html
```

## Rutas de la API

Base URL:

```txt
http://localhost:50001
```

### Auth

```http
POST /auth/register
POST /auth/login
```

### Productos

Publicas:

```http
GET /products
GET /products/:key/:value
```

Solo admin:

```http
POST /products
PUT /products/:id/stock
PUT /products/:key/:value
DELETE /products/:key/:value
```

### Categorias

Publicas:

```http
GET /categories
GET /categories/:key/:value
```

Solo admin:

```http
POST /categories
PUT /categories/:key/:value
DELETE /categories/:key/:value
```

### Carrito

Rutas protegidas por login:

```http
GET /cart
GET /cart/my-cart
POST /cart/add
POST /cart/remove
POST /cart
GET /cart/:key/:value
PUT /cart/:key/:value
DELETE /cart/:key/:value
```

El frontend usa principalmente `localStorage` para el carrito visual y confirma la compra con `/orders/checkout-local`.

### Ordenes

Rutas protegidas por login:

```http
GET /orders/my
POST /orders/checkout
POST /orders/checkout-local
```

Solo admin:

```http
GET /orders
POST /orders
GET /orders/:key/:value
PUT /orders/:key/:value
DELETE /orders/:key/:value
```

### Usuarios

Solo admin:

```http
GET /users
POST /users
GET /users/:key/:value
PUT /users/:key/:value
DELETE /users/:key/:value
```

## Ejemplos de datos

### Registro de usuario comun

```json
{
  "name": "Usuario",
  "email": "usuario@test.com",
  "password": "123456"
}
```

### Registro de administrador

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin",
  "adminCode": "admin123"
}
```

### Login

```json
{
  "email": "usuario@test.com",
  "password": "123456"
}
```

### Categoria

```json
{
  "id": 1,
  "name": "placas de video",
  "description": "Componentes para video"
}
```

### Producto

```json
{
  "name": "RTX 3060",
  "price": 400000,
  "categoryId": 1,
  "specs": {
    "brand": "NVIDIA",
    "model": "RTX 3060",
    "details": "12GB GDDR6"
  },
  "stock": 10
}
```

### Actualizar stock

```json
{
  "stock": 5
}
```

### Confirmar compra local

```json
{
  "paymentMethod": "card",
  "items": [
    {
      "cantidad": 1,
      "producto": {
        "id": "ID_DEL_PRODUCTO"
      }
    }
  ]
}
```

Metodos de pago aceptados:

```txt
cash
card
transfer
```

## Modelos principales

### Usuario

Campos principales:

- `name`
- `email`
- `password`
- `role`

La password se guarda hasheada con `bcryptjs`.

### Producto

Campos principales:

- `name`
- `price`
- `categoryId`
- `specs`
- `stock`

### Categoria

Campos principales:

- `id`
- `name`
- `description`

### Orden

Campos principales:

- `orderNumber`
- `userId`
- `products`
- `total`
- `status`
- `paymentMethod`
- `paymentStatus`
- `deliveryDays`

## Validaciones importantes

- No se puede registrar un email repetido.
- Para crear un admin se requiere el codigo correcto.
- Las rutas admin requieren token y rol `admin`.
- No se puede comprar si el carrito esta vacio.
- No se puede comprar un producto inexistente.
- No se puede comprar mas cantidad que el stock disponible.
- Al confirmar la compra se descuenta el stock del producto.
- Los productos sin stock se muestran pero no se pueden agregar al carrito.
