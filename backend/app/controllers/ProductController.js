const Product = require('../models/ProductModel');


// LIST ALL
function listAll(req, res) {
  Product.find({})
    .then(products => {
      if (products.length) return res.status(200).send({ products });
      return res.status(204).send({ message: 'No Content' });
    })
    .catch(err => res.status(500).send({ err }));

}

// CREATE
function create(req, res) {
  let product = new Product(req.body);

  product.save()
    .then(product => res.status(201).send({ product }))
    .catch(err => res.status(500).send({ err }));
}

// FIND
function find(req, res, next) {
  req.body = req.body || {};
  let query = {};
  query[req.params.key] = req.params.value;

  Product.find(query)
    .then(products => {
      if (!products.length) return next();
      req.body.products = products;
      return next();
    })
    .catch(err => {
      req.body.error = err;
      next();
    });
}

// SHOW
function show(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.products) return res.status(404).send({ message: 'Not Found' });

  return res.status(200).send({ products: req.body.products });
}

// UPDATE
function update(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.products) return res.status(404).send({ message: 'Not Found' });

  let product = req.body.products[0];
  product = Object.assign(product, req.body);

  product.save()
    .then(product => res.status(200).send({ message: 'Updated', product }))
    .catch(err => res.status(500).send({ err }));
}

async function updateStock(req, res) {
  try {
    const stock = Number(req.body.stock);

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).send({ message: 'El stock debe ser un numero entero mayor o igual a 0' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send({ message: 'Producto no encontrado' });
    }

    product.stock = stock;
    await product.save();

    return res.status(200).send({ message: 'Stock actualizado', product });
  } catch (err) {
    return res.status(500).send({ error: err.message });
  }
}

// DELETE
function deleted(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.products) return res.status(404).send({ message: 'Not Found' });

  req.body.products[0].deleteOne()
    .then(product => res.status(200).send({ message: 'Deleted', product }))
    .catch(err => res.status(500).send({ err }));
}

module.exports = {
  listAll,
  create,
  find,
  show,
  update,
  updateStock,
  deleted
};
