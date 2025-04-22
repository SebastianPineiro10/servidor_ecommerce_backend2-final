import ProductDAO from '../dao/product.dao.js';
import ProductDTO from '../dto/product.dto.js';

class ProductRepository {
    async getAllProducts() {
        const products = await ProductDAO.getAllProducts();
        return products.map(product => new ProductDTO(product));
    }

    async getProductById(id) {
        const product = await ProductDAO.getProductById(id);
        return product ? new ProductDTO(product) : null;
    }

    async addProduct(productData) {
        return await ProductDAO.addProduct(productData);
    }

    async updateProduct(id, updatedData) {
        return await ProductDAO.updateProduct(id, updatedData);
    }

    async deleteProduct(id) {
        return await ProductDAO.deleteProduct(id);
    }
}

export default new ProductRepository();
