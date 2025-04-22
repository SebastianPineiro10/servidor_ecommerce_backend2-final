import express from 'express';
import { getAllProducts, getProductById, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', getAllProducts);
router.get('/:pid', getProductById);
router.post('/', isAdmin, addProduct);
router.put('/:pid', isAdmin, updateProduct);
router.delete('/:pid', isAdmin, deleteProduct);

export default router;
