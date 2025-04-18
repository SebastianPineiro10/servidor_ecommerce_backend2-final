import express from 'express';
import CartManagerMongo from '../managers/cartManager.mongo.js';
import { authenticateUser, isAdmin, isUser } from '../middlewares/auth.middleware.js';

const cartsRouter = express.Router();
const cartManager = new CartManagerMongo();

// Crear carrito
cartsRouter.post('/', authenticateUser, async (req, res) => {
  try {
    if (!req.session?.cartId) {
      const newCart = await cartManager.createCart();
      req.session.cartId = newCart._id; // Guardar el carrito creado en la sesión
      return res.status(201).json({
        status: 'success',
        message: 'Carrito creado exitosamente',
        payload: newCart
      });
    } else {
      return res.status(200).json({
        status: 'success',
        message: 'Carrito ya existe',
        payload: req.session.cartId
      });
    }
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Obtener carrito
cartsRouter.get('/:cid', authenticateUser, async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.status(200).json({ status: 'success', payload: cart });
  } catch (error) {
    res.status(404).json({ status: 'error', message: error.message });
  }
});

// Agregar producto al carrito (solo user)
cartsRouter.post('/:cid/products/:pid', authenticateUser, isUser, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = req.body.quantity || 1;
    const updatedCart = await cartManager.addProductToCart(cid, pid, quantity);
    res.status(200).json({
      status: 'success',
      message: 'Producto agregado al carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Eliminar producto del carrito (solo user)
cartsRouter.delete('/:cid/products/:pid', authenticateUser, isUser, async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const updatedCart = await cartManager.removeProductFromCart(cid, pid);
    res.status(200).json({
      status: 'success',
      message: 'Producto eliminado del carrito exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Actualizar carrito
cartsRouter.put('/:cid', authenticateUser, async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;
    const updatedCart = await cartManager.updateCart(cid, products);
    res.status(200).json({
      status: 'success',
      message: 'Carrito actualizado exitosamente',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Eliminar todos los productos del carrito
cartsRouter.delete('/:cid', authenticateUser, async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await cartManager.clearCart(cid);
    res.status(200).json({
      status: 'success',
      message: 'Todos los productos eliminados del carrito',
      payload: updatedCart
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Realizar compra (solo user)
cartsRouter.post('/:cid/purchase', authenticateUser, async (req, res) => {
  try {
    const { cid } = req.params;
    const result = await cartManager.purchaseCart(cid);
    res.status(200).json({
      status: 'success',
      message: 'Compra realizada exitosamente',
      payload: result
    });
  } catch (error) {
    res.status(400).json({ status: 'error', message: error.message });
  }
});

export default cartsRouter;
