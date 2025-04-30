import User from '../models/user.model.js';
import CartManagerMongo from '../managers/cartManager.mongo.js';

const cartManager = new CartManagerMongo();

const UserRepository = {
  findByEmail: async (email) => {
    return await User.findOne({ email });
  },

  createUser: async (userData) => {
    // Crear usuario primero
    const newUser = await User.create(userData);

    // Crear carrito con referencia al userId
    const cart = await cartManager.createCart(newUser._id);

    // Asignar cartId al usuario y guardar
    newUser.cartId = cart._id;
    await newUser.save();

    return newUser;
  },

  findById: async (id) => {
    return await User.findById(id);
  },

  findAll: async () => {
    return await User.find();
  }
};

export default UserRepository;
