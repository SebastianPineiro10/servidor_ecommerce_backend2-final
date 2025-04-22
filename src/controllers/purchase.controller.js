import { sendPurchaseConfirmation } from '../services/mailing.service.js';

export const purchaseCart = async (req, res) => {
    try {
        const { cid } = req.params;
        const cart = await cartRepository.getCartById(cid);
        
        if (!cart) {
            return res.status(404).json({ status: 'error', message: 'Carrito no encontrado' });
        }

        let totalAmount = 0;
        const productsNotPurchased = [];

        for (const item of cart.products) {
            const product = await productRepository.getProductById(item.product._id);
            if (product.stock >= item.quantity) {
                product.stock -= item.quantity;
                await productRepository.updateProduct(product._id, product);
                totalAmount += product.price * item.quantity;
            } else {
                productsNotPurchased.push(item.product._id);
            }
        }

        const ticketData = {
            code: uuidv4(),
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser: req.user.email,
        };

        const ticket = await ticketRepository.createTicket(ticketData);
        await sendPurchaseConfirmation(req.user.email, ticket); // Enviar correo de confirmación

        const updatedCart = await cartRepository.updateCart(cid, {
            products: cart.products.filter(item => productsNotPurchased.includes(item.product._id)),
        });

        res.status(200).json({
            status: 'success',
            message: 'Compra finalizada',
            ticket: ticket,
            productsNotPurchased: productsNotPurchased,
            updatedCart: updatedCart,
        });
    } catch (error) {
        console.error('Error al finalizar la compra:', error);
        res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
    }
};
