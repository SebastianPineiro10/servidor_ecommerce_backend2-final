import CartModel from '../models/cart.model.js';

class CartDAO {
    async getCartById(id) {
        return await CartModel.findById(id).populate('products.product');
    }

    async createCart(cartData) {
        return await CartModel.create(cartData);
    }

    async updateCart(id, updatedData) {
        return await CartModel.findByIdAndUpdate(id, updatedData, { new: true });
    }

    async deleteCart(id) {
        return await CartModel.findByIdAndDelete(id);
    }
}

export default new CartDAO();
