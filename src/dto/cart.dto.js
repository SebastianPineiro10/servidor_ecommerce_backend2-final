import Cart from '../models/cart.model.js';

class CartDAO {
    async create(cartData) {
        return await Cart.create(cartData);
    }

    async getByUserId(userId) {
        return await Cart.findOne({ userId }).populate('products.product');
    }

    async getById(cartId) {
        return await Cart.findById(cartId).populate('products.product');
    }

    async addProduct(cartId, productId, quantity) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        const existingProduct = cart.products.find(item => item.product.equals(productId));
        if (existingProduct) {
            existingProduct.quantity += quantity;
        } else {
            cart.products.push({ product: productId, quantity });
        }

        await cart.save();
        return cart;
    }

    async removeProduct(cartId, productId) {
        const cart = await Cart.findById(cartId);
        if (!cart) throw new Error('Carrito no encontrado');

        cart.products = cart.products.filter(item => !item.product.equals(productId));
        await cart.save();
        return cart;
    }
}

export default new CartDAO();
