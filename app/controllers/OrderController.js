const Order = require('../models/OrderModel');

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
  listAll,
  create,
  find,
  show,
  update,
  deleted
};
