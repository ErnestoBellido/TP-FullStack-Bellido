const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/OrderController');

router.get('/', OrderController.listAll)
.post('/checkout', OrderController.checkout)
.post('/', OrderController.create)
.get('/:key/:value', OrderController.find, OrderController.show)
.put('/:key/:value', OrderController.find, OrderController.update)
.delete('/:key/:value', OrderController.find, OrderController.deleted);

module.exports = router;
