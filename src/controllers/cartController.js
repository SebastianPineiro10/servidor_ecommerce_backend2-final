import CartRepository from '../repositories/cart.repository.js';
import mailService from '../services/mailing.service.js';
import TicketRepository from '../repositories/ticket.repository.js';
import ProductDAO from '../dao/product.dao.js';
import { v4 as uuidv4 } from 'uuid';

// Obtener carrito por ID
export const getCartById = async (req, res) => {
  try {
    const cart = await CartRepository.getCartById(req.params.cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.status(200).json({ cart });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// Crear carrito
export const createCart = async (req, res) => {
  try {
    const newCart = await CartRepository.createCart(req.body);
    res.status(201).json({ message: 'Carrito creado', cart: newCart });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
};

// Actualizar carrito
export const updateCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const updatedCart = await CartRepository.updateCart(cid, req.body);
    if (!updatedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.status(200).json({ message: 'Carrito actualizado', cart: updatedCart });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el carrito' });
  }
};

// Eliminar carrito
export const deleteCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const deletedCart = await CartRepository.deleteCart(cid);
    if (!deletedCart) return res.status(404).json({ error: 'Carrito no encontrado' });
    res.status(200).json({ message: 'Carrito eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el carrito' });
  }
};

// ✅ Agregar producto al carrito (reparado)
export const addProductToCart = async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const quantity = parseInt(req.body.quantity || 1);

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Cantidad inválida' });
    }

    const updatedCart = await CartRepository.addProduct(cid, pid, quantity);

    if (!updatedCart) {
      return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto agregado al carrito', cart: updatedCart });
  } catch (error) {
    console.error('Error al agregar producto al carrito:', error);
    res.status(500).json({ error: 'Error interno al agregar producto al carrito' });
  }
};

// ✅ Finalizar compra
export const purchaseCart = async (req, res) => {
  try {
    const { cid } = req.params;
    const { email } = req.session.user;

    const cart = await CartRepository.getCartById(cid);
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const purchaseResult = await processPurchase(cart, email);

    let ticket;
    if (purchaseResult.ticket) {
      ticket = await TicketRepository.createTicket(purchaseResult.ticket);
    }

    if (ticket) {
      try {
        await mailService.sendPurchaseConfirmation(email, ticket);
      } catch (error) {
        console.error('Error al enviar correo de confirmación:', error);
        return res.status(500).json({
          message: 'Compra realizada, pero hubo un error al enviar la confirmación por correo.',
          productsNotPurchased: purchaseResult.productsNotPurchased,
        });
      }
    }

    res.status(200).json({ message: 'Compra realizada con éxito', ticket, productsNotPurchased: purchaseResult.productsNotPurchased });
  } catch (error) {
    console.error('Error en purchaseCart:', error);
    res.status(500).json({ error: 'Error interno del servidor', message: error.message });
  }
};

// 🔧 Lógica de procesamiento de compra
async function processPurchase(cart, userEmail) {
  let totalAmount = 0;
  const productsNotPurchased = [];
  const purchasedProducts = [];

  for (const item of cart.products) {
    const productFromDB = await ProductDAO.getById(item.product);
    if (productFromDB && productFromDB.stock >= item.quantity) {
      productFromDB.stock -= item.quantity;
      await ProductDAO.update(productFromDB._id, { stock: productFromDB.stock });
      totalAmount += productFromDB.price * item.quantity;
      purchasedProducts.push(item.product);
    } else {
      productsNotPurchased.push(item);
    }
  }

  const ticket = {
    code: uuidv4(),
    purchase_datetime: new Date(),
    amount: totalAmount,
    purchaser: userEmail,
  };

  cart.products = cart.products.filter(item => !purchasedProducts.includes(item.product));
  await CartRepository.updateCart(cart._id, { products: cart.products });

  return { ticket, productsNotPurchased };
}
