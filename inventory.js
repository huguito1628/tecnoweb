document.addEventListener('DOMContentLoaded', () => {
    // Lógica básica del sidebar y logout (puedes copiar de dashboard.js)
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const logoutBtn = document.getElementById('logoutBtn');
    
    menuToggle?.addEventListener('click', () => {
        sidebar.classList.add('show-sidebar');
    });
    closeSidebar?.addEventListener('click', () => {
        sidebar.classList.remove('show-sidebar');
    });
    logoutBtn?.addEventListener('click', () => {
        localStorage.removeItem('sessionActive');
        localStorage.removeItem('sessionUser');
        window.location.href = 'auth.html';
    });
    
    // ===================================
    // LÓGICA DINÁMICA DE INVENTARIO
    // ===================================
    const productListContainer = document.getElementById('productList');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const priceFilter = document.getElementById('priceFilter');
    const noResultsMessage = document.getElementById('noResultsMessage');

    // Obtener todos los productos del DOM
    const allProducts = Array.from(productListContainer.querySelectorAll('.col:not(#noResultsMessage)'));

    // Función principal que aplica todos los filtros y la ordenación
    function applyFiltersAndSort() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedType = typeFilter.value;
        const sortOrder = priceFilter.value;

        let filteredProducts = allProducts;
        let visibleCount = 0;

        // 1. Filtrar por búsqueda y tipo
        filteredProducts = allProducts.filter(product => {
            const name = product.querySelector('h5').textContent.toLowerCase();
            const type = product.getAttribute('data-type');
            const matchSearch = name.includes(searchTerm);
            const matchType = selectedType === 'all' || type === selectedType;

            const isVisible = matchSearch && matchType;
            
            // Toggle visibility con una transición suave (usando CSS transition)
            product.style.display = isVisible ? 'block' : 'none';
            if (isVisible) {
                visibleCount++;
            }
            return isVisible;
        });
        
        // 2. Ordenar por precio
        if (sortOrder !== 'default') {
            filteredProducts.sort((a, b) => {
                const priceA = parseFloat(a.getAttribute('data-price'));
                const priceB = parseFloat(b.getAttribute('data-price'));

                if (sortOrder === 'asc') {
                    return priceA - priceB; // Menor a mayor
                } else {
                    return priceB - priceA; // Mayor a menor
                }
            });

            // Reinsertar los productos ordenados en el contenedor
            productListContainer.innerHTML = ''; // Limpiar el contenedor
            filteredProducts.forEach(product => productListContainer.appendChild(product));
            productListContainer.appendChild(noResultsMessage); // Asegurar que el mensaje esté al final
        }

        // 3. Mostrar/Ocultar mensaje de "Sin Resultados"
        if (visibleCount === 0) {
            noResultsMessage.classList.remove('d-none');
        } else {
            noResultsMessage.classList.add('d-none');
        }
    }

    // Escuchadores de eventos para la interactividad
    searchInput.addEventListener('input', applyFiltersAndSort);
    typeFilter.addEventListener('change', applyFiltersAndSort);
    priceFilter.addEventListener('change', applyFiltersAndSort);

    // Efecto visual dinámico al pasar el ratón sobre las cards (micro-interacción)
    productListContainer.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.inventory-card');
        if (card) {
            // Se asume el estilo de hover en CSS, pero puedes añadir más aquí.
            card.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.7)'; // Sombra más profunda al pasar
        }
    });

    productListContainer.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.inventory-card');
        if (card) {
            card.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.5)'; // Vuelve a la sombra normal
        }
    });

    // Ejecutar al inicio para asegurar que todos los estilos iniciales se apliquen
    applyFiltersAndSort(); 
});
