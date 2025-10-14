document.addEventListener('DOMContentLoaded', () => {
  // --- ELEMENTOS ---
  const selectCliente = document.getElementById('selectCliente');
  const selectProducto = document.getElementById('selectProducto');
  const cantidadInput = document.getElementById('cantidadProducto');
  const stockDisplay = document.getElementById('stockProducto');
  const tablaPedido = document.getElementById('tablaPedido');
  const totalVenta = document.getElementById('totalVenta');
  const btnAgregar = document.getElementById('btnAgregarProducto');
  const btnGuardar = document.getElementById('btnGuardarPedido');
  const fechaInput = document.getElementById('fechaVenta');

  // --- CARGAR CLIENTES ---
  function cargarClientes() {
    const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
    selectCliente.innerHTML = '<option value="">Seleccione un cliente...</option>';
    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = cliente.nombre;
      selectCliente.appendChild(option);
    });
  }
  cargarClientes();
  window.addEventListener('storage', e => { if (e.key === 'clientes') cargarClientes(); });

  // --- CARGAR PRODUCTOS ---
  function cargarProductos() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    selectProducto.innerHTML = '<option value="">Seleccione un producto...</option>';
    productos.forEach(p => {
      const option = document.createElement('option');
      option.value = p.internalID;
      option.textContent = `${p.producto} - S/ ${parseFloat(p.precio).toFixed(2)}`;
      selectProducto.appendChild(option);
    });

    // Seleccionar primer producto por defecto y actualizar stock
    if (productos.length > 0) {
      selectProducto.value = productos[0].internalID;
    }
    actualizarStock();
  }
  cargarProductos();
  window.addEventListener('storage', e => { if (e.key === 'productos') cargarProductos(); });

  // --- ACTUALIZAR STOCK DINÁMICO ---
  function actualizarStock() {
    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const productoID = selectProducto.value;

    if (!productoID) {
      stockDisplay.textContent = '-';
      return;
    }

    const producto = productos.find(p => p.internalID === productoID);
    if (!producto) {
      stockDisplay.textContent = '-';
      return;
    }

    stockDisplay.textContent = producto.stock >= 0 ? producto.stock : 0;
  }
  selectProducto.addEventListener('change', actualizarStock);

  // --- BOTON AGREGAR ITEM SIN LOGICA ---
  btnAgregar.addEventListener('click', () => {
    // Solo limpia inputs, no hace nada más
    selectProducto.value = '';
    cantidadInput.value = 1;
    stockDisplay.textContent = '-';
  });

  // --- BOTON GUARDAR PEDIDO ---
  btnGuardar.addEventListener('click', () => {
    const clienteID = selectCliente.value;
    const productoID = selectProducto.value;
    const cantidad = parseInt(cantidadInput.value);

    if (!clienteID) return alert('Seleccione un cliente.');
    if (!productoID || isNaN(cantidad) || cantidad < 1) return alert('Seleccione un producto válido y cantidad.');

    const productos = JSON.parse(localStorage.getItem('productos')) || [];
    const producto = productos.find(p => p.internalID === productoID);
    if (!producto) return alert('Producto no encontrado.');

    if (cantidad > producto.stock) return alert(`No hay suficiente stock. Disponible: ${producto.stock}`);

    // Guardar pedido directamente
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    pedidos.push({
      clienteID,
      fecha: fechaInput.value,
      productos: [{
        internalID: producto.internalID,
        producto: producto.producto,
        cantidad,
        precio: parseFloat(producto.precio)
      }],
      total: cantidad * parseFloat(producto.precio)
    });

    // --- REDUCIR STOCK DEL PRODUCTO EN LOCALSTORAGE ---
    producto.stock -= cantidad;
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    alert('Pedido guardado correctamente.');

    // Limpiar inputs
    cantidadInput.value = 1;
    stockDisplay.textContent = '-';
    selectCliente.value = '';
    selectProducto.value = '';

    actualizarTablaPedidos();
  });

  // --- ACTUALIZAR TABLA DE HISTORIAL DE PEDIDOS ---
  function actualizarTablaPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    tablaPedido.innerHTML = '';
    let total = 0;

    pedidos.forEach(pedido => {
      const clientes = JSON.parse(localStorage.getItem('clientes')) || [];
      const cliente = clientes.find(c => c.id === pedido.clienteID);
      const nombreCliente = cliente ? cliente.nombre : '-';

      pedido.productos.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${nombreCliente}</td>
          <td>${item.producto}</td>
          <td>${item.cantidad}</td>
          <td>S/ ${item.precio.toFixed(2)}</td>
          <td>S/ ${subtotal.toFixed(2)}</td>
          <td>${pedido.fecha}</td>
        `;
        tablaPedido.appendChild(tr);
      });
    });

    totalVenta.textContent = `S/ ${total.toFixed(2)}`;
  }

  // Inicializar tabla al cargar la página
  actualizarTablaPedidos();
});
