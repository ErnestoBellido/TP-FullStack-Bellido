const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', CategoryController.listAll)
.post('/', auth, admin, CategoryController.create)
.get('/:key/:value', CategoryController.find, CategoryController.show)
.put('/:key/:value', auth, admin, CategoryController.find, CategoryController.update)
.delete('/:key/:value', auth, admin, CategoryController.find, CategoryController.deleted);

module.exports = router;
