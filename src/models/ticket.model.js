import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  code: { 
    type: String, 
    unique: true, 
    required: true 
  },
  purchase_datetime: { 
    type: Date, 
    default: Date.now 
  },
  amount: { 
    type: Number, 
    required: true, 
    min: [0, 'Amount must be greater than or equal to zero'] 
  },
  purchaser: { 
    type: String, // Correo electrónico del usuario
    required: true 
  }
}, { timestamps: true });

// Generar código único para el ticket
ticketSchema.pre('save', function(next) {
  if (!this.code) {
    this.code = uuidv4(); // Genera un código único al crear un ticket
  }
  next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

export default Ticket;
