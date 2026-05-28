const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');
const User = require('../models/UserModel');

function generateOrderNumber() {
  return Math.floor(100000 + Math.random() * 900000);
}

function generateDeliveryDays() {
  return Math.floor(1 + Math.random() * 10);
}

function fallbackOrderNumber(order) {
  return Number(String(order._id).slice(-6).replace(/\D/g, '').padStart(6, '0'));
}

function fallbackDeliveryDays(order) {
  const lastChar = String(order._id).slice(-1);
  const parsed = parseInt(lastChar, 16);
  return Number.isNaN(parsed) ? 4 : (parsed % 10) + 1;
}

async function decorateOrder(order) {
  const plainOrder = order.toObject ? order.toObject() : order;
  const user = await User.findById(plainOrder.userId).select('name email');

  plainOrder.orderNumber = plainOrder.orderNumber || fallbackOrderNumber(plainOrder);
  plainOrder.deliveryDays = plainOrder.deliveryDays || fallbackDeliveryDays(plainOrder);
  plainOrder.user = user
    ? { name: user.name, email: user.email }
    : { name: 'Usuario eliminado', email: '' };
  plainOrder.products = await Promise.all((plainOrder.products || []).map(async (item) => {
    const product = await Product.findById(item.productId);

    return {
      ...item,
      productName: product ? product.name : 'Producto eliminado',
      unitPrice: product ? product.price : 0,
      subtotal: product ? product.price * item.quantity : 0
    };
  }));

  return plainOrder;
}

async function decorateOrders(orders) {
  return Promise.all(orders.map((order) => decorateOrder(order)));
}

async function checkout(req, res) {
  try {
    const { paymentMethod = 'cash' } = req.body;

    if (!['cash', 'card', 'transfer'].includes(paymentMethod)) {
      return res.status(400).send({ message: 'Metodo de pago invalido' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || !cart.products.length) {
      return res.status(400).send({ message: 'El carrito esta vacio' });
    }

    let total = 0;
    const orderProducts = [];

    for (const item of cart.products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).send({ message: `Producto no encontrado: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).send({
          message: `Stock insuficiente para ${product.name}`,
          availableStock: product.stock
        });
      }

      total += product.price * item.quantity;
      orderProducts.push({
        productId: product._id,
        quantity: item.quantity
      });
    }

    const order = new Order({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      products: orderProducts,
      total,
      status: paymentMethod === 'cash' ? 'pending' : 'paid',
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'approved',
      deliveryDays: generateDeliveryDays()
    });

    await order.save();

    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    cart.products = [];
    cart.total = 0;
    await cart.save();

    return res.status(201).send({
      message: 'Compra realizada',
      order: await decorateOrder(order)
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

async function checkoutLocal(req, res) {
  try {
    const { items = [], paymentMethod = 'cash' } = req.body;

    if (!['cash', 'card', 'transfer'].includes(paymentMethod)) {
      return res.status(400).send({ message: 'Metodo de pago invalido' });
    }

    if (!items.length) {
      return res.status(400).send({ message: 'El carrito esta vacio' });
    }

    let total = 0;
    const orderProducts = [];

    for (const item of items) {
      const productId = item.productId || item.producto?._id || item.producto?.id;
      const quantity = Number(item.quantity || item.cantidad || 1);

      if (!productId || quantity < 1) {
        return res.status(400).send({ message: 'Producto invalido en el carrito' });
      }

      const product = await Product.findById(productId);

      if (!product) {
        return res.status(404).send({ message: `Producto no encontrado: ${productId}` });
      }

      if (product.stock < quantity) {
        return res.status(400).send({
          message: `Stock insuficiente para ${product.name}`,
          availableStock: product.stock
        });
      }

      total += product.price * quantity;
      orderProducts.push({
        productId: product._id,
        quantity
      });
    }

    const order = new Order({
      orderNumber: generateOrderNumber(),
      userId: req.user.id,
      products: orderProducts,
      total,
      status: paymentMethod === 'cash' ? 'pending' : 'paid',
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'approved',
      deliveryDays: generateDeliveryDays()
    });

    await order.save();

    for (const item of orderProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity }
      });
    }

    return res.status(201).send({
      message: 'Compra realizada',
      order: await decorateOrder(order)
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

function listAll(req, res) {
  Order.find({})
    .then(async orders => {
      if (orders.length) return res.status(200).send({ orders: await decorateOrders(orders) });
      return res.status(204).send({ message: 'No Content' });
    })
    .catch(err => res.status(500).send({ err }));
}

function listMine(req, res) {
  Order.find({ userId: req.user.id })
    .then(async orders => {
      if (orders.length) return res.status(200).send({ orders: await decorateOrders(orders) });
      return res.status(204).send({ message: 'No Content' });
    })
    .catch(err => res.status(500).send({ err }));
}

function create(req, res) {
  let order = new Order(req.body);

  order.save()
    .then(order => res.status(201).send({ order }))
    .catch(err => res.status(500).send({ err }));
}

function find(req, res, next) {
  req.body = req.body || {};
  let query = {};
  query[req.params.key] = req.params.value;

  Order.find(query)
    .then(orders => {
      if (!orders.length) return next();
      req.body.orders = orders;
      return next();
    })
    .catch(err => {
      req.body.error = err;
      next();
    });
}

function show(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.orders) return res.status(404).send({ message: 'Not Found' });

  return res.status(200).send({ orders: req.body.orders });
}

function update(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.orders) return res.status(404).send({ message: 'Not Found' });

  let order = req.body.orders[0];
  order = Object.assign(order, req.body);

  order.save()
    .then(order => res.status(200).send({ message: 'Updated', order }))
    .catch(err => res.status(500).send({ err }));
}

function deleted(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.orders) return res.status(404).send({ message: 'Not Found' });

  req.body.orders[0].deleteOne()
    .then(order => res.status(200).send({ message: 'Deleted', order }))
    .catch(err => res.status(500).send({ err }));
}

module.exports = {
  checkout,
  checkoutLocal,
  listAll,
  listMine,
  create,
  find,
  show,
  update,
  deleted
};
