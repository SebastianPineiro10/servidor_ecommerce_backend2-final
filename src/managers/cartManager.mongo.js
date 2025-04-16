import Cart from '../models/cart.model.js';
import Product from '../models/product.model.js';
import Ticket from '../models/ticket.model.js'; // Importamos el modelo de Ticket
import { v4 as uuidv4 } from 'uuid'; // Asegúrate de tener instalado 'uuid'
import mongoose from 'mongoose'; // Importamos mongoose para manejar transacciones

class CartManagerMongo {
  // Crear un carrito nuevo
  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart.toObject();
    } catch (error) {
      throw new Error(`Error al crear carrito: ${error.message}`);
    }
  }

  // Obtener carrito por ID de sesión
  async findCartBySessionId(sessionId) {
    try {
      const cart = await Cart.findOne({ sessionId }).populate('products.product').lean();
      return cart;
    } catch (error) {
      throw new Error(`Error al obtener carrito por sesión: ${error.message}`);
    }
  }

  // Obtener carrito por su ID
  async getCartById(id) {
    try {
      const cart = await Cart.findById(id).populate('products.product').lean();
      if (!cart) {
        throw new Error(`Carrito con ID ${id} no encontrado`);
      }
      return cart;
    } catch (error) {
      throw new Error(`Error al obtener carrito: ${error.message}`);
    }
  }

  // Agregar producto al carrito
  async addProductToCart(cartId, productId, quantity = 1) {
    try {
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        throw new Error('La cantidad debe ser un número entero positivo');
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      const product = await Product.findById(productId);
      if (!product) {
        throw new Error(`Producto con ID ${productId} no encontrado`);
      }

      const productIndex = cart.products.findIndex(item => item.product.toString() === productId);
      if (productIndex !== -1) {
        cart.products[productIndex].quantity += quantity;
      } else {
        cart.products.push({ product: productId, quantity });
      }

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al agregar producto al carrito: ${error.message}`);
    }
  }

  // Eliminar producto del carrito
  async removeProductFromCart(cartId, productId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      const originalLength = cart.products.length;
      cart.products = cart.products.filter(item => item.product.toString() !== productId);

      if (cart.products.length === originalLength) {
        throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
      }

      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al eliminar producto del carrito: ${error.message}`);
    }
  }

  // Actualizar productos del carrito
  async updateCart(cartId, products) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      if (!Array.isArray(products)) {
        throw new Error('El formato de productos no es válido');
      }

      for (const item of products) {
        if (!item.product || !item.quantity || item.quantity <= 0) {
          throw new Error('Formato de producto inválido');
        }
        const productExists = await Product.findById(item.product);
        if (!productExists) {
          throw new Error(`Producto con ID ${item.product} no encontrado`);
        }
      }

      cart.products = products;
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al actualizar carrito: ${error.message}`);
    }
  }

  // Actualizar cantidad de un producto en el carrito
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      if (quantity <= 0 || !Number.isInteger(quantity)) {
        throw new Error('La cantidad debe ser un número entero positivo');
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );
      if (productIndex === -1) {
        throw new Error(`Producto con ID ${productId} no encontrado en el carrito`);
      }

      cart.products[productIndex].quantity = quantity;
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al actualizar cantidad del producto: ${error.message}`);
    }
  }

  // Vaciar el carrito
  async clearCart(cartId) {
    try {
      const cart = await Cart.findById(cartId);
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      cart.products = [];
      await cart.save();
      return await this.getCartById(cartId);
    } catch (error) {
      throw new Error(`Error al vaciar el carrito: ${error.message}`);
    }
  }

  // Procesar compra
  async purchaseCart(cartId, userEmail) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const cart = await Cart.findById(cartId).populate('products.product');
      if (!cart) {
        throw new Error(`Carrito con ID ${cartId} no encontrado`);
      }

      if (cart.products.length === 0) {
        throw new Error('El carrito está vacío');
      }

      let totalAmount = 0;

      // Verificar stock y calcular el total
      for (const item of cart.products) {
        const product = item.product;
        if (product.stock < item.quantity) {
          throw new Error(`Stock insuficiente para el producto: ${product.title}`);
        }
        totalAmount += product.price * item.quantity;
      }

      // Actualizar stock
      for (const item of cart.products) {
        const product = item.product;
        product.stock -= item.quantity;
        await product.save();
      }

      // Crear ticket
      const ticket = new Ticket({
        code: uuidv4(), // Generamos un código único para el ticket
        amount: totalAmount,
        purchaser: userEmail, // Usamos el correo del usuario
      });
      await ticket.save();

      // Vaciar carrito
      cart.products = [];
      await cart.save();

      await session.commitTransaction();
      return ticket;
    } catch (error) {
      await session.abortTransaction();
      throw new Error(`Error al procesar la compra: ${error.message}`);
    } finally {
      session.endSession();
    }
  }
}

export default CartManagerMongo;

