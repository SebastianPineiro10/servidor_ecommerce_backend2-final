import Ticket from '../models/ticket.model.js';

class TicketDAO {
    async create(ticketData) {
        return await Ticket.create(ticketData);
    }

    async getByCode(code) {
        return await Ticket.findOne({ code });
    }

    async getByPurchaser(email) {
        return await Ticket.find({ purchaser: email }).sort({ purchase_datetime: -1 });
    }
}

export default new TicketDAO();
