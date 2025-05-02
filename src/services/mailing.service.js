// src/services/mail.service.js
import transporter from '../config/mail.config.js';

const sendPurchaseConfirmation = async (email, ticket) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Confirmación de Compra',
    html: `
      <h2>Gracias por tu compra 🎉</h2>
      <p><strong>Código del ticket:</strong> ${ticket.code}</p>
      <p><strong>Fecha:</strong> ${ticket.purchase_datetime}</p>
      <p><strong>Total:</strong> $${ticket.amount}</p>
      <br>
      <p>⚡️ Este correo es automático. No respondas a esta dirección.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Correo enviado a ${email}`);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
    throw error; // Se reenvía para que el controlador lo capture
  }
};

export default {
  sendPurchaseConfirmation,
};
