import express from 'express';
import { getCartById, createCart, updateCart, deleteCart } from '../controllers/cartController.js';
import { isAuthenticated } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:cid', isAuthenticated, getCartById);
router.post('/', isAuthenticated, createCart);
router.put('/:cid', isAuthenticated, updateCart);
router.delete('/:cid', isAuthenticated, deleteCart);

export default router;
