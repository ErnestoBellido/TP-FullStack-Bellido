const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');

router.get('/', ProductController.listAll)
.post('/', ProductController.create)
.get('/:key/:value', ProductController.find, ProductController.show)
.put('/:key/:value', ProductController.find, ProductController.update)
.delete('/:key/:value', ProductController.find, ProductController.deleted);

module.exports = router;