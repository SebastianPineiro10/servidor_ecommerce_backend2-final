import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import UserDTO from '../dto/user.dto.js';

// Controlador para registrar usuarios
export const register = async (req, res) => {
  const { first_name, last_name, email, age, password, role } = req.body;

  try {
    if (!first_name || !last_name || !email || !age || !password) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El correo electrónico ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    console.log('Contraseña encriptada:', hashedPassword);

    const newUser = new User({
      first_name,
      last_name,
      email,
      age,
      password: hashedPassword,
      role: role || 'user',
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente', redirect: '/login' });

  } catch (error) {
    console.error('Error en el registro:', error.message);
    res.status(500).json({ error: error.message });
  }
};

// Controlador para iniciar sesión
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Datos recibidos:', req.body);

    const user = await User.findOne({ email });
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    console.log('Usuario encontrado:', user);
    console.log('Contraseña ingresada:', password);
    console.log('Hash almacenado en la base de datos:', user.password);

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log('¿Contraseña válida?:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('Falló la comparación de contraseñas');
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Token generado:', token);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // o true si estás usando HTTPS en local
      maxAge: 3600000,
      sameSite: 'none', // si estás usando frontend en otro origen
    });

    const userDTO = new UserDTO(user);

    // Redirección basada en el rol del usuario
    if (user.role === 'admin') {
      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: userDTO,
        redirect: '/realtimeproducts', // Redirige a la página del admin
      });
    } else if (user.role === 'user') {
      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: userDTO,
        redirect: '/products', // Redirige a la página de usuario
      });
    } else {
      return res.status(200).json({
        message: 'Inicio de sesión exitoso',
        user: userDTO,
        redirect: '/', // Redirige a la página principal por defecto si el rol es desconocido
      });
    }

  } catch (error) {
    console.error('Error en el login:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Controlador para validar usuario actual
export const current = async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'No autorizado. Token no proporcionado.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const userDTO = new UserDTO(user);
    res.status(200).json({ status: 'success', payload: userDTO });

  } catch (error) {
    console.error('Error al validar el token:', error.message);
    res.status(401).json({ error: 'Token inválido o expirado.' });
  }
};
