const User = require('../models/UserModel');

function listAll(req, res) {
  User.find({})
    .select('-password')
    .then(users => {
      if (users.length) return res.status(200).send({ users });
      return res.status(204).send({ message: 'No Content' });
    })
    .catch(err => res.status(500).send({ err }));
}

function create(req, res) {
  if (!['user', 'admin'].includes(req.body.role)) {
    req.body.role = 'user';
  }

  let user = new User(req.body);

  user.save()
    .then(user => {
      const createdUser = user.toObject();
      delete createdUser.password;
      res.status(201).send({ user: createdUser });
    })
    .catch(err => res.status(500).send({ err }));
}

function find(req, res, next) {
  req.body = req.body || {};
  let query = {};
  query[req.params.key] = req.params.value;

  User.find(query)
    .then(users => {
      if (!users.length) return next();
      req.body.users = users;
      return next();
    })
    .catch(err => {
      req.body.error = err;
      next();
    });
}

function show(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.users) return res.status(404).send({ message: 'Not Found' });

  return res.status(200).send({ users: req.body.users });
}

function update(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.users) return res.status(404).send({ message: 'Not Found' });

  let user = req.body.users[0];
  user = Object.assign(user, req.body);

  user.save()
    .then(user => res.status(200).send({ message: 'Updated', user }))
    .catch(err => res.status(500).send({ err }));
}

function deleted(req, res) {
  if (req.body.error) return res.status(500).send({ error: req.body.error });
  if (!req.body.users) return res.status(404).send({ message: 'Not Found' });

  req.body.users[0].deleteOne()
    .then(user => res.status(200).send({ message: 'Deleted', user }))
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
