import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno desde el archivo .env
dotenv.config();

// Verificar si MONGO_URI está definida
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI no está definida en las variables de entorno');
  process.exit(1); // Terminar el proceso si la variable de entorno no está definida
}

export const connectDB = async () => {
  try {
    // Intentar conectar a la base de datos de MongoDB Atlas
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Atlas conectado correctamente');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas:', error.message);
    process.exit(1); // Terminar el proceso si la conexión falla
  }
};
