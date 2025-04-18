import express from 'express';
import mongoose from 'mongoose';
import ProductManagerMongo from '../managers/productManager.mongo.js';
import { verifyJWT } from '../middlewares/verifyJWT.js';
import { isAdmin } from '../middlewares/auth.middleware.js';
import { body, validationResult } from 'express-validator';

const productsRouter = express.Router();
const productManager = new ProductManagerMongo();

const validateProduct = [
  body('name').notEmpty().withMessage('El nombre del producto es obligatorio'),
  body('price').isNumeric().withMessage('El precio debe ser un número'),
  body('stock').isInt({ min: 0 }).withMessage('El stock debe ser un número entero positivo'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Obtener todos los productos
productsRouter.get('/', async (req, res) => {
  try {
    const options = {
      limit: Math.max(Number(req.query.limit) || 10, 1),  // Asegurarse de que el límite sea positivo
      page: Math.max(Number(req.query.page) || 1, 1),  // Asegurarse de que la página sea positiva
      sort: req.query.sort || 'asc',
      query: req.query.query || '',
    };
    const result = await productManager.getProducts(options);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener productos' });
  }
});

// Obtener un producto por ID
productsRouter.get('/:pid', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.pid)) {
    return res.status(400).json({ status: 'error', message: 'ID de producto inválido' });
  }

  try {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado' });
    }
    res.status(200).json({ status: 'success', payload: product });
  } catch (error) {
    console.error(`Error al obtener producto con ID ${req.params.pid}:`, error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Crear un producto
productsRouter.post('/', verifyJWT, isAdmin, validateProduct, handleValidationErrors, async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    res.status(201).json({ status: 'success', message: 'Producto creado exitosamente', payload: newProduct });
  } catch (error) {
    console.error('Error al crear producto:', error.message);
    res.status(400).json({ status: 'error', message: 'Error al crear producto' });
  }
});

// Actualizar un producto
productsRouter.put('/:pid', verifyJWT, isAdmin, validateProduct, handleValidationErrors, async (req, res) => {
  try {
    console.log(`Actualizando producto con ID: ${req.params.pid}`);
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado para actualizar' });
    }
    res.status(200).json({ status: 'success', message: 'Producto actualizado exitosamente', payload: updatedProduct });
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${req.params.pid}:`, error);
    res.status(400).json({ status: 'error', message: error.message });
  }
});

// Eliminar un producto
productsRouter.delete('/:pid', verifyJWT, isAdmin, async (req, res) => {
  try {
    const deletedProduct = await productManager.deleteProduct(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ status: 'error', message: 'Producto no encontrado para eliminar' });
    }
    res.status(200).json({ status: 'success', message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${req.params.pid}:`, error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default productsRouter;
