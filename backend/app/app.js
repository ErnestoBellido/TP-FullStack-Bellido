const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const db = require('./config/database');
db.connect();

const app = express();

const Product = require('./routes/product');
const Category = require('./routes/category');
const Cart = require('./routes/cart');
const Order = require('./routes/order');
const Users = require('./routes/users');
const Auth = require('./routes/auth');

const auth = require('./middleware/auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static(path.join(__dirname, '../../frontend')));

app.get('/', (req, res) => {
  res.status(200).send({ message: 'Bienvenido a mi app.' });
});

app.use('/auth', Auth);

app.use('/products', Product);
app.use('/categories', Category);

app.use('/cart', auth, Cart);
app.use('/orders', auth, Order);
app.use('/users', auth, Users);

module.exports = app;
