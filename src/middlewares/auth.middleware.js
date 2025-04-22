// auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    req.user = user;
    req.session.user = user;

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') { // Usa req.user
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};

export const isUser = (req, res, next) => {
   if (!req.user || req.user.role !== 'user') { // Usa req.user
    return res.status(403).json({ error: 'Acceso denegado. Solo los usuarios pueden realizar esta acción.' });
  }
  next();
};

export const isAuthenticated = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Acceso denegado. Usuario no autenticado.' });
  }
  next();
};
