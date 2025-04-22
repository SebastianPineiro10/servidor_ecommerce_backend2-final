// sessionController.js
import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/user.repository.js';

export const register = async (req, res) => {
  try {
    console.log('Solicitud de registro recibida');

    const { name, email, password, role } = req.body;

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      console.log('Usuario ya existe');
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    console.log('Creando usuario nuevo...');
    const newUser = await UserRepository.createUser({ name, email, password, role });

    const token = jwt.sign({ userId: newUser._id, role: newUser.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Incluir el rol en el token

    req.session.user = newUser;
    console.log('Registro exitoso, enviando respuesta');
    let redirect = '/';  // Establecer un valor por defecto
     if (role === 'admin') {
        redirect = '/realtimeproducts';
    } else if (role === 'user') {
        redirect = '/products';
    }
    res.status(201).json({ 
      message: 'Usuario registrado correctamente', 
      token, 
      user: newUser,
      redirect: redirect // Agrega la redirección 
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req, res) => {
  try {
    console.log('Solicitud de login recibida');

    const { email, password } = req.body;
    console.log(`Email recibido: ${email}`);

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      console.log('Usuario no encontrado');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    console.log(`Usuario encontrado: ${user.email}`);

    if (!(await user.verifyPassword(password))) {
      console.log('Contraseña incorrecta');
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' }); // Incluir el rol en el token
    req.session.user = user;

    console.log('Login exitoso, enviando respuesta');
    let redirect = '/';
    if (user.role === 'admin') {
      redirect = '/realtimeproducts';
    } else if (user.role === 'user') {
      redirect = '/products';
    }
    res.status(200).json({ message: 'Login exitoso', token, user, redirect }); // Agrega redirect a la respuesta
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(500).json({ error: 'Error en la autenticación' });
  }
};

export const current = (req, res) => {
    try{
        console.log('Solicitud a /current recibida');
        // El middleware authenticate ya debió haber adjuntado el usuario a la request
        if (!req.user) {
            console.log('Usuario no autenticado');
            return res.status(401).json({ error: 'Usuario no autenticado' }); // Esto no debería ocurrir si el middleware funciona correctamente
        }
        console.log('Usuario actual:', req.user);
        res.status(200).json({ 
            status: 'success', 
            payload: req.user // Devuelve la información del usuario
        });
    } catch(error){
        console.error("Error en /current", error);
        res.status(500).json({ error: 'Error al obtener usuario actual'})
    }

};