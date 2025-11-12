/**
 * GALERÍA DE ANIMALES
 * Gestión completa de la vista de animales
 */

// Estado global
let todosLosAnimales = [];
let animalesFiltrados = [];
let vistaActual = 'grid'; // 'grid' o 'list'

// ==============================================
// INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Módulo de animales cargado');
    
    // Cargar animales al inicio
    cargarAnimales();
    
    // Event listeners
    initEventListeners();
});

/**
 * Inicializar event listeners
 */
function initEventListeners() {
    // Búsqueda con debounce
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', debounce(aplicarFiltros, 300));
    
    // Filtros
    document.getElementById('filterEstado').addEventListener('change', aplicarFiltros);
    document.getElementById('sortBy').addEventListener('change', aplicarFiltros);
    
    // Cambio de vista
    document.getElementById('viewGrid').addEventListener('click', () => cambiarVista('grid'));
    document.getElementById('viewList').addEventListener('click', () => cambiarVista('list'));
    
    // Reset filtros
    document.getElementById('btnResetFilters').addEventListener('click', resetearFiltros);

    // ✅ NUEVO: Event listener para el botón de cambio de estado
    const btnConfirmar = document.getElementById('btnConfirmarCambioEstado');
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', confirmarCambioEstado);
    }
}

// ==============================================
// CARGAR ANIMALES
// ==============================================

/**
 * Cargar todos los animales desde la API
 */
async function cargarAnimales() {
    console.log("🟢 cargarAnimales() ejecutada");
    const container = document.getElementById('animalesContainer');
    const loadingIndicator = document.getElementById('loadingIndicator');

    // Mostrar loading una sola vez
    loadingIndicator.classList.remove('d-none');
    container.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted">Cargando animales...</p>
        </div>
    `;

    try {
        const data = await fetchAPI('/api/animales');

        if (data.success) {
            todosLosAnimales = data.data;
            animalesFiltrados = [...todosLosAnimales];

            // Renderizar
            aplicarFiltros(); // aquí solo debería pintar, no limpiar
            showAlert(`${todosLosAnimales.length} animales cargados`, 'success', 2000);
        } else {
            throw new Error(data.message || 'Error al cargar animales');
        }
    } catch (error) {
        console.error('Error al cargar animales:', error);
        showAlert(error.message, 'error');
        container.innerHTML = `
            <div class="col-12">
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle fs-1 mb-3"></i>
                    <p class="mb-0">Error al cargar los animales. Por favor, intenta de nuevo.</p>
                    <button onclick="cargarAnimales()" class="btn btn-primary mt-3">Reintentar</button>
                </div>
            </div>
        `;
    } finally {
        loadingIndicator.classList.add('d-none');
    }
}

// ==============================================
// FILTROS Y ORDENAMIENTO
// ==============================================

/**
 * Aplicar filtros y ordenamiento
 */
function aplicarFiltros() {
    console.log("🟡 aplicarFiltros() ejecutada | total:", todosLosAnimales?.length);
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const estadoFilter = document.getElementById('filterEstado').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Filtrar
    animalesFiltrados = todosLosAnimales.filter(animal => {
        // Filtro de búsqueda
        const matchSearch = !searchTerm || 
            animal.nombre.toLowerCase().includes(searchTerm) ||
            animal.raza.toLowerCase().includes(searchTerm) ||
            (animal.descripcion && animal.descripcion.toLowerCase().includes(searchTerm));
        
        // Filtro de estado
        const matchEstado = !estadoFilter || animal.estado === estadoFilter;
        
        return matchSearch && matchEstado;
    });
    
    // Ordenar
    animalesFiltrados.sort((a, b) => {
        switch (sortBy) {
            case 'fecha_desc':
                return new Date(b.fecha_registro) - new Date(a.fecha_registro);
            case 'fecha_asc':
                return new Date(a.fecha_registro) - new Date(b.fecha_registro);
            case 'nombre_asc':
                return a.nombre.localeCompare(b.nombre);
            case 'nombre_desc':
                return b.nombre.localeCompare(a.nombre);
            default:
                return 0;
        }
    });
    
    // Actualizar contador
    document.getElementById('totalAnimales').textContent = animalesFiltrados.length;
    
    // Renderizar
    renderizarAnimales();
}

/**
 * Resetear filtros
 */
function resetearFiltros() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterEstado').value = '';
    document.getElementById('sortBy').value = 'fecha_desc';
    aplicarFiltros();
}

// ==============================================
// RENDERIZADO
// ==============================================

/**
 * Renderizar animales según la vista actual
 */
function renderizarAnimales() {
    const container = document.getElementById('animalesContainer');
    console.log('🐾 renderizarAnimales() ejecutada | filtrados:', animalesFiltrados.length);

    if (animalesFiltrados.length === 0) {
        console.warn('⚠️ showEmptyState ejecutado');
        showEmptyState(container, 'No se encontraron animales con los filtros aplicados');
        return;
    }

    if (vistaActual === 'grid') {
        console.log('📦 renderizarGrid()');
        renderizarGrid(container);
    } else {
        console.log('📋 renderizarLista()');
        renderizarLista(container);
    }

    // ✅ después de renderizar, verifica si algo borra el container
    setTimeout(() => {
        console.log('⏱️ 1 segundo después:', container.innerHTML.length, 'caracteres');
    }, 1000);
}

/**
 * Renderizar vista en grid (tarjetas)
 */
function renderizarGrid(container) {
    container.className = 'row row-cols-1 row-cols-lg-4 row-cols-md-3 row-cols-sm-2';
    
    container.innerHTML = animalesFiltrados.map(animal => {
        const canEditOrDelete = animal.estado !== 'en_proceso' && animal.estado !== 'adoptado';
        
        return `
            <div class="col mb-30px">
                <div class="card border-0 border-radius-8px box-shadow-large h-100 overflow-hidden card-hover">
                    <div class="position-relative overflow-hidden" style="height: 250px;">
                        <img src="${getImageUrl(animal.foto_url)}" 
                             class="card-img-top h-100 w-100" 
                             style="object-fit: cover;"
                             alt="${animal.nombre}"
                             onerror="this.src='https://placehold.co/100x100?text=Sin+Foto'">

                        <div class="position-absolute top-0 end-0 m-15px">
                            ${getEstadoBadge(animal.estado)}
                        </div>
                    </div>
                    
                    <div class="card-body p-25px">
                        <h5 class="card-title fw-700 text-dark-gray mb-10px">${animal.nombre}</h5>
                        <p class="text-muted mb-5px"><i class="bi bi-tag me-5px"></i>${animal.raza}</p>
                        <p class="text-muted mb-5px"><i class="bi bi-calendar me-5px"></i>${animal.edad} años</p>
                        <p class="text-muted mb-15px"><i class="bi bi-speedometer me-5px"></i>${animal.peso} kg</p>
                        
                        ${animal.descripcion ? `<p class="small text-muted mb-15px">${truncateText(animal.descripcion, 80)}</p>` : ''}
                        
                        <div class="d-flex gap-2">
                            <button onclick="verDetalle(${animal.id})" class="btn btn-small btn-base-color btn-rounded flex-fill">
                                <i class="bi bi-eye"></i>
                            </button>
                            ${canEditOrDelete ? `
                                <button onclick="editarAnimal(${animal.id})" class="btn btn-small btn-dark-gray btn-rounded flex-fill" title="Editar">
                                    <i class="bi bi-pencil"></i> 
                                </button>
                                <button onclick="confirmarEliminar(${animal.id}, '${animal.nombre}')" class="btn btn-small btn-outline-danger btn-rounded" title="Eliminar">
                                    <i class="bi bi-trash"></i>
                                </button>
                            ` : `
                                <button class="btn btn-small btn-dark-gray btn-rounded flex-fill disabled" disabled title="No editable en estado '${animal.estado}'">
                                    <i class="bi bi-pencil"></i> 
                                </button>
                                <button class="btn btn-small btn-outline-danger btn-rounded disabled" disabled title="No eliminable en estado '${animal.estado}'">
                                    <i class="bi bi-trash"></i>
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Renderizar vista en lista
 */
function renderizarLista(container) {
    container.className = 'row';
    
    container.innerHTML = `
        <div class="col-12">
            <div class="bg-white border-radius-8px box-shadow-large overflow-hidden">
                <table class="table table-hover mb-0">
                    <thead class="bg-very-light-gray">
                        <tr>
                            <th width="80">Foto</th>
                            <th>Nombre</th>
                            <th>Raza</th>
                            <th>Edad</th>
                            <th>Peso</th>
                            <th>Estado</th>
                            <th width="150">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${animalesFiltrados.map(animal => {
                            const canEditOrDelete = animal.estado !== 'en_proceso' && animal.estado !== 'adoptado';
                            
                            return `
                            <tr>
                                <td>
                                    <img src="${getImageUrl(animal.foto_url)}" 
                                         class="border-radius-6px" 
                                         style="width: 60px; height: 60px; object-fit: cover;"
                                         alt="${animal.nombre}"
                                         onerror="this.src='https://placehold.co/100x100?text=Sin+Foto'">
                                </td>
                                <td class="align-middle fw-600">${animal.nombre}</td>
                                <td class="align-middle">${animal.raza}</td>
                                <td class="align-middle">${animal.edad} años</td>
                                <td class="align-middle">${animal.peso} kg</td>
                                <td class="align-middle">${getEstadoBadge(animal.estado)}</td>
                                <td class="align-middle">
                                    <div class="d-flex gap-1">
                                        <button onclick="verDetalle(${animal.id})" 
                                                class="btn btn-extra-small btn-base-color btn-rounded"
                                                title="Ver detalle">
                                            <i class="bi bi-eye"></i>
                                        </button>
                                        ${canEditOrDelete ? `
                                            <button onclick="editarAnimal(${animal.id})" 
                                                    class="btn btn-extra-small btn-dark-gray btn-rounded"
                                                    title="Editar">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button onclick="confirmarEliminar(${animal.id}, '${animal.nombre}')" 
                                                    class="btn btn-extra-small btn-outline-danger btn-rounded"
                                                    title="Eliminar">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        ` : `
                                            <button class="btn btn-extra-small btn-dark-gray btn-rounded disabled" disabled title="No editable">
                                                <i class="bi bi-pencil"></i>
                                            </button>
                                            <button class="btn btn-extra-small btn-outline-danger btn-rounded disabled" disabled title="No eliminable">
                                                <i class="bi bi-trash"></i>
                                            </button>
                                        `}
                                    </div>
                                </td>
                            </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ==============================================
// UTILIDAD: Obtener URL correcta de imagen
// ==============================================
function getImageUrl(fotoUrl) {
    if (!fotoUrl) {
        // Si no hay foto, usar placeholder remoto
        return 'https://placehold.co/100x100?text=Sin+Foto';
    }

    // Normalizar barras invertidas de Windows
    const cleanPath = fotoUrl.replace(/\\/g, '/');

    // Si la ruta ya viene completa (por ejemplo con http), la devolvemos tal cual
    if (cleanPath.startsWith('http')) {
        return cleanPath;
    }

    // Si empieza con "/uploads", lo servimos desde tu backend (puerto 3000)
    if (cleanPath.startsWith('/uploads')) {
        return `http://localhost:3000${cleanPath}`;
    }

    // Si empieza con "uploads", también lo servimos desde backend
    if (cleanPath.startsWith('uploads')) {
        return `http://localhost:3000/${cleanPath}`;
    }

    // Cualquier otro caso (fallback)
    return 'https://placehold.co/100x100?text=Sin+Foto';
}



// ==============================================
// CAMBIO DE VISTA
// ==============================================

/**
 * Cambiar entre vista grid y lista
 * @param {string} vista - 'grid' o 'list'
 */
function cambiarVista(vista) {
    vistaActual = vista;
    
    // Actualizar botones
    document.getElementById('viewGrid').classList.toggle('active', vista === 'grid');
    document.getElementById('viewList').classList.toggle('active', vista === 'list');
    
    // Re-renderizar
    renderizarAnimales();
}

// ==============================================
// ACCIONES
// ==============================================

/**
 * Ver detalle del animal en modal
 * @param {number} id - ID del animal
 */
async function verDetalle(id) {
    const modal = new bootstrap.Modal(document.getElementById('modalDetalleAnimal'));
    const modalBody = document.getElementById('modalAnimalBody');
    const modalTitle = document.getElementById('modalAnimalNombre');
    
    try {
        // Mostrar loading
        modalBody.innerHTML = '<div class="text-center p-5"><div class="spinner-border" role="status"></div></div>';
        modal.show();
        
        // Fetch detalles
        const data = await fetchAPI(`/api/animales/${id}`);
        
        if (data.success) {
            const animal = data.data;
            modalTitle.textContent = animal.nombre;
            
            // LÓGICA DE HABILITACIÓN/DESHABILITACIÓN
            const canEditOrDelete = animal.estado !== 'en_proceso' && animal.estado !== 'adoptado';
            
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-5 mb-3 mb-md-0">
                        <img src="${getImageUrl(animal.foto_url)}" 
                              class="w-100 border-radius-8px" 
                              alt="${animal.nombre}"
                              onerror="this.src='https://placehold.co/100x100?text=Sin+Foto'">
                        <div class="mt-3 text-center">
                            ${getEstadoBadge(animal.estado)}
                        </div>
                    </div>
                    <div class="col-md-7">
                        <h5 class="fw-700 text-dark-gray mb-3">Información General</h5>
                        
                        <div class="mb-3">
                            <label class="fw-600 text-dark-gray d-block mb-5px">Nombre:</label>
                            <p class="mb-0">${animal.nombre}</p>
                        </div>
                        
                        <div class="row mb-3">
                            <div class="col-6">
                                <label class="fw-600 text-dark-gray d-block mb-5px">Raza:</label>
                                <p class="mb-0">${animal.raza}</p>
                            </div>
                            <div class="col-6">
                                <label class="fw-600 text-dark-gray d-block mb-5px">Edad:</label>
                                <p class="mb-0">${animal.edad} años</p>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label class="fw-600 text-dark-gray d-block mb-5px">Peso:</label>
                            <p class="mb-0">${animal.peso} kg</p>
                        </div>
                        
                        ${animal.descripcion ? `
                            <div class="mb-3">
                                <label class="fw-600 text-dark-gray d-block mb-5px">Descripción:</label>
                                <p class="mb-0">${animal.descripcion}</p>
                            </div>
                        ` : ''}
                        
                        ${animal.responsable_nombre ? `
                            <div class="mb-3">
                                <label class="fw-600 text-dark-gray d-block mb-5px">Responsable:</label>
                                <p class="mb-0">${animal.responsable_nombre} ${animal.responsable_apellido || ''}</p>
                            </div>
                        ` : ''}
                        
                        <div class="mb-3">
                            <label class="fw-600 text-dark-gray d-block mb-5px">Registrado:</label>
                            <p class="mb-0">${formatDate(animal.fecha_registro, true)}</p>
                        </div>
                        
                        <div class="d-flex gap-2 mt-4">
                            ${canEditOrDelete ? `
                                <button onclick="editarAnimal(${animal.id}); bootstrap.Modal.getInstance(document.getElementById('modalDetalleAnimal')).hide();" 
                                        class="btn btn-medium btn-dark-gray btn-rounded flex-fill" title="Editar">
                                    <i class="bi bi-pencil me-5px"></i>Editar
                                </button>
                                <button onclick="confirmarEliminar(${animal.id}, '${animal.nombre}'); bootstrap.Modal.getInstance(document.getElementById('modalDetalleAnimal')).hide();" 
                                        class="btn btn-medium btn-outline-danger btn-rounded flex-fill" title="Eliminar">
                                    <i class="bi bi-trash me-5px"></i>Eliminar
                                </button>
                            ` : `
                                <button class="btn btn-medium btn-dark-gray btn-rounded flex-fill disabled" disabled title="No editable en estado '${animal.estado}'">
                                    <i class="bi bi-pencil me-5px"></i>Editar
                                </button>
                                <button class="btn btn-medium btn-outline-danger btn-rounded flex-fill disabled" disabled title="No eliminable en estado '${animal.estado}'">
                                    <i class="bi bi-trash me-5px"></i>Eliminar
                                </button>
                            `}
                        </div>
                    </div>
                </div>
            `;
            
        } else {
             throw new Error(data.message || 'No se pudieron obtener los detalles del animal.');
        }
        
    } catch (error) {
        modalBody.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle me-2"></i>
                Error al cargar los detalles del animal: ${error.message}
            </div>
        `;
    }
}

/**
 * Navegar a editar animal
 * @param {number} id - ID del animal
 */
function editarAnimal(id) {
    window.location.href = `editar.html?id=${id}`;
}

/**
 * Confirmar y eliminar animal
 * @param {number} id - ID del animal
 * @param {string} nombre - Nombre del animal
 */
function confirmarEliminar(id, nombre) {
    showConfirm(
        `¿Estás seguro de eliminar a <strong>${nombre}</strong>? Esta acción no se puede deshacer.`,
        async () => {
            await eliminarAnimal(id);
        }
    );
}

/**
 * Eliminar animal
 * @param {number} id - ID del animal
 */
async function eliminarAnimal(id) {
    try {
        const data = await fetchAPI(`/api/animales/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showAlert('Animal eliminado correctamente', 'success');
            
            // Recargar lista
            await cargarAnimales();
        } else {
            throw new Error(data.message || 'Error al eliminar');
        }
        
    } catch (error) {
        showAlert(error.message, 'error');
    }
}
// ==============================================
// GESTIÓN DE MODAL DE CAMBIO DE ESTADO (NUEVO)
// ==============================================

/**
 * Muestra el modal para cambiar el estado de un animal 'en_proceso'.
 * @param {string} animalId - ID del animal
 * @param {string} nombre - Nombre del animal
 */
function mostrarModalCambioEstado(animalId, nombre) {
    const modal = new bootstrap.Modal(document.getElementById('modalCambioEstado'));
    
    document.getElementById('estadoAnimalId').value = animalId;
    
    // Actualiza el nombre en el modal
    const nombreElement = document.getElementById('estadoAnimalNombre');
    if (nombreElement) {
        nombreElement.textContent = nombre;
    }

    // Reinicia el select a 'disponible' por defecto 
    document.getElementById('nuevoEstadoSelect').value = 'disponible';
    
    modal.show();
}


/**
 * Ejecuta la llamada a la API para cambiar el estado.
 */
async function confirmarCambioEstado() {
    const animalId = document.getElementById('estadoAnimalId').value;
    const nuevoEstado = document.getElementById('nuevoEstadoSelect').value;

    const modal = bootstrap.Modal.getInstance(document.getElementById('modalCambioEstado'));
    
    const datos = {
        estado: nuevoEstado 
    };

    try {
        const data = await fetchAPI(`/api/animales/${animalId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        if (!data.success) {
            throw new Error(data.message || 'Error al cambiar el estado.');
        }

        modal.hide();
        showAlert(`Estado de animal ID ${animalId} cambiado a ${nuevoEstado} exitosamente.`, 'success');
        
        // Recargar la lista para que se actualicen los botones y badges
        await cargarAnimales(); 
        
    } catch (error) {
        modal.hide();
        console.error('Error al cambiar el estado:', error);
        showAlert(`Fallo al cambiar el estado: ${error.message}`, 'error');
    }
}