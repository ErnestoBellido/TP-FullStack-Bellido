const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const CONFIG = require('../config/config');

const AuthController = {

  async register(req, res) {
    try {
      const { name, email, password, role, adminCode } = req.body;

      const existing = await User.findOne({ email });
      if (existing) {
        return res.status(400).json({ message: 'Ya existe' });
      }

      let userRole = 'user';

      if (role === 'admin') {
        if (adminCode !== CONFIG.ADMIN_CODE) {
          return res.status(403).json({ message: 'Codigo de admin invalido' });
        }

        userRole = 'admin';
      }

      const user = new User({ name, email, password, role: userRole });
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

      res.json({
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role
        }
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

};

module.exports = AuthController;
