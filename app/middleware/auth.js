const jwt = require('jsonwebtoken');
const CONFIG = require('../config/config');

function auth(req, res, next) {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.startsWith('Bearer ')
    && authHeader.slice(7);

  if (!token) {
    return res.status(401).json({ message: 'Token requerido' });
  }

  try {
    const payload = jwt.verify(token, CONFIG.JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalido' });
  }
}

module.exports = auth;
