const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar el token JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  try {
    // Eliminar la palabra "Bearer " del token si está presente
    const tokenWithoutBearer = token.replace('Bearer ', '');

    // Verificar el token
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
    req.user = decoded; // Agregar los datos del token decodificado al objeto `req`
    next(); // Continuar a la siguiente función si el token es válido
  } catch (error) {
    return res.status(401).json({ message: 'Token no válido' });
  }
};

module.exports = verifyToken;
