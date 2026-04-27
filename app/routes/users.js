const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const admin = require('../middleware/admin');

router.get('/', admin, UserController.listAll)
.post('/', admin, UserController.create)
.get('/:key/:value', admin, UserController.find, UserController.show)
.put('/:key/:value', admin, UserController.find, UserController.update)
.delete('/:key/:value', admin, UserController.find, UserController.deleted);

module.exports = router;
