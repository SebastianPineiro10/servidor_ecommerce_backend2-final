import express from 'express';
import { register, login } from '../controllers/sessionController.js';
import { getCurrentUser } from '../controllers/userController.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/current', authenticate, getCurrentUser);

export default router;
