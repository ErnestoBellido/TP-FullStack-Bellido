const Order = require('../models/OrderModel');
const Cart = require('../models/CartModel');
const Product = require('../models/ProductModel');

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
      userId: req.user.id,
      products: orderProducts,
      total,
      status: paymentMethod === 'cash' ? 'pending' : 'paid',
      paymentMethod,
      paymentStatus: paymentMethod === 'cash' ? 'pending' : 'approved'
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
      order
    });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

function listAll(req, res) {
  Order.find({})
    .then(orders => {
      if (orders.length) return res.status(200).send({ orders });
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
  listAll,
  create,
  find,
  show,
  update,
  deleted
};
