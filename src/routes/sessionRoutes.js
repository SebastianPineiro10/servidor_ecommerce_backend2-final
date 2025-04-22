// sessionRoutes.js
import express from 'express';
import { register, login, current } from '../controllers/sessionController.js';
import {  isAdmin, isUser, authenticate } from '../middlewares/auth.middleware.js'; // Cambiado a "authenticate"

const router = express.Router();

// Rutas de autenticación
router.post('/register', register);
router.post('/login', login);
router.get('/current', authenticate, current); // Cambiado a "authenticate" y usa el controlador current

// Rutas protegidas
router.get('/protected', authenticate, (req, res) => { // Cambiado a "authenticate"
  res.status(200).json({ message: 'Acceso concedido a usuario autenticado' });
});

router.get('/admin', authenticate, isAdmin, (req, res) => { // Cambiado a "authenticate"
  res.status(200).json({ message: 'Acceso concedido a administrador', redirect: '/realtimeproducts' });
});

router.get('/user', authenticate, isUser, (req, res) => { // Cambiado a "authenticate"
  res.status(200).json({ message: 'Acceso concedido a usuario', redirect: '/products' });
});

router.post('/realtimeproducts', authenticate, isAdmin, (req, res) => { // Cambiado a "authenticate"
  const { action, productData } = req.body;

  switch (action) {
    case 'create':
      // Lógica para crear un producto
      res.status(200).json({ message: 'Producto creado exitosamente' });
      break;
    case 'update':
      // Lógica para actualizar un producto
      res.status(200).json({ message: 'Producto actualizado exitosamente' });
      break;
    case 'delete':
      // Lógica para eliminar un producto
      res.status(200).json({ message: 'Producto eliminado exitosamente' });
      break;
    default:
      res.status(400).json({ message: 'Acción no válida' });
  }
});

export default router;