const socket = io();

// Enviar nuevo producto al servidor
const form = document.getElementById('formNewProduct');
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newProduct = {
        title: form.title.value,
        description: form.description.value,
        code: form.code.value,
        price: parseFloat(form.price.value),
        stock: parseInt(form.stock.value),
        category: form.category.value,
        status: true,
        thumbnails: []
    };

    socket.emit('newProduct', newProduct);

    // Limpiar el formulario
    form.reset();
});

// Escuchar productos iniciales
socket.on('initialProducts', (products) => {
    const productList = document.getElementById('productsList');
    productList.innerHTML = '';  // Limpiar lista

    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product-card');
        productElement.innerHTML = `
            <h3>${product.title}</h3>
            <p><strong>Precio:</strong> $${product.price}</p>
            <button class="delete-btn" data-code="${product.code}">Eliminar</button>
        `;
        productList.appendChild(productElement);
    });
});

// Escuchar cuando se agrega un nuevo producto
socket.on('productAdded', (newProduct) => {
    const productList = document.getElementById('productsList');
    const productElement = document.createElement('div');
    productElement.classList.add('product-card');
    productElement.innerHTML = `
        <h3>${newProduct.title}</h3>
        <p><strong>Precio:</strong> $${newProduct.price}</p>
        <button class="delete-btn" data-code="${newProduct.code}">Eliminar</button>
    `;
    productList.appendChild(productElement);
});

// Escuchar cuando se elimina un producto
socket.on('productDeleted', (data) => {
    const productList = document.getElementById('productsList');
    const productElement = document.querySelector(`button[data-code="${data.code}"]`).closest('.product-card');
    if (productElement) {
        productList.removeChild(productElement);
    }
});

// Escuchar errores de productos
socket.on('productError', (error) => {
    alert(`Error: ${error.message}`);
});

// Eliminar producto
document.getElementById('productsList').addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const code = e.target.getAttribute('data-code');
        socket.emit('deleteProduct', code);
    }
});
