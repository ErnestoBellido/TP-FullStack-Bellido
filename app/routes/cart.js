const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.get('/', CartController.listAll)
.post('/', CartController.create)
.get('/:key/:value', CartController.find, CartController.show)
.put('/:key/:value', CartController.find, CartController.update)
.delete('/:key/:value', CartController.find, CartController.deleted);

module.exports = router;