const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.get('/', UserController.listAll)
.post('/', UserController.create)
.get('/:key/:value', UserController.find, UserController.show)
.put('/:key/:value', UserController.find, UserController.update)
.delete('/:key/:value', UserController.find, UserController.deleted);

module.exports = router;