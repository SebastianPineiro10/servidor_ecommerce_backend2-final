import Cart from '../models/cart.js';
import Product from '../models/product.js';

// Crear un nuevo carrito
export const createCart = async (req, res) => {
  try {
    const newCart = new Cart({ userId: req.user.id, products: [] });
    await newCart.save();
    res.status(201).json({ message: 'Carrito creado exitosamente', cart: newCart });
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
};

// Obtener un carrito por ID
export const getCartById = async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (cart.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a este carrito' });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el carrito' });
  }
};

// Agregar un producto al carrito
export const addProductToCart = async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    const product = await Product.findById(pid);

    if (!cart || !product) return res.status(404).json({ error: 'Carrito o producto no encontrado' });

    if (cart.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
    }

    const productIndex = cart.products.findIndex(item => item.productId.toString() === pid);
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += 1;
    } else {
      cart.products.push({ productId: pid, quantity: 1 });
    }

    await cart.save();
    res.status(200).json({ message: 'Producto agregado al carrito', cart });
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
};

// Eliminar un producto del carrito
export const removeProductFromCart = async (req, res) => {
  const { cid, pid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (cart.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
    }

    cart.products = cart.products.filter(item => item.productId.toString() !== pid);
    await cart.save();

    res.status(200).json({ message: 'Producto eliminado del carrito', cart });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar producto del carrito' });
  }
};

// Vaciar un carrito
export const clearCart = async (req, res) => {
  const { cid } = req.params;

  try {
    const cart = await Cart.findById(cid);
    if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

    if (cart.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'No tienes permiso para modificar este carrito' });
    }

    cart.products = [];
    await cart.save();

    res.status(200).json({ message: 'Carrito vaciado correctamente', cart });
  } catch (err) {
    res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
};
