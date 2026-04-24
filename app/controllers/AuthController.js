const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const CONFIG = require('../config/config');

const AuthController = {

  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Ya existe' });
      }

      const user = new User({ name, email, password });
      await user.save();

      res.status(201).json({ message: 'Usuario creado' });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Credenciales inválidas' });
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        CONFIG.JWT_SECRET,
        { expiresIn: CONFIG.JWT_EXPIRES }
      );

      res.json({ token });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

};

module.exports = AuthController;
