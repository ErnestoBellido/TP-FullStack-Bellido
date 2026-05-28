const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');
const admin = require('../middleware/admin');

router.get('/', admin, OrderController.listAll)
.get('/my', OrderController.listMine)
.post('/checkout', OrderController.checkout)
.post('/checkout-local', OrderController.checkoutLocal)
.post('/', admin, OrderController.create)
.get('/:key/:value', admin, OrderController.find, OrderController.show)
.put('/:key/:value', admin, OrderController.find, OrderController.update)
.delete('/:key/:value', admin, OrderController.find, OrderController.deleted);

module.exports = router;
