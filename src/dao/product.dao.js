import ProductModel from '../models/product.model.js';

class ProductDAO {
    async getAll() {
        return await ProductModel.find();
    }

    async getById(id) {
        return await ProductModel.findById(id);
    }

    async create(data) {
        return await ProductModel.create(data);
    }

    async update(id, data) {
        return await ProductModel.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await ProductModel.findByIdAndDelete(id);
    }
}

export default new ProductDAO();
