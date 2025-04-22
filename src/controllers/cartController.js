// src/controllers/cart.controller.js
import CartRepository from '../repositories/cart.repository.js';
import mailService from '../services/mailing.service.js';
import TicketRepository from '../repositories/ticket.repository.js';
import ProductDAO from '../dao/product.dao.js'; // Importa el ProductDAO
import { v4 as uuidv4 } from 'uuid';

export const getCartById = async (req, res) => {
    try {
        const cart = await CartRepository.getCartById(req.params.cid);
        if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });
        res.status(200).json({ cart });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el carrito' });
    }
};

export const createCart = async (req, res) => {
    try {
        const newCart = await CartRepository.createCart(req.body);
        res.status(201).json({ message: 'Carrito creado', cart: newCart });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
};

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

export const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const { email } = req.session.user;  // Asegúrate de que el email esté en session.user

        const cart = await CartRepository.getCartById(cid);
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        // 1. Procesar la compra (implementación completa)
        const purchaseResult = await processPurchase(cart, email);

        // 2. Crear el ticket
        let ticket;
        if (purchaseResult.ticket) {
            ticket = await TicketRepository.createTicket(purchaseResult.ticket);
        }

        // 3. Enviar el correo de confirmación
        if (ticket) { // Solo intenta enviar el correo si se creó el ticket
            try {
                await mailService.sendPurchaseConfirmation(email, ticket);
            } catch (error) {
                console.error('Error al enviar correo de confirmación:', error);
                // a) No hacer nada (solo loguear el error): la compra se completó, pero el correo no se envió.
                // b) Enviar un mensaje de error al cliente, pero indicar que la compra se realizó.
                // c) Revertir la compra (más complejo, implica transacciones).
                return res.status(500).json({
                    message: 'Compra realizada, pero hubo un error al enviar la confirmación por correo.',
                    productsNotPurchased: purchaseResult.productsNotPurchased,
                });
            }
        }

        // 4. Responder al cliente
        res.status(200).json({ message: 'Compra realizada con éxito', ticket, productsNotPurchased: purchaseResult.productsNotPurchased });
    } catch (error) {
        console.error('Error en purchaseCart:', error);
        res.status(500).json({ error: 'Error interno del servidor', message: error.message });
    }
};

// Función para procesar la compra (IMPLEMENTACIÓN COMPLETA)
async function processPurchase(cart, userEmail) {
    let totalAmount = 0;
    const productsNotPurchased = [];
    const purchasedProducts = [];

    for (const item of cart.products) {
        const productFromDB = await ProductDAO.getById(item.product); // Obtener producto de la base de datos
        if (productFromDB && productFromDB.stock >= item.quantity) {
            // Hay suficiente stock
            productFromDB.stock -= item.quantity; // Reduce el stock
            await ProductDAO.updateProduct(item.product, { stock: productFromDB.stock }); // Actualiza el stock en la base de datos
            totalAmount += productFromDB.price * item.quantity;
            purchasedProducts.push(item.product); // Para usar al actualizar el carrito
        } else {
            // No hay suficiente stock
            productsNotPurchased.push(item);
        }
    }

    const ticket = {
        code: uuidv4(),  // Genera un código único para el ticket
        purchase_datetime: new Date(),
        amount: totalAmount, // Calcula el monto total
        purchaser: userEmail,
    };

    // Actualizar el carrito:  Eliminar solo los productos comprados
    cart.products = cart.products.filter(item => !purchasedProducts.includes(item.product));
    await CartDAO.updateCart(cart._id, { products: cart.products }); // Actualiza el carrito en la base de datos

    return { ticket, productsNotPurchased };
}
