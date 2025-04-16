// middlewares/verifyJWT.js

export const verifyJWT = (req, res, next) => {
    // Lógica para verificar el JWT
    const token = req.headers['authorization'];
    if (!token) {
      return res.status(403).json({ message: 'Token no proporcionado' });
    }
    
    // Lógica de decodificación y validación del token JWT
    // Si es válido, llamamos a next() para continuar con la ruta
    try {
      const decoded = jwt.verify(token, 'tu_clave_secreta');
      req.user = decoded;
      next(); // Permite que la siguiente función se ejecute
    } catch (err) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
  };
  