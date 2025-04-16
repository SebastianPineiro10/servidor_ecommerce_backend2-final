import express from 'express';
import jwt from 'jsonwebtoken'; // Importamos JWT para la decodificación
import ProductManagerMongo from '../managers/productManager.mongo.js';
import CartManagerMongo from '../managers/cartManager.mongo.js'; // Para manejar los carritos
import User from '../models/user.model.js'; // Asegúrate de importar tu modelo de usuario para las consultas
import { verifyToken } from '../utils/jwt.js'; // Importa la función para verificar el token

const viewsRouter = express.Router();
const productManager = new ProductManagerMongo();
const cartManager = new CartManagerMongo(); // Manager para carritos

// Vista principal - Home
viewsRouter.get('/', async (req, res) => {
  try {
    const result = await productManager.getProducts();
    res.render('home', {
      products: result.payload,
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

    const baseUrl = `${req.protocol}://${req.get('host')}${req.baseUrl}/products`;

    const buildQueryString = (pg) => {
      const queryParams = new URLSearchParams();
      queryParams.append('page', pg);
      if (req.query.limit) queryParams.append('limit', req.query.limit);
      if (req.query.sort) queryParams.append('sort', req.query.sort);
      if (req.query.query) queryParams.append('query', req.query.query);
      return queryParams.toString();
    };

    const result = await productManager.getProducts(options);

    if (result.hasPrevPage) {
      result.prevLink = `${baseUrl}?${buildQueryString(result.prevPage)}`;
    }

    if (result.hasNextPage) {
      result.nextLink = `${baseUrl}?${buildQueryString(result.nextPage)}`;
    }

    res.render('products', {
      products: result,
      title: 'Catálogo de Productos'
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
      product,
      title: product.title
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista de inicio de sesión
viewsRouter.get('/login', (req, res) => {
  res.render('login', {
    title: 'Iniciar sesión'
  });
});

// Vista de registro
viewsRouter.get('/register', (req, res) => {
  res.render('register', {
    title: 'Registrarse'
  });
});

// Vista de carrito
viewsRouter.get('/carts/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    res.render('cart', {
      cart,
      title: 'Tu Carrito',
      isEmpty: cart.products.length === 0
    });
  } catch (error) {
    res.status(404).send({ message: error.message });
  }
});

// Vista de productos en tiempo real
viewsRouter.get('/realtimeproducts', async (req, res) => {
  try {
    const result = await productManager.getProducts();
    res.render('realTimeProducts', {
      products: result.payload,
      title: 'Productos en Tiempo Real'
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

// Nueva vista de detalles del usuario
viewsRouter.get('/user-details', async (req, res) => {
  try {
    const token = req.cookies?.token; // Extraer el token desde las cookies
    if (!token) {
      return res.redirect('/login'); // Redirigir si no hay token
    }

    // Verificar y decodificar el token usando la función externa para seguridad
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).send('Token inválido o expirado.');
    }

    // Consultar en la base de datos para obtener los datos actualizados del usuario
    const user = await User.findById(decoded.id); // Buscar usuario por su ID
    if (!user) {
      return res.status(404).send('Usuario no encontrado.');
    }

    // Renderizar la vista con los datos actuales del usuario
    res.render('userDetails', {
      title: 'Detalles del Usuario',
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error en la ruta /user-details:', error.message);
    res.status(401).send('Token inválido o expirado.');
  }
});

export default viewsRouter;
