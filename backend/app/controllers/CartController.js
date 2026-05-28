const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

async function calculateTotal(products) {
  let total = 0;

  for (const item of products) {
    const product = await Product.findById(item.productId);
    if (!product) {
      throw new Error(`Producto no encontrado: ${item.productId}`);
    }

    total += product.price * item.quantity;
  }

  return total;
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({
      userId,
      products: [],
      total: 0
    });
  }

  return cart;
}

async function myCart(req, res) {
  try {
    const cart = await getOrCreateCart(req.user.id);
    cart.total = await calculateTotal(cart.products);
    await cart.save();

    return res.status(200).send({ cart });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

async function addProduct(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).send({ message: 'productId y quantity mayor a 0 son requeridos' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    const cart = await getOrCreateCart(req.user.id);
    const existingProduct = cart.products.find(item => item.productId.toString() === productId);
    const currentQuantity = existingProduct ? existingProduct.quantity : 0;

    if (currentQuantity + parsedQuantity > product.stock) {
      return res.status(400).send({ message: 'Stock insuficiente' });
    }

    if (existingProduct) {
      existingProduct.quantity += parsedQuantity;
    } else {
      cart.products.push({
        productId,
        quantity: parsedQuantity
      });
    }

    cart.total = await calculateTotal(cart.products);
    await cart.save();

    return res.status(200).send({ message: 'Producto agregado al carrito', cart });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

async function removeProduct(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    const parsedQuantity = Number(quantity);

    if (!productId || !Number.isInteger(parsedQuantity) || parsedQuantity < 1) {
      return res.status(400).send({ message: 'productId y quantity mayor a 0 son requeridos' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      return res.status(404).send({ message: 'Carrito no encontrado' });
    }

    const existingProduct = cart.products.find(item => item.productId.toString() === productId);
    if (!existingProduct) {
      return res.status(404).send({ message: 'Producto no encontrado en el carrito' });
    }

    existingProduct.quantity -= parsedQuantity;

    if (existingProduct.quantity <= 0) {
      cart.products = cart.products.filter(item => item.productId.toString() !== productId);
    }

    cart.total = await calculateTotal(cart.products);
    await cart.save();

    return res.status(200).send({ message: 'Producto quitado del carrito', cart });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

function listAll(req, res) {
  Cart.find({})
    .then(carts => {
      if (carts.length) return res.status(200).send({ carts });
      return res.status(204).send({ message: 'No Content' });
    })
    .catch(err => res.status(500).send({ err }));
}

function create(req, res) {
  let cart = new Cart(req.body);

  cart.save()
    .then(cart => res.status(201).send({ cart }))
    .catch(err => res.status(500).send({ err }));
}

function find(req, res, next) {
  req.body = req.body || {};
  let query = {};
  query[req.params.key] = req.params.value;

  Cart.find(query)
    .then(carts => {
      if (!carts.length) return next();
      req.body.carts = carts;
      return next();
    })
    .catch(err => {
      req.body.error = err;
      next();
    });
}

function show(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.carts) return res.status(404).send({ message: 'Not Found' });

  return res.status(200).send({ carts: req.body.carts });
}

function update(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.carts) return res.status(404).send({ message: 'Not Found' });

  let cart = req.body.carts[0];
  cart = Object.assign(cart, req.body);

  cart.save()
    .then(cart => res.status(200).send({ message: 'Updated', cart }))
    .catch(err => res.status(500).send({ err }));
}

function deleted(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.carts) return res.status(404).send({ message: 'Not Found' });

  req.body.carts[0].deleteOne()
    .then(cart => res.status(200).send({ message: 'Deleted', cart }))
    .catch(err => res.status(500).send({ err }));
}

module.exports = {
  myCart,
  addProduct,
  removeProduct,
  listAll,
  create,
  find,
  show,
  update,
  deleted
};
