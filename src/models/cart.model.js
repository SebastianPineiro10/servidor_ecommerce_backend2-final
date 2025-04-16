import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product', // Referencia al modelo de producto
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,  // Aseguramos que haya al menos 1 unidad
      default: 1
    }
  }]
}, {
  timestamps: true  // Añadir timestamps automáticamente
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
