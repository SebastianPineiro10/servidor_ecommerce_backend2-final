import express from 'express';
import {
  createCart,
  getCartById,
  addProductToCart,
  removeProductFromCart,
  clearCart,
} from '../controllers/cartController.js';
import { isAuthenticated } from '../middlewares/auth.js'; // Middleware de autenticación

const cartsRouter = express.Router();

// Crear un nuevo carrito (requiere autenticación)
cartsRouter.post('/', isAuthenticated, createCart);

// Obtener un carrito por ID
cartsRouter.get('/:cid', getCartById);

// Agregar un producto a un carrito (requiere autenticación)
cartsRouter.post('/:cid/products/:pid', isAuthenticated, addProductToCart);

// Eliminar un producto de un carrito (requiere autenticación)
cartsRouter.delete('/:cid/products/:pid', isAuthenticated, removeProductFromCart);

// Vaciar un carrito (requiere autenticación)
cartsRouter.delete('/:cid', isAuthenticated, clearCart);

export default cartsRouter;
