import express from 'express';
import { register, login, current } from '../controllers/sessionController.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';  // Importamos desde verifyJWT.js
import { isAdmin, isUser, authenticateUser } from '../middlewares/auth.middleware.js'; // Importamos desde auth.middleware.js

const sessionRouter = express.Router();

// Ruta para registrar un usuario
sessionRouter.post('/register', register);

// Ruta para iniciar sesión (login)
sessionRouter.post('/login', login);

// Ruta para obtener datos del usuario actual
sessionRouter.get('/current', verifyJWT, current);

// Ruta protegida para usuarios autenticados (sin especificar rol)
sessionRouter.get('/protected', verifyJWT, authenticateUser, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido a usuario autenticado' });
});

// Ruta exclusiva para administradores
sessionRouter.get('/admin', verifyJWT, isAdmin, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido a administrador' });
});

// Ruta exclusiva para usuarios (no admin)
sessionRouter.get('/user', verifyJWT, isUser, (req, res) => {
  res.status(200).json({ message: 'Acceso concedido a usuario' });
});

// Ruta para que los administradores gestionen productos en tiempo real
sessionRouter.post('/realtimeproducts', verifyJWT, isAdmin, (req, res) => {
  const { action, productData } = req.body;

  switch (action) {
    case 'create':
      // lógica para crear un producto
      res.status(200).json({ message: 'Producto creado exitosamente' });
      break;
    case 'update':
      // lógica para actualizar un producto
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
      break;
    case 'delete':
      // lógica para eliminar un producto
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
      break;
    default:
      res.status(400).json({ message: 'Acción no válida' });
  }
});

export default sessionRouter;