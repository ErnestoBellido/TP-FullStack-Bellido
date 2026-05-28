# TP FullStack - Bellido

Backend de una tienda de productos de informatica para armado de PCs.

## Tecnologias

- Node.js
- Express
- MongoDB
- Mongoose
- JWT

## Como levantarlo

Primero instalar dependencias si hace falta:

```bash
cd backend
npm install
```

Despues levantar el servidor:

```bash
npm start
```

Corre en:

```txt
http://localhost:50001
```

## Usuarios

Para registrarse:

```http
POST /auth/register
```

Ejemplo usuario normal:

```json
{
  "name": "Usuario",
  "email": "usuario@test.com",
  "password": "123456"
}
```

Para iniciar sesion:

```http
POST /auth/login
```

El login devuelve un token. Para usar las rutas protegidas hay que mandarlo asi:

```txt
Authorization: Bearer TOKEN
```

Para crear un admin se manda el rol y el codigo:

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin",
  "adminCode": "admin123"
}
```

El usuario comun puede usar carrito y comprar. El admin ademas puede crear, editar y borrar productos, categorias y usuarios.

La diferencia se hace con el campo `role`. Si no se manda nada, el usuario queda como `user`. Para que sea admin hay que mandar `role: "admin"` y tambien el `adminCode`. Cuando inicia sesion, el token guarda ese rol y con eso se revisa si puede entrar a las rutas de admin.

## Rutas principales

```http
POST /auth/register
POST /auth/login

GET /products
GET /products/:key/:value
GET /categories
GET /categories/:key/:value

POST /cart/add
POST /cart/remove
GET /cart/my-cart

POST /orders/checkout
GET /orders
```

Solo admin:

```http
POST /products
PUT /products/:key/:value
DELETE /products/:key/:value

POST /categories
PUT /categories/:key/:value
DELETE /categories/:key/:value

GET /users
POST /users
GET /users/:key/:value
PUT /users/:key/:value
DELETE /users/:key/:value
```

## Datos de prueba

Usuario comun:

```json
{
  "name": "Usuario",
  "email": "usuario@test.com",
  "password": "123456"
}
```

Admin:

```json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "123456",
  "role": "admin",
  "adminCode": "admin123"
}
```

Producto:

```json
{
  "name": "RTX 3060",
  "price": 400,
  "categoryId": 1,
  "specs": {
    "brand": "NVIDIA",
    "model": "RTX 3060",
    "details": "12GB GDDR6"
  },
  "stock": 10
}
```

Categoria:

```json
{
  "id": 1,
  "name": "placas de video",
  "description": "Componentes para video"
}
```

## Flujo basico

1. Registrar un usuario.
2. Iniciar sesion y copiar el token.
3. Crear o usar un admin.
4. Con el admin cargar productos.
5. Con el usuario agregar productos al carrito.
6. Hacer checkout.
