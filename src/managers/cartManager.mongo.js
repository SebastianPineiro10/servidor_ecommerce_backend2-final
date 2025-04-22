import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';

class CartManagerMongo {
    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            await newCart.save();
            return newCart;
        } catch (error) {
            console.error('Error al crear el carrito:', error.message);
            throw error;
        }
    }

    async getCartById(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }
            return cart;
        } catch (error) {
            console.error('Error al obtener el carrito:', error.message);
            throw error;
        }
    }

    async addProductToCart(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);
            const product = await Product.findById(productId);

            if (!cart || !product) {
                throw new Error('Carrito o producto no encontrado');
            }

            const productIndex = cart.products.findIndex(item => item.product.equals(productId));

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantity;
            } else {
                cart.products.push({ product: productId, quantity });
            }

            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al agregar producto al carrito:', error.message);
            throw error;
        }
    }

    async updateCart(cartId, updatedProducts) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = updatedProducts;
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al actualizar el carrito:', error.message);
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, newQuantity) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            const productIndex = cart.products.findIndex(item => item.product.equals(productId));

            if (productIndex === -1) {
                throw new Error('Producto no encontrado en el carrito');
            }

            cart.products[productIndex].quantity = newQuantity;
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al actualizar cantidad de producto:', error.message);
            throw error;
        }
    }

    async deleteProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = cart.products.filter(item => !item.product.equals(productId));
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al eliminar producto del carrito:', error.message);
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);
            if (!cart) {
                throw new Error('Carrito no encontrado');
            }

            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            console.error('Error al vaciar el carrito:', error.message);
            throw error;
        }
    }

    async purchaseCart(cartId) {
        try {
            const cart = await Cart.findById(cartId).populate('products.product');

            if (!cart || cart.products.length === 0) {
                throw new Error('El carrito está vacío o no existe');
            }

            let total = 0;

            cart.products.forEach(item => {
                total += item.product.price * item.quantity;
            });

            cart.products = [];
            await cart.save();

            return { message: 'Compra realizada con éxito', total };
        } catch (error) {
            console.error('Error al realizar compra:', error.message);
            throw error;
        }
    }
}

export default CartManagerMongo;
