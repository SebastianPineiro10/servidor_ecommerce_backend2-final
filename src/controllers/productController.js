import ProductRepository from '../repositories/product.repository.js';

export const getAllProducts = async (req, res) => {
    try {
        const products = await ProductRepository.getAllProducts();
        res.status(200).json({ products });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { pid } = req.params;
        const product = await ProductRepository.getProductById(pid);
        if (!product) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json({ product });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

export const addProduct = async (req, res) => {
    try {
        const newProduct = await ProductRepository.addProduct(req.body);
        res.status(201).json({ message: 'Producto agregado', product: newProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar el producto' });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const updatedProduct = await ProductRepository.updateProduct(pid, req.body);
        if (!updatedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json({ message: 'Producto actualizado', product: updatedProduct });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { pid } = req.params;
        const deletedProduct = await ProductRepository.deleteProduct(pid);
        if (!deletedProduct) return res.status(404).json({ error: 'Producto no encontrado' });
        res.status(200).json({ message: 'Producto eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
};
