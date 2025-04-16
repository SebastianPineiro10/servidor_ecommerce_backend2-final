import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { isAuthenticated } from '../middlewares/auth.js'; // Middleware de autenticación
import { body, validationResult } from 'express-validator';

// Validación de producto
const validateProduct = [
  body('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const productsRouter = express.Router();

// Obtener todos los productos (con filtros, paginación, etc.)
productsRouter.get('/', getProducts);

// Obtener un producto por ID
productsRouter.get('/:pid', getProductById);

// Crear un nuevo producto (requiere autenticación y validación)
productsRouter.post('/', isAuthenticated, validateProduct, handleValidation, createProduct);

// Actualizar un producto (requiere autenticación y validación)
productsRouter.put('/:pid', isAuthenticated, validateProduct, handleValidation, updateProduct);

// Eliminar un producto (requiere autenticación)
productsRouter.delete('/:pid', isAuthenticated, deleteProduct);

export default productsRouter;
