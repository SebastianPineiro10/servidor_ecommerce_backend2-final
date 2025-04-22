import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.MONGO_URI) {
    console.error('MONGO_URI no está definida en las variables de entorno');
    process.exit(1);
}

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // Ya no necesitas las opciones deprecated
        console.log('MongoDB Atlas conectado correctamente');
    } catch (error) {
        console.error('Error al conectar a MongoDB Atlas:', error.message);
        process.exit(1);
    }
};
