import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import UserDTO from '../dto/user.dto.js';

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // ✅ Validaciones básicas
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    if (!email.includes('@') || password.length < 6) {
      return res.status(400).json({ error: 'Email inválido o contraseña muy corta (mínimo 6 caracteres)' });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    // Crear usuario y carrito
    await UserRepository.createUser({ name, email, password, role });

    // Obtener al usuario con su cartId actualizado
    const createdUser = await UserRepository.findByEmail(email);

    req.session.user = {
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      cartId: createdUser.cartId || createdUser.cart || null
    };

    const token = jwt.sign(
      { userId: createdUser._id, role: createdUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    let redirect = '/';
    if (role === 'admin') redirect = '/realtimeproducts';
    else if (role === 'user') redirect = '/products';

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: req.session.user,
      redirect
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const user = await UserRepository.findByEmail(email);
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Obtener usuario actualizado por si acaso
    const fullUser = await UserRepository.findByEmail(email);

    req.session.user = {
      name: fullUser.name,
      email: fullUser.email,
      role: fullUser.role,
      cartId: fullUser.cartId || fullUser.cart || null
    };

    const token = jwt.sign(
      { userId: fullUser._id, role: fullUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    let redirect = '/';
    if (fullUser.role === 'admin') redirect = '/realtimeproducts';
    else if (fullUser.role === 'user') redirect = '/products';

    res.status(200).json({
      message: 'Login exitoso',
      token,
      user: req.session.user,
      redirect
    });
  } catch (error) {
    res.status(500).json({ error: 'Error en la autenticación' });
  }
};

export const current = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const safeUser = new UserDTO(req.user);
    res.status(200).json({ status: 'success', payload: safeUser });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuario actual' });
  }
};
