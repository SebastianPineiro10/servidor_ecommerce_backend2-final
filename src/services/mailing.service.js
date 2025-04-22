// src/services/mail.service.js
import transporter from '../config/mail.config.js';

const sendPurchaseConfirmation = async (email, ticket) => {
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: 'Confirmación de Compra',
        html: `
            <p>Gracias por tu compra.</p>
            <p>Aquí está su código de ticket: <strong>${ticket.code}</strong></p>
            <p>Fecha de compra: ${ticket.purchase_datetime}</p>
            <p>Monto: ${ticket.amount}</p>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Correo de confirmación enviado a: ${email}`);
    } catch (error) {
        console.error('Error al enviar correo:', error);
        throw error; // Importante: Re-lanza el error para que lo capture el controlador
    }
};

export default {
    sendPurchaseConfirmation,
};
