const express = require('express');
const router = express.Router();
const CartController = require('../controllers/CartController');

router.get('/', CartController.listAll)
.get('/my-cart', CartController.myCart)
.post('/add', CartController.addProduct)
.post('/remove', CartController.removeProduct)
.post('/', CartController.create)
.get('/:key/:value', CartController.find, CartController.show)
.put('/:key/:value', CartController.find, CartController.update)
.delete('/:key/:value', CartController.find, CartController.deleted);

module.exports = router;
