const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', ProductController.listAll)
.post('/', auth, admin, ProductController.create)
.put('/:id/stock', auth, admin, ProductController.updateStock)
.get('/:key/:value', ProductController.find, ProductController.show)
.put('/:key/:value', auth, admin, ProductController.find, ProductController.update)
.delete('/:key/:value', auth, admin, ProductController.find, ProductController.deleted);

module.exports = router;
