const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  id: {
    type: Number,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: false
  }
});

const Category = mongoose.model('Category', CategorySchema);

module.exports = Category;
