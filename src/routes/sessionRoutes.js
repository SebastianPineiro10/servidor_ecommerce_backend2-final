import express from 'express';
import { register, login, current } from '../controllers/sessionController.js';

const sessionRouter = express.Router();

// Rutas de registro y login
sessionRouter.post('/register', register);
sessionRouter.post('/login', login);

// Ruta para validar el usuario logueado
sessionRouter.get('/current', current);

export default sessionRouter;
