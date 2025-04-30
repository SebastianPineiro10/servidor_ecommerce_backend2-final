import Product from '../models/product.model.js';

export default class ProductManagerMongo {
  async getProducts(options = {}) {
    const { limit = 10, page = 1, sort, query } = options;

    const filters = {};
    if (query) filters.category = query;

    const sortOptions = sort === 'asc'
      ? { price: 1 }
      : sort === 'desc'
      ? { price: -1 }
      : {};

    return await Product.paginate(filters, {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOptions,
      lean: true
    });
  }

  async getProductById(id) {
    const product = await Product.findById(id).lean();
    if (!product) throw new Error('Producto no encontrado');
    return product;
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
