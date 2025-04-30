import Cart from '../models/cart.model.js';

export default class CartManagerMongo {
  async createCart(userId) {
    const newCart = new Cart({ userId, products: [] });
    await newCart.save();
    return newCart;
  }

  async getCartById(id) {
    const cart = await Cart.findById(id).populate('products.product').lean();
    if (!cart) {
      throw new Error(`Carrito con ID ${id} no encontrado`);
    }
    return cart;
  }

  async addProductToCart(cartId, productId, quantity = 1) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    const existingProduct = cart.products.find(p => p.product.toString() === productId);
    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
  }

  async removeProductFromCart(cartId, productId) {
    const cart = await Cart.findById(cartId);
    if (!cart) throw new Error('Carrito no encontrado');

    cart.products = cart.products.filter(p => p.product.toString() !== productId);
    await cart.save();
    return cart;
  }
}
