// 1. Mostrar carga
function showLoading(container, message = 'Cargando...') {
    container.innerHTML = `
        <div id="loadingOverlay" class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted mt-2">${message}</p>
        </div>
    `;
    // Aseguramos que el contenedor principal esté visible si un script lo ocultó previamente
    container.style.display = ''; 
}

// 2. Función Debounce (Necesaria para initEventListeners)
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    };
}

// 3. Función fetchAPI (Simulación para que el código compile)
async function fetchAPI(url) {
    // Implementación real de tu fetch/axios
    // ...
    return { success: true, data: [] }; 
}