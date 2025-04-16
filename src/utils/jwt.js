import jwt from 'jsonwebtoken'; // Usamos import en lugar de require
const secretKey = process.env.JWT_SECRET_KEY; // Usar variable de entorno para mayor seguridad

// Función para generar un token JWT
export function generateToken(payload) {
  return jwt.sign(payload, secretKey, { expiresIn: '24h' }); // Expira en 24 horas
}

// Función para verificar el token JWT
export function verifyToken(token) {
  try {
    return jwt.verify(token, secretKey); // Verifica si el token es válido
  } catch (error) {
    return null; // Retorna null si el token no es válido o ha expirado
  }
}
