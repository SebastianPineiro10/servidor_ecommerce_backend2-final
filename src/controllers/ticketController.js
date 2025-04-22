import TicketRepository from '../repositories/ticket.repository.js';

const getTicketByCode = async (req, res) => {
    try {
        const { code } = req.params;
        const ticket = await TicketRepository.getByCode(code);
        res.status(200).json(ticket);
    } catch (error) {
        res.status(404).json({ message: 'Ticket no encontrado' });
    }
};

const getTicketsByPurchaser = async (req, res) => {
    try {
        const { email } = req.params;
        const tickets = await TicketRepository.getByPurchaser(email);
        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getTicketByCode, getTicketsByPurchaser };
