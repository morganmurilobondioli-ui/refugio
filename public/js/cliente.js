// public/js/cliente.js

/**
 * VISTA PÚBLICA - CLIENTE
 * Usa los mismos endpoints del backend sin modificarlos
 */

let todosLosAnimales = [];
let animalesDisponibles = [];

// ==============================================
// INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Vista pública cargada');
    cargarAnimalesDisponibles();
    initEventListeners();
});

function initEventListeners() {
    // Búsqueda
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filtrarAnimales, 300));
    }
}

// ==============================================
// CARGAR ANIMALES
// ==============================================

/**
 * Cargar animales disponibles
 */
async function cargarAnimalesDisponibles() {
    const container = document.getElementById('animalesContainer');
    
    try {
        showLoading(container, 'Cargando animales disponibles...');
        
        // Usar el endpoint existente
        const data = await fetchAPI('/api/animales');
        
        if (data.success) {
            todosLosAnimales = data.data;
            
            // Filtrar solo disponibles
            animalesDisponibles = todosLosAnimales.filter(a => a.estado === 'disponible');
            
            // Actualizar estadísticas
            document.getElementById('totalDisponibles').textContent = animalesDisponibles.length;
            
            const adoptados = todosLosAnimales.filter(a => a.estado === 'adoptado').length;
            document.getElementById('totalAdoptados').textContent = adoptados;
            
            // Renderizar
            renderizarAnimales(animalesDisponibles);
        }
        
    } catch (error) {
        console.error('Error:', error);
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                <p class="text-muted">Error al cargar los animales</p>
            </div>
        `;
    }
}

// ==============================================
// RENDERIZADO
// ==============================================

/**
 * Renderizar animales en cards
 */
function renderizarAnimales(animales) {
    const container = document.getElementById('animalesContainer');
    const noResultados = document.getElementById('noResultados');
    
    if (animales.length === 0) {
        container.innerHTML = '';
        noResultados.style.display = 'block';
        return;
    }
    
    noResultados.style.display = 'none';
    
    container.innerHTML = animales.map(animal => `
        <div class="col mb-40px">
            <div class="card border-0 border-radius-10px box-shadow-extra-large h-100 overflow-hidden card-hover-publico">
                <!-- Imagen -->
                <div class="position-relative overflow-hidden" style="height: 280px;">
                    <img src="${getImageUrl(animal.foto_url)}" 
                         class="card-img-top h-100 w-100" 
                         style="object-fit: cover; transition: transform 0.3s;"
                         alt="${animal.nombre}"
                         onerror="this.src='../images/placeholder-animal.jpg'">
                    
                    <!-- Badge -->
                    <div class="position-absolute top-0 end-0 m-15px">
                        <span class="badge bg-success px-3 py-2">
                            <i class="bi bi-heart-fill me-5px"></i>Disponible
                        </span>
                    </div>
                </div>
                
                <!-- Contenido -->
                <div class="card-body p-30px">
                    <h4 class="card-title fw-700 text-dark-gray mb-15px">${animal.nombre}</h4>
                    
                    <div class="mb-20px">
                        <p class="mb-10px">
                            <i class="bi bi-tag-fill text-base-color me-10px"></i>
                            <span class="fw-600">${animal.raza}</span>
                        </p>
                        <p class="mb-10px">
                            <i class="bi bi-calendar-fill text-base-color me-10px"></i>
                            ${animal.edad} ${animal.edad === 1 ? 'año' : 'años'}
                        </p>
                        <p class="mb-0">
                            <i class="bi bi-speedometer text-base-color me-10px"></i>
                            ${animal.peso} kg
                        </p>
                    </div>
                    
                    ${animal.descripcion ? `
                        <p class="text-muted mb-20px small">${truncateText(animal.descripcion, 80)}</p>
                    ` : ''}
                    
                    <!-- Botones -->
                    <div class="d-grid gap-2">
                        <a href="animal.html?id=${animal.id}" 
                           class="btn btn-medium btn-outline-dark btn-rounded">
                            <i class="bi bi-eye me-5px"></i>Ver Más
                        </a>
                        <a href="adoptar.html?animal_id=${animal.id}" 
                           class="btn btn-medium btn-base-color btn-rounded btn-box-shadow">
                            <i class="bi bi-heart-fill me-5px"></i>¡Quiero Adoptarlo!
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ==============================================
// FILTROS
// ==============================================

/**
 * Filtrar animales por búsqueda
 */
function filtrarAnimales() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    const filtrados = animalesDisponibles.filter(animal => {
        return !searchTerm || 
            animal.nombre.toLowerCase().includes(searchTerm) ||
            animal.raza.toLowerCase().includes(searchTerm) ||
            (animal.descripcion && animal.descripcion.toLowerCase().includes(searchTerm));
    });
    
    renderizarAnimales(filtrados);
}

