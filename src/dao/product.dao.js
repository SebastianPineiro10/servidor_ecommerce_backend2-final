import ProductModel from '../models/product.model.js';

class ProductDAO {
    async getAllProducts() {
        return await ProductModel.find();
    }

    async getProductById(id) {
        return await ProductModel.findById(id);
    }

    async addProduct(productData) {
        return await ProductModel.create(productData);
    }

    async updateProduct(id, updatedData) {
        return await ProductModel.findByIdAndUpdate(id, updatedData, { new: true });
    }

    async deleteProduct(id) {
        return await ProductModel.findByIdAndDelete(id);
    }
}

export default new ProductDAO();

