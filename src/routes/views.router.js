import express from 'express';
import jwt from 'jsonwebtoken';
import ProductManagerMongo from '../managers/productManager.mongo.js';
import CartManagerMongo from '../managers/cartManager.mongo.js';
import User from '../models/user.model.js';

const viewsRouter = express.Router();
const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo();

// Vista principal - Home
viewsRouter.get('/', async (req, res) => {
  try {
    const result = await productManager.getProducts();
    res.render('home', {
      user: req.session.user,
      products: result.docs,
      title: 'Productos'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de productos con paginación
viewsRouter.get('/products', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      query: req.query.query
    };

    const result = await productManager.getProducts(options);

    res.render('products', {
      user: req.session.user,
      products: result.docs,
      title: 'Catálogo de Productos',
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de detalle de producto
viewsRouter.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    res.render('product-detail', {
      user: req.session.user,
      product,
      title: product.title
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista de inicio de sesión
viewsRouter.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar sesión' });
});

// Vista de registro
viewsRouter.get('/register', (req, res) => {
  res.render('register', { title: 'Registrarse' });
});

// Vista de carrito
viewsRouter.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.render('cart', {
      user: req.session.user,
      cart,
      title: 'Tu Carrito',
      isEmpty: cart.products.length === 0
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista de productos en tiempo real con WebSockets
viewsRouter.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getProducts();
    res.render('realTimeProducts', {
      user: req.session.user,
      products: result.docs,
      title: 'Productos en Tiempo Real'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de detalles del usuario con JWT
viewsRouter.get('/user-details', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).send('No autorizado. Token no proporcionado.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).send('Usuario no encontrado.');
    }

    res.render('userDetails', {
      title: 'Detalles del Usuario',
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en la ruta /user-details:', error.message);
    res.status(401).send('Token inválido o expirado.');
  }
});

export default viewsRouter;
