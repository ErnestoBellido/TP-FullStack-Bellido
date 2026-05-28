const Category = require('../models/CategoryModel');

// LIST ALL
function listAll(req, res) {
  Category.find({})
    .then(categories => {
      if (categories.length) return res.status(200).send({ categories });
      return res.status(204).send({ message: 'No Content' });
    })
    .catch(err => res.status(500).send({ err }));
}

// CREATE
function create(req, res) {
  let category = new Category(req.body);

  category.save()
    .then(category => res.status(201).send({ category }))
    .catch(err => res.status(500).send({ err }));
}

// FIND
function find(req, res, next) {
  req.body = req.body || {};
  let query = {};
  query[req.params.key] = req.params.value;

  Category.find(query)
    .then(categories => {
      if (!categories.length) return next();
      req.body.categories = categories;
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
  if (!req.body.categories) return res.status(404).send({ message: 'Not Found' });

  return res.status(200).send({ categories: req.body.categories });
}

// UPDATE
function update(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.categories) return res.status(404).send({ message: 'Not Found' });

  let category = req.body.categories[0];
  category = Object.assign(category, req.body);

  category.save()
    .then(category => res.status(200).send({ message: 'Updated', category }))
    .catch(err => res.status(500).send({ err }));
}

// DELETE
function deleted(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.categories) return res.status(404).send({ message: 'Not Found' });

  req.body.categories[0].deleteOne()
    .then(category => res.status(200).send({ message: 'Deleted', category }))
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
