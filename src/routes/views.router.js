import express from 'express';
import jwt from 'jsonwebtoken';
import ProductManagerMongo from '../managers/productManager.mongo.js';
import CartManagerMongo from '../managers/cartManager.mongo.js';
import User from '../models/user.model.js';

const viewsRouter = express.Router();
const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo();

// Vista principal
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

// Vista de productos
viewsRouter.get('/products', async (req, res) => {
  try {
    const options = {
      limit: req.query.limit,
      page: req.query.page,
      sort: req.query.sort,
      query: req.query.query
    };

    const result = await productManager.getProducts(options);
    const sessionUser = req.session.user;
    let cartId = null;

    if (sessionUser?.email) {
      const dbUser = await User.findOne({ email: sessionUser.email }).lean();
      cartId = dbUser?.cartId?.toString() || dbUser?.cart?.toString() || null;
      req.session.user.cartId = cartId;
    }

    console.log('🧠 Sesión del usuario en /products:', req.session.user);
    console.log('🧺 cartId enviado a la vista:', cartId);

    res.render('products', {
      user: req.session.user,
      cartId,
      role: req.session.user.role,
      products: result.docs,
      title: 'Catálogo de Productos',
      prevPage: result.hasPrevPage ? result.prevPage : null,
      nextPage: result.hasNextPage ? result.nextPage : null
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Vista de detalle
viewsRouter.get('/products/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    const user = req.session.user;
    const cartId = user?.cartId || user?.cart || null;

    res.render('product-detail', {
      user,
      product,
      title: product.title,
      cartId
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista del carrito (con total calculado)
viewsRouter.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);

    let total = 0;
    cart.products.forEach(p => {
      total += p.product.price * p.quantity;
    });

    res.render('cart', {
      user: req.session.user,
      cart,
      total,
      title: 'Tu Carrito',
      isEmpty: cart.products.length === 0
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista realtime (admin)
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

// Perfil del usuario
viewsRouter.get('/user-details', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).send('No autorizado');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).lean();

    if (!user) return res.status(404).send('Usuario no encontrado');

    res.render('user-details', {
      title: 'Tu Perfil',
      user
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

viewsRouter.get('/login', (req, res) => res.render('login', { title: 'Iniciar sesión' }));
viewsRouter.get('/register', (req, res) => res.render('register', { title: 'Registrarse' }));

export default viewsRouter;
