import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectDB } from './src/config/dbConfig.js';
import { isAdmin } from './src/middlewares/auth.middleware.js';
import sharedSession from 'express-socket.io-session';

// Importar rutas
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';
import sessionRouter from './src/routes/sessionRoutes.js';

// Importar managers
import ProductManagerMongo from './src/managers/productManager.mongo.js';

// Cargar las variables de entorno
dotenv.config();

// Conexión a la base de datos
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Configuración del motor de plantillas Handlebars
app.engine(
  'handlebars',
  engine({
    defaultLayout: 'main',
    helpers: {
      eq: (a, b) => a === b,
      gt: (a, b) => a > b,
      multiply: (price, quantity) => (price * quantity).toFixed(2),
      calculateTotal: (products) =>
        products.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2),
      firstThumbnail: (thumbnails) =>
        thumbnails && thumbnails.length > 0 ? thumbnails[0] : 'default-image.jpg',
    },
  })
);
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middleware global
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configuración de express-session
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'claveSecretaSuperSegura', // Usar variable de entorno
  resave: false,
  saveUninitialized: true,
  cookie: { secure: process.env.NODE_ENV === 'production' }, // Cambiar a true en producción
});
app.use(sessionMiddleware);

// Compartir sesiones con Socket.IO
io.use(sharedSession(sessionMiddleware, {
  autoSave: true, // Guardar automáticamente la sesión modificada
}));

// Usar las rutas
app.use('/api/session', sessionRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Inicializar ProductManager
const productManager = new ProductManagerMongo();

// Rutas protegidas por autenticación
app.use('/api/products', isAdmin, productsRouter); // Usar el middleware para admin

// WebSocket (Socket.IO) para la interacción en tiempo real
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Autenticación automática del usuario, si está presente en la sesión
  const user = socket.handshake.session.user; // Cambiado para usar handshake.session
  if (user) {
    socket.user = user;
    console.log('Usuario autenticado:', user);
  } else {
    console.log('Cliente conectado sin autenticación.');
  }

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  // Enviar productos cuando un cliente se conecta
  productManager.getProducts().then((products) => {
    socket.emit('initialProducts', products.payload);
  });

  // Solo permitir agregar productos si el usuario es admin
  socket.on('newProduct', async (productData) => {
    if (socket.user && socket.user.role === 'admin') {
      try {
        const newProduct = await productManager.addProduct(productData);
        const updatedProducts = await productManager.getProducts();
        io.emit('productAdded', newProduct);
        io.emit('productsUpdated', updatedProducts.payload);
      } catch (error) {
        console.error('Error al agregar producto:', error.message);
        socket.emit('productError', { message: error.message });
      }
    } else {
      socket.emit('productError', { message: 'No tienes permisos para agregar productos' });
    }
  });

  // Solo permitir eliminar productos si el usuario es admin
  socket.on('deleteProduct', async (code) => {
    if (socket.user && socket.user.role === 'admin') {
      try {
        const result = await productManager.deleteProductByCode(code);
        if (result) {
          const updatedProducts = await productManager.getProducts();
          io.emit('productDeleted', { code });
          io.emit('productsUpdated', updatedProducts.payload);
        } else {
          socket.emit('productError', { message: 'Producto no encontrado' });
        }
      } catch (error) {
        socket.emit('productError', { message: error.message });
      }
    } else {
      socket.emit('productError', { message: 'No tienes permisos para eliminar productos' });
    }
  });

  // Solo los usuarios pueden agregar productos al carrito
  socket.on('addProductToCart', async (productCode) => {
    if (socket.user && socket.user.role === 'user') {
      try {
        console.log(`Producto con código ${productCode} agregado al carrito.`);
        socket.emit('productAddedToCart', { productCode });
      } catch (error) {
        socket.emit('productError', { message: error.message });
      }
    } else {
      socket.emit('productError', { message: 'Solo los usuarios pueden agregar productos al carrito' });
    }
  });
});

// Middleware para manejar rutas inexistentes y redirigir al login
app.use((req, res, next) => {
  res.redirect('/login');
});

// Middleware para manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error detectado:', err.stack);
  if (process.env.NODE_ENV === 'production') {
    return res.status(err.status || 500).json({
      error: 'Error interno del servidor',
      message: err.message,
    });
  }
  // En desarrollo, puedes proporcionar más detalles
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: err.message,
    stack: err.stack,
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
