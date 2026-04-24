const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');

router.get('/', CategoryController.listAll)
.post('/', CategoryController.create)
.get('/:key/:value', CategoryController.find, CategoryController.show)
.put('/:key/:value', CategoryController.find, CategoryController.update)
.delete('/:key/:value', CategoryController.find, CategoryController.deleted);

module.exports = router;