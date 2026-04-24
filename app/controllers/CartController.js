const Cart = require('../models/CartModel');

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
  listAll,
  create,
  find,
  show,
  update,
  deleted
};
