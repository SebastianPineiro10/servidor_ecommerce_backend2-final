// middlewares/verifyJWT.js
import jwt from 'jsonwebtoken';

export const verifyJWT = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  const tokenFromCookie = req.cookies?.token;

  const token = tokenFromHeader || tokenFromCookie;

  if (!token) {
    return res.status(403).json({ message: 'Token no proporcionado' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Token inválido o expirado' });
    req.user = decoded; // payload: { id, email, role, etc. }
    next();
  });
}; 

// Middleware para verificar que el usuario tenga el rol de 'admin'
export const isAdmin = (req, res, next) => {
  if (req.user?.role === 'admin') return next(); // Si el rol es 'admin', continuamos
  return res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
};

// Middleware para verificar que el usuario tenga el rol de 'user'
export const isUser = (req, res, next) => {
  if (req.user?.role === 'user') return next(); // Si el rol es 'user', continuamos
  return res.status(403).json({ message: 'Acceso denegado, se requiere rol de usuario' });
};

// Middleware para verificar que el usuario esté autenticado
export const authenticateUser = (req, res, next) => {
  if (req.user) return next(); // Si el usuario está autenticado, continuamos
  return res.status(401).json({ message: 'Usuario no autenticado' });
};