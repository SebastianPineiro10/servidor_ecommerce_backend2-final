import TicketModel from '../models/ticket.model.js';

class TicketRepository {
    async createTicket(ticketData) {
        return await TicketModel.create(ticketData);
    }

    async getTicketByCode(code) {
        return await TicketModel.findOne({ code });
    }

    async getAllTickets() {
        return await TicketModel.find();
    }
}

export default new TicketRepository();
