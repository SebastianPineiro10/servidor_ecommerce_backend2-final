export const purchaseCart = async (req, res) => {
    try {
      const { cid } = req.params;
  
      // Validación inicial del ID de carrito
      if (!cid || !mongoose.isValidObjectId(cid)) {
        return res.status(400).json({ error: 'ID de carrito inválido' });
      }
  
      const cart = await Cart.findById(cid).populate('products.product');
  
      if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
      }
  
      if (cart.products.length === 0) {
        return res.status(400).json({ error: 'El carrito está vacío' });
      }
  
      let totalAmount = 0;
      const productsToPurchase = [];
      const insufficientStockProducts = [];
      const bulkUpdates = [];
  
      for (const item of cart.products) {
        const product = item.product;
        if (product.stock >= item.quantity) {
          product.stock -= item.quantity;
          bulkUpdates.push({ updateOne: { filter: { _id: product._id }, update: { stock: product.stock } } });
          totalAmount += product.price * item.quantity;
          productsToPurchase.push(item);
        } else {
          insufficientStockProducts.push(product.name);
        }
      }
  
      if (insufficientStockProducts.length > 0) {
        return res.status(400).json({
          error: `No hay suficiente stock para los productos: ${insufficientStockProducts.join(', ')}`
        });
      }
  
      await Product.bulkWrite(bulkUpdates); // Actualiza todos los productos
  
      const ticket = new Ticket({
        code: uuidv4(),
        amount: totalAmount,
        purchaser: req.user.email,
      });
  
      await ticket.save();
  
      cart.products = cart.products.filter(item => !productsToPurchase.includes(item));
      await cart.save();
  
      res.status(200).json({
        message: 'Compra realizada con éxito',
        ticket,
      });
    } catch (error) {
      console.error(`Error en la compra (Carrito: ${cid}):`, error.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  