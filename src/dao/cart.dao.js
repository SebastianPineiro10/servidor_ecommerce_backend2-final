import CartModel from '../models/cart.model.js';
import ProductModel from '../models/product.model.js';

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

  // ✅ Agregar producto con validación de stock real
  async addProduct(cartId, productId, quantity) {
    const cart = await CartModel.findById(cartId);
    if (!cart) return null;

    const product = await ProductModel.findById(productId);
    if (!product || product.stock < 1) return null;

    const existingProduct = cart.products.find(p => p.product.toString() === productId);
    const currentQty = existingProduct ? existingProduct.quantity : 0;
    const totalQty = currentQty + quantity;

    if (totalQty > product.stock) return null;

    if (existingProduct) {
      existingProduct.quantity = totalQty;
    } else {
      cart.products.push({ product: productId, quantity });
    }

    await cart.save();
    return await cart.populate('products.product');
  }
}

export default new CartDAO();
