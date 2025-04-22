import CartDAO from '../dao/cart.dao.js';
import CartDTO from '../dto/cart.dto.js';

class CartRepository {
    async getByUserId(userId) {
        let cart = await CartDAO.getByUserId(userId);
        if (!cart) {
            cart = await CartDAO.create({ userId, products: [] });
        }
        return new CartDTO(cart);
    }

    async addProduct(cartId, productId, quantity) {
        const cart = await CartDAO.addProduct(cartId, productId, quantity);
        return new CartDTO(cart);
    }

    async removeProduct(cartId, productId) {
        const cart = await CartDAO.removeProduct(cartId, productId);
        return new CartDTO(cart);
    }
}

export default new CartRepository();
