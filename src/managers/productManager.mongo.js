import Product from '../models/product.model.js';

class ProductManagerMongo {
  async getProducts(options = {}) {
    try {
      const { limit = 10, page = 1, sort, query } = options;
      // Configurar opciones de paginación
      const paginateOptions = {
        page: parseInt(page),
        limit: parseInt(limit),
        lean: true
      };

      // Agregar ordenamiento si existe
      if (sort) {
        paginateOptions.sort = { price: sort === 'asc' ? 1 : -1 };
      }

      // Configurar filtro por query
      let filter = {};
      if (query) {
        if (['true', 'false'].includes(query.toLowerCase())) {
          filter.status = query.toLowerCase() === 'true';
        } else {
          filter.category = query;
        }
      }

      // Ejecutar consulta con paginación
      const result = await Product.paginate(filter, paginateOptions);

      return {
        status: 'success',
        payload: result.docs,
        totalPages: result.totalPages,
        prevPage: result.prevPage,
        nextPage: result.nextPage,
        page: result.page,
        hasPrevPage: result.hasPrevPage,
        hasNextPage: result.hasNextPage,
        prevLink: result.hasPrevPage ? this._createLink(options, result.prevPage) : null,
        nextLink: result.hasNextPage ? this._createLink(options, result.nextPage) : null
      };
    } catch (error) {
      throw new Error(`Error al obtener productos: ${error.message}`);
    }
  }

  // Método auxiliar para crear enlaces de paginación
  _createLink(options, page) {
    const { limit, sort, query } = options;
    const params = new URLSearchParams();
    params.append('page', page);
    if (limit) params.append('limit', limit);
    if (sort) params.append('sort', sort);
    if (query) params.append('query', query);
    return `/api/products?${params.toString()}`;
  }

  async getProductById(id) {
    try {
      const product = await Product.findById(id).lean();
      if (!product) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }
      return product;
    } catch (error) {
      throw new Error(`Error al obtener producto por ID: ${error.message}`);
    }
  }

  async getProductByCode(code) {
    try {
      return await Product.findOne({ code }).lean();
    } catch (error) {
      throw new Error(`Error al obtener producto por código: ${error.message}`);
    }
  }

  async addProduct(productData) {
    try {
      // Verificar si ya existe un producto con el mismo código
      const existingProduct = await this.getProductByCode(productData.code);
      if (existingProduct) {
        throw new Error(`Ya existe un producto con el código ${productData.code}`);
      }

      // Crear y guardar el nuevo producto
      const newProduct = new Product(productData);
      await newProduct.save();
      return newProduct.toObject();
    } catch (error) {
      throw new Error(`Error al agregar producto: ${error.message}`);
    }
  }

  async updateProduct(id, productData) {
    try {
      // Verificar si el producto existe
      const product = await Product.findById(id);
      if (!product) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }

      // Verificar si se está actualizando el código y ya existe otro producto con ese código
      if (productData.code) {
        const productWithCode = await Product.findOne({
          code: productData.code,
          _id: { $ne: id }
        });
        if (productWithCode) {
          throw new Error(`Ya existe otro producto con el código ${productData.code}`);
        }
      }

      // Actualizar el producto
      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        productData,
        { new: true, runValidators: true }
      ).lean();
      return updatedProduct;
    } catch (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`);
    }
  }

  async deleteProduct(id) {
    try {
      const result = await Product.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`Producto con ID ${id} no encontrado`);
      }
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`);
    }
  }

  async deleteProductByCode(code) {
    try {
      const result = await Product.findOneAndDelete({ code });
      if (!result) {
        return false;
      }
      return true;
    } catch (error) {
      throw new Error(`Error al eliminar producto por código: ${error.message}`);
    }
  }
}

export default ProductManagerMongo;