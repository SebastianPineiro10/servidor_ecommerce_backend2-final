import express from 'express';
import { engine } from 'express-handlebars';
import { Server } from 'socket.io';
import http from 'http';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import dotenv from 'dotenv';
import { connectDB } from './src/config/dbConfig.js';
import sharedSession from 'express-socket.io-session';

// Rutas y managers
import productsRouter from './src/routes/products.router.js';
import cartsRouter from './src/routes/carts.router.js';
import viewsRouter from './src/routes/views.router.js';
import sessionRouter from './src/routes/sessionRoutes.js';
import ProductManagerMongo from './src/managers/productManager.mongo.js';

// Cargar variables de entorno
dotenv.config();

// Conexión a la DB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        eq: (a, b) => a === b,
        gt: (a, b) => a > b,
        multiply: (price, quantity) => (price * quantity).toFixed(2),
        calculateTotal: (products) =>
            products.reduce((total, item) => total + item.product.price * item.quantity, 0).toFixed(2),
    },
}));
app.set('view engine', 'handlebars');
app.set('views', './src/views');

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Sesión
const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || 'claveSecretaSuperSegura',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production' },
});
app.use(sessionMiddleware);
io.use(sharedSession(sessionMiddleware, { autoSave: true }));

// Rutas
app.use('/api/session', sessionRouter);
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);
app.use('/', viewsRouter);

// Manager
const productManager = new ProductManagerMongo();

// WebSocket con auth
io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    const user = socket.handshake.session?.user;

    if (!user) {
        console.log('Cliente conectado sin autenticación.');
        socket.emit('authError', { message: 'No estás autenticado' });
        return;
    }

    socket.user = user;
    console.log(`Usuario autenticado: ${user.email} (Rol: ${user.role})`);

    // Enviar productos iniciales
    productManager.getProducts().then((products) => {
        socket.emit('initialProducts', products.docs); // ojo: .docs en paginate
    });

    // Nuevo producto
    socket.on('newProduct', async (productData) => {
        if (socket.user.role !== 'admin') {
            console.log(`🔴 Usuario ${socket.user.email} no tiene permiso para agregar productos`);
            return socket.emit('productError', { message: 'No tienes permisos para agregar productos' });
        }

        try {
            const newProduct = await productManager.addProduct(productData);
            io.emit('productAdded', newProduct);
            console.log(`✅ Producto agregado por ${socket.user.email}`);
        } catch (err) {
            console.error('Error al agregar producto:', err);
            socket.emit('productError', { message: 'Error al agregar producto' });
        }
    });

    // Eliminar producto
    socket.on('deleteProduct', async (productCode) => {
        if (socket.user.role !== 'admin') {
            console.log(`🔴 Usuario ${socket.user.email} no tiene permiso para eliminar productos`);
            return socket.emit('productError', { message: 'No tienes permisos para eliminar productos' });
        }

        try {
            const deleted = await productManager.deleteProduct(productCode);
            io.emit('productDeleted', deleted);
            console.log(`✅ Producto eliminado por ${socket.user.email}`);
        } catch (err) {
            console.error('Error al eliminar producto:', err);
            socket.emit('productError', { message: 'Error al eliminar producto' });
        }
    });
});

// Redirección rutas inexistentes
app.use((req, res, next) => {
    res.redirect('/login');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error('Error detectado:', err.stack);
    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: err.message,
    });
});

// Puerto
const PORT = process.env.PORT || 9090;
server.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
});
