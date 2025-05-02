import CartDAO from '../dao/cart.dao.js';

class CartRepository {
  async getByUserId(userId) {
    let cart = await CartDAO.getByUserId(userId);
    if (!cart) {
      cart = await CartDAO.create({ userId, products: [] });
    }
    return cart;
  }

  async getCartById(cartId) {
    return await CartDAO.getCartById(cartId);
  }

  async addProduct(cartId, productId, quantity) {
    return await CartDAO.addProduct(cartId, productId, quantity);
  }

  async removeProduct(cartId, productId) {
    return await CartDAO.removeProduct(cartId, productId);
  }

  // ✅ ESTA FUNCIÓN FALTABA
  async updateCart(cartId, data) {
    return await CartDAO.updateCart(cartId, data);
  }
}

export default new CartRepository();
