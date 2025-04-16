// auth.middleware.js
// src/middlewares/auth.middleware.js

// Autenticación del usuario
export const authenticateUser = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    next(); // Si el usuario está autenticado, permite continuar
  };
  
  // Verificar si el usuario es administrador
  export const isAdmin = (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
  
    if (req.user.role === 'admin') {
      return next(); // Si es admin, permite continuar
    } else {
      return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
    }
  };
  