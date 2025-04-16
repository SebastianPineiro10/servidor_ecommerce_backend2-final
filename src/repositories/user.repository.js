import Product from '../models/product.js';

export const getAllProducts = async () => {
  try {
    return await Product.find();
  } catch (error) {
    throw new Error('Error al obtener productos');
  }
};

export const addProduct = async (productData) => {
  try {
    const product = new Product(productData);
    await product.save();
    return product;
  } catch (error) {
    throw new Error('Error al agregar el producto');
  }
};

export const getProductById = async (productId) => {
  try {
    return await Product.findById(productId);
  } catch (error) {
    throw new Error('Error al obtener el producto');
  }
};

export const updateProduct = async (productId, updateData) => {
  try {
    return await Product.findByIdAndUpdate(productId, updateData, { new: true });
  } catch (error) {
    throw new Error('Error al actualizar el producto');
  }
};

export const deleteProduct = async (productId) => {
  try {
    await Product.findByIdAndDelete(productId);
  } catch (error) {
    throw new Error('Error al eliminar el producto');
  }
};
