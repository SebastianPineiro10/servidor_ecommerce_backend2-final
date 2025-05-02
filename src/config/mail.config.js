// src/config/mail.config.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno desde .env

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // 🔑 debe coincidir con EMAIL_USER en .env
    pass: process.env.EMAIL_PASS  // 🔐 debe coincidir con EMAIL_PASS en .env (app password generada desde Gmail)
  }
});

export default transporter;
