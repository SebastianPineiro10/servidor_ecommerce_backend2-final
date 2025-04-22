import express from 'express';
import { getTicketByCode, getTicketsByPurchaser } from '../controllers/ticketController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:code', authMiddleware, getTicketByCode);
router.get('/purchaser/:email', authMiddleware, getTicketsByPurchaser);

export default router;
