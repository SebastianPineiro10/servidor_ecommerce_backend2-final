import Product from '../models/product.model.js';

export default class ProductManagerMongo {
  async getProducts() {
    return await Product.paginate({}, { lean: true });
  }

  async addProduct(productData) {
    const newProduct = new Product(productData);
    await newProduct.save();
    return newProduct;
  }

  async deleteProduct(code) {
    const deleted = await Product.findOneAndDelete({ code });
    return deleted;
  }
}