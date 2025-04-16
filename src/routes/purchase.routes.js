// routes/purchase.routes.js
import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js'; // Middleware para autenticar usuarios
import { purchaseCart } from '../controllers/purchase.controller.js'; // Controlador para la compra

const router = express.Router();

// Ruta para realizar la compra de un carrito
router.post('/purchase/:cid', authenticateUser, purchaseCart); // Usar el middleware de autenticación

export default router;
