import express from 'express';
import {
  getCartById,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
  purchaseCart
} from '../controllers/cartController.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Obtener carrito por ID
router.get('/:cid', isAuthenticated, getCartById);

// Crear nuevo carrito
router.post('/', isAuthenticated, createCart);

// Actualizar carrito
router.put('/:cid', isAuthenticated, updateCart);

// Eliminar carrito
router.delete('/:cid', isAuthenticated, deleteCart);

// Agregar producto al carrito
router.post('/:cid/products/:pid', isAuthenticated, addProductToCart);

// ✅ FINALIZAR COMPRA (agregado)
router.post('/:cid/purchase', isAuthenticated, purchaseCart);

export default router;
