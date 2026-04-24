const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    categoryId: {
        type: Number,
        required: true
    },
    specs: {
        brand: {
            type: String,
            required: true
        },
        model: {
            type: String,
            required: true
        },
        details: {
            type: String,
            required: false
        }
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    }
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;