import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';
import UserDTO from '../dto/user.dto.js';

export const register = async (req, res) => {
  try {
    console.log('Solicitud de registro recibida');

    const { name, email, password, role } = req.body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const newUser = await UserRepository.createUser({ name, email, password, role });

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.session.user = newUser;

    let redirect = '/';
    if (role === 'admin') redirect = '/realtimeproducts';
    else if (role === 'user') redirect = '/products';

    res.status(201).json({ 
      message: 'Usuario registrado correctamente', 
      token, 
      user: newUser,
      redirect
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserRepository.findByEmail(email);
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.session.user = user;

    let redirect = '/';
    if (user.role === 'admin') redirect = '/realtimeproducts';
    else if (user.role === 'user') redirect = '/products';

    res.status(200).json({ message: 'Login exitoso', token, user, redirect });
  } catch (error) {
    res.status(500).json({ error: 'Error en la autenticación' });
  }
};

// VERSIÓN SEGURA DE /current
export const current = (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    const safeUser = new UserDTO(req.user); // Solo devuelve lo necesario
    res.status(200).json({ status: 'success', payload: safeUser });
  } catch (error) {
    console.error("Error en /current", error);
    res.status(500).json({ error: 'Error al obtener usuario actual' });
  }
};
