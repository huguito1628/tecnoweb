// Sidebar responsive (no toques)
const sidebar = document.getElementById("sidebar");
document.getElementById("menuToggle").addEventListener("click", () => sidebar.classList.add("show-sidebar"));
document.getElementById("closeSidebar").addEventListener("click", () => sidebar.classList.remove("show-sidebar"));

// Productos en localStorage (empieza vacío por decisión tuya)
let productos = JSON.parse(localStorage.getItem('productos')) || [];

// Elementos
const productList = document.getElementById("productList");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const priceFilter = document.getElementById("priceFilter");
const noResults = document.getElementById("noResultsMessage");

// ==== UTILIDADES ====
function guardarProductos() {
  localStorage.setItem('productos', JSON.stringify(productos));
  renderCategoryOptions();
  verificarStockBajo();
}

function generarID() {
  // ID basado en timestamp + random (único)
  return 'PRD-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(Math.random()*900+100);
}

// ==== RENDER CATEGORIES ====
function renderCategoryOptions() {
  const categories = [...new Set(productos.map(p => p.categoria))].sort();
  categoryFilter.innerHTML = '<option value="all">Todas</option>';
  categories.forEach(c => categoryFilter.innerHTML += `<option value="${c}">${c}</option>`);
}

// ==== RENDER PRODUCTS ====
function renderProducts(list) {
  productList.innerHTML = "";
  if (list.length === 0) { noResults.classList.remove("d-none"); return; }
  noResults.classList.add("d-none");

  list.forEach(p => {
    const stockClass = p.stock <= 2 ? "low-stock":"in-stock";
    // tarjeta con botones editar/eliminar superpuestos (manteniendo diseño)
    productList.innerHTML += `
    <div class="col" data-price="${p.precio}" data-category="${p.categoria}">
      <div class="inventory-card p-3 h-100 d-flex flex-column">
        <div class="position-relative">
          <img src="${p.imagen || 'images/default.jpg'}" alt="${escapeHtml(p.producto)}" class="product-image">
          <div class="position-absolute top-2 end-2 d-flex gap-2" style="right:10px; top:10px;">
            <button class="btn btn-sm btn-warning" title="Editar" onclick="openEditModal('${p.internalID}', event)"><i class="bi bi-pencil-square"></i></button>
            <button class="btn btn-sm btn-danger" title="Eliminar" onclick="openDeleteConfirm('${p.internalID}', event)"><i class="bi bi-trash"></i></button>
          </div>
        </div>

        <h5 class="text-white mt-3">${escapeHtml(p.producto)}</h5>
        <p class="text-secondary flex-grow-1">Marca: ${escapeHtml(p.marca)} <br> ID: ${p.internalID} <br> SKU: ${escapeHtml(p.sku)}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <span class="fs-5 fw-bold text-light">S/ ${parseFloat(p.precio).toFixed(2)}</span>
          <span class="stock-indicator ${stockClass}">STOCK: ${p.stock}</span>
        </div>
      </div>
    </div>`;
  });
}

// ==== FILTRADO ====
function applyFilters(){
  const search = (searchInput.value || '').toLowerCase();
  const category = categoryFilter.value;
  const priceOrder = priceFilter.value;

  let filtered = productos.filter(p =>
    (category === "all" || p.categoria === category) &&
    (
      p.producto.toLowerCase().includes(search) ||
      p.internalID.toLowerCase().includes(search) ||
      (p.sku && p.sku.toLowerCase().includes(search))
    )
  );

  if(priceOrder==="asc") filtered.sort((a,b)=>a.precio-b.precio);
  if(priceOrder==="desc") filtered.sort((a,b)=>b.precio-a.precio);

  renderProducts(filtered);
}

searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
priceFilter.addEventListener("change", applyFilters);

// ==== ADD PRODUCT LOGIC ====
const addForm = document.getElementById('addForm');
const add_imgInput = document.getElementById('add_productoImagen');
const add_preview = document.getElementById('add_previewImage');

// preview add
add_imgInput.addEventListener('change', () => {
  if(add_imgInput.files && add_imgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      add_preview.src = e.target.result;
      add_preview.classList.remove('d-none');
    };
    reader.readAsDataURL(add_imgInput.files[0]);
  } else {
    add_preview.src = '';
    add_preview.classList.add('d-none');
  }
});

addForm.addEventListener('submit', function(e){
  e.preventDefault();
  const nombre = document.getElementById('add_productoNombre').value.trim();
  const sku = document.getElementById('add_productoSKU').value.trim();
  const marca = document.getElementById('add_productoMarca').value.trim();
  const categoria = document.getElementById('add_productoCategoria').value.trim();
  const stock = parseInt(document.getElementById('add_productoStock').value);
  const precio = parseFloat(document.getElementById('add_productoPrecio').value);

  if(!nombre || !sku || !marca || !categoria || isNaN(stock) || isNaN(precio)) return;

  const internalID = generarID();

  const processAndSave = (imgData) => {
    const newProduct = { internalID, producto: nombre, sku, marca, categoria, stock, precio, imagen: imgData || "" };
    productos.push(newProduct);
    guardarProductos();
    applyFilters();
    const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
    if(modal) modal.hide();
    addForm.reset();
    add_preview.src = ''; add_preview.classList.add('d-none');
  };

  if(add_imgInput.files && add_imgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => processAndSave(e.target.result);
    reader.readAsDataURL(add_imgInput.files[0]);
  } else {
    processAndSave("");
  }
});

// ==== EDIT PRODUCT LOGIC (modal identical to add) ====
const editForm = document.getElementById('editForm');
const edit_imgInput = document.getElementById('edit_productoImagen');
const edit_preview = document.getElementById('edit_previewImage');

// preview edit
edit_imgInput.addEventListener('change', () => {
  if(edit_imgInput.files && edit_imgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      edit_preview.src = e.target.result;
      edit_preview.classList.remove('d-none');
    };
    reader.readAsDataURL(edit_imgInput.files[0]);
  } else {
    // if cleared file input, keep existing preview (do not auto-hide)
  }
});

// abrir modal editar y llenar campos
function openEditModal(internalID, ev) {
  ev && ev.stopPropagation();
  const p = productos.find(x => x.internalID === internalID);
  if(!p) return alert('Producto no encontrado.');

  document.getElementById('edit_internalID').value = p.internalID;
  document.getElementById('edit_productoNombre').value = p.producto;
  document.getElementById('edit_productoSKU').value = p.sku || '';
  document.getElementById('edit_productoMarca').value = p.marca;
  document.getElementById('edit_productoCategoria').value = p.categoria;
  document.getElementById('edit_productoStock').value = p.stock;
  document.getElementById('edit_productoPrecio').value = p.precio;
  if(p.imagen) {
    edit_preview.src = p.imagen;
    edit_preview.classList.remove('d-none');
  } else {
    edit_preview.src = '';
    edit_preview.classList.add('d-none');
  }
  // reset file input
  edit_imgInput.value = '';
  const editModal = new bootstrap.Modal(document.getElementById('editProductModal'));
  editModal.show();
}

editForm.addEventListener('submit', function(e){
  e.preventDefault();
  const internalID = document.getElementById('edit_internalID').value;
  const nombre = document.getElementById('edit_productoNombre').value.trim();
  const sku = document.getElementById('edit_productoSKU').value.trim();
  const marca = document.getElementById('edit_productoMarca').value.trim();
  const categoria = document.getElementById('edit_productoCategoria').value.trim();
  const stock = parseInt(document.getElementById('edit_productoStock').value);
  const precio = parseFloat(document.getElementById('edit_productoPrecio').value);

  if(!nombre || !sku || !marca || !categoria || isNaN(stock) || isNaN(precio)) return;

  const idx = productos.findIndex(x => x.internalID === internalID);
  if(idx === -1) return alert('Producto no encontrado.');

  const finalizeUpdate = (imgData) => {
    productos[idx].producto = nombre;
    productos[idx].sku = sku;
    productos[idx].marca = marca;
    productos[idx].categoria = categoria;
    productos[idx].stock = stock;
    productos[idx].precio = precio;
    if(imgData !== undefined) productos[idx].imagen = imgData; // undefined -> no change; "" -> clear
    guardarProductos();
    applyFilters();
    const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
    if(modal) modal.hide();
  };

  if(edit_imgInput.files && edit_imgInput.files[0]) {
    const reader = new FileReader();
    reader.onload = e => finalizeUpdate(e.target.result);
    reader.readAsDataURL(edit_imgInput.files[0]);
  } else {
    // keep existing image (no change)
    finalizeUpdate(undefined);
  }
});

// ==== DELETE PRODUCT LOGIC (modal confirm) ====
let pendingDeleteID = null;
function openDeleteConfirm(internalID, ev) {
  ev && ev.stopPropagation();
  pendingDeleteID = internalID;
  const p = productos.find(x => x.internalID === internalID);
  document.getElementById('deleteConfirmText').textContent = `¿Deseas eliminar este producto?\n"${p ? p.producto : ''}" (ID: ${internalID})`;
  const delModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
  delModal.show();
}

document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
  if(!pendingDeleteID) return;
  productos = productos.filter(x => x.internalID !== pendingDeleteID);
  guardarProductos();
  applyFilters();
  pendingDeleteID = null;
  const delModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
  if(delModal) delModal.hide();
});

// ==== STOCK BAJO (alert) con botón de cerrar ====
function verificarStockBajo() {
    const nivelAlerta = parseInt(localStorage.getItem('nivelStockBajo')) || 2;
    const productosBajos = productos.filter(p => p.stock <= nivelAlerta);
  
    const alertaExistente = document.getElementById('alertaStock');
    if (alertaExistente) alertaExistente.remove();
  
    if (productosBajos.length > 0) {
      const alerta = document.createElement('div');
      alerta.id = 'alertaStock';
      alerta.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3 shadow-lg';
      alerta.style.zIndex = '9999';
      alerta.innerHTML = `
        <i class="bi bi-exclamation-triangle-fill"></i>
        <strong> Atención:</strong> ${productosBajos.length} producto(s) con stock bajo.
        <button type="button" class="btn btn-sm btn-outline-light ms-3" onclick="mostrarDetallesStockBajo()">Ver detalles</button>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      document.body.appendChild(alerta);
    }
  }

function mostrarDetallesStockBajo() {
  const nivelAlerta = parseInt(localStorage.getItem('nivelStockBajo')) || 2;
  const productosBajos = productos.filter(p => p.stock <= nivelAlerta);
  let mensaje = '⚠️ Productos con stock bajo:\n\n';
  productosBajos.forEach(p => mensaje += `${p.producto} → Stock: ${p.stock}\n`);
  alert(mensaje);
}

// ==== HELPERS & INIT ====
function escapeHtml(text) {
  if(!text) return '';
  return text.replace(/[&<>"'`=\/]/g, function (s) {
      return ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
        '/':'&#x2F;','`':'&#x60;','=':'&#x3D;'
      })[s];
  });
}

// Inicializar UI
renderCategoryOptions();
applyFilters();
verificarStockBajo();

// Exponer applyFilters global para que se pueda llamar desde otras acciones (ya usado)
window.applyFilters = applyFilters;

// Mantener el contador de productos en index (si existiera la página principal abierta)
function actualizarContadorIndex(){
  try {
    const cont = productos.length;
    localStorage.setItem('cantidadProductos', cont);
  } catch(e){}
}
// Guardar también cantidad para index
const origGuardar = guardarProductos;
guardarProductos = function(){ origGuardar(); actualizarContadorIndex(); };
