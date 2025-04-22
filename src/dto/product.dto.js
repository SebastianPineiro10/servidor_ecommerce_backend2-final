class ProductDTO {
    constructor({ _id, title, description, price, stock }) {
      this.id = _id;
      this.title = title;
      this.description = description;
      this.price = price;
      this.stock = stock;
    }
  }
  
  export default ProductDTO;