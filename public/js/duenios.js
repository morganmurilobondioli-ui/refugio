/**
 * GESTIÓN DE DUEÑOS
 */

let todosLosDuenios = [];
let dueniosFiltrados = [];
let modoEdicion = false;
let duenioEditando = null;

// ==============================================
// INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Módulo de dueños cargado');
    cargarDuenios();
    initEventListeners();
});

/**
 * Inicializar event listeners
 */
function initEventListeners() {
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', debounce(aplicarFiltros, 300));
    
    // Formulario
    document.getElementById('formDuenio').addEventListener('submit', handleSubmit);
    
    // Reset modal al cerrar
    document.getElementById('modalDuenio').addEventListener('hidden.bs.modal', resetModal);
}

// ==============================================
// CARGAR DUEÑOS
// ==============================================

/**
 * Cargar todos los dueños
 */
async function cargarDuenios() {
    const tbody = document.querySelector('#tablaDuenios tbody');
    
    try {
        showLoading(tbody, 'Cargando dueños...');
        
        const data = await fetchAPI('/api/duenios');
        
        if (data.success) {
            todosLosDuenios = data.data;
            dueniosFiltrados = [...todosLosDuenios];
            
            renderizarTabla();
            document.getElementById('totalDuenios').textContent = todosLosDuenios.length;
            
            if (todosLosDuenios.length > 0) {
                showAlert(`${todosLosDuenios.length} dueños cargados`, 'success', 2000);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-5">
                    <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                    <p class="mb-0">Error al cargar dueños</p>
                </td>
            </tr>
        `;
    }
}

// ==============================================
// FILTROS
// ==============================================

/**
 * Aplicar filtros de búsqueda
 */
function aplicarFiltros() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    dueniosFiltrados = todosLosDuenios.filter(duenio => {
        return !searchTerm || 
            duenio.nombre.toLowerCase().includes(searchTerm) ||
            duenio.apellido.toLowerCase().includes(searchTerm) ||
            (duenio.telefono && duenio.telefono.includes(searchTerm)) ||
            (duenio.email && duenio.email.toLowerCase().includes(searchTerm));
    });
    
    renderizarTabla();
}

// ==============================================
// RENDERIZADO
// ==============================================

/**
 * Renderizar tabla de dueños
 */
function renderizarTabla() {
    const tbody = document.querySelector('#tablaDuenios tbody');
    
    if (dueniosFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <p class="mb-0">No se encontraron dueños</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = dueniosFiltrados.map(duenio => `
        <tr>
            <td class="align-middle fw-600">${duenio.nombre}</td>
            <td class="align-middle">${duenio.apellido}</td>
            <td class="align-middle">${duenio.telefono || '<span class="text-muted">-</span>'}</td>
            <td class="align-middle">${duenio.email || '<span class="text-muted">-</span>'}</td>
            <td class="align-middle">
                <button onclick="verAdopciones(${duenio.id})" class="btn btn-extra-small btn-outline-primary btn-rounded">
                    Ver adopciones
                </button>
            </td>
            <td class="align-middle text-muted small">${formatDate(duenio.fecha_registro)}</td>
            <td class="align-middle">
                <div class="d-flex gap-1">
                    <button onclick="verDetalle(${duenio.id})" 
                            class="btn btn-extra-small btn-base-color btn-rounded"
                            title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button onclick="editarDuenio(${duenio.id})" 
                            class="btn btn-extra-small btn-dark-gray btn-rounded"
                            title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="confirmarEliminar(${duenio.id}, '${duenio.nombre} ${duenio.apellido}')" 
                            class="btn btn-extra-small btn-outline-danger btn-rounded"
                            title="Eliminar">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ==============================================
// CRUD
// ==============================================

/**
 * Abrir modal para nuevo dueño
 */
function nuevoDuenio() {
    modoEdicion = false;
    duenioEditando = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Dueño';
    
    const modal = new bootstrap.Modal(document.getElementById('modalDuenio'));
    modal.show();
}

/**
 * Editar dueño
 */
async function editarDuenio(id) {
    try {
        const data = await fetchAPI(`/api/duenios/${id}`);
        
        if (data.success) {
            modoEdicion = true;
            duenioEditando = data.data;
            
            document.getElementById('modalTitle').textContent = 'Editar Dueño';
            document.getElementById('duenioId').value = duenioEditando.id;
            document.getElementById('nombre').value = duenioEditando.nombre;
            document.getElementById('apellido').value = duenioEditando.apellido;
            document.getElementById('telefono').value = duenioEditando.telefono || '';
            document.getElementById('email').value = duenioEditando.email || '';
            
            const modal = new bootstrap.Modal(document.getElementById('modalDuenio'));
            modal.show();
        }
        
    } catch (error) {
        showAlert('Error al cargar dueño', 'error');
    }
}

/**
 * Manejar submit del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const btnGuardar = document.getElementById('btnGuardar');
    
    // Limpiar errores
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Obtener datos
    const nombre = document.getElementById('nombre').value.trim();
    const apellido = document.getElementById('apellido').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Validaciones
    if (!nombre || !apellido) {
        showAlert('Nombre y apellido son obligatorios', 'warning');
        if (!nombre) showFieldError(document.getElementById('nombre'), 'El nombre es obligatorio');
        if (!apellido) showFieldError(document.getElementById('apellido'), 'El apellido es obligatorio');
        return;
    }
    
    // Validar email si existe
    if (email && !isValidEmail(email)) {
        showFieldError(document.getElementById('email'), 'Email inválido');
        showAlert('Por favor ingresa un email válido', 'warning');
        return;
    }
    
    try {
        setButtonLoading(btnGuardar, true, 'Guardando...');
        
        const datos = { nombre, apellido, telefono, email };
        
        let data;
        if (modoEdicion) {
            // Actualizar
            data = await fetchAPI(`/api/duenios/${duenioEditando.id}`, {
                method: 'PUT',
                body: JSON.stringify(datos)
            });
        } else {
            // Crear
            data = await fetchAPI('/api/duenios', {
                method: 'POST',
                body: JSON.stringify(datos)
            });
        }
        
        if (data.success) {
            showAlert(
                modoEdicion ? 'Dueño actualizado correctamente' : 'Dueño registrado correctamente',
                'success'
            );
            
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('modalDuenio')).hide();
            
            // Recargar tabla
            await cargarDuenios();
        }
        
    } catch (error) {
        showAlert(error.message, 'error');
    } finally {
        setButtonLoading(btnGuardar, false, '<i class="bi bi-save me-5px"></i>Guardar');
    }
}

/**
 * Confirmar eliminación
 */
function confirmarEliminar(id, nombre) {
    showConfirm(
        `¿Estás seguro de eliminar a <strong>${nombre}</strong>?<br>Esta acción no se puede deshacer.`,
        async () => {
            await eliminarDuenio(id);
        }
    );
}

/**
 * Eliminar dueño
 */
async function eliminarDuenio(id) {
    try {
        const data = await fetchAPI(`/api/duenios/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showAlert('Dueño eliminado correctamente', 'success');
            await cargarDuenios();
        }
        
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// ==============================================
// DETALLE
// ==============================================

/**
 * Ver detalle del dueño
 */
async function verDetalle(id) {
    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    const modalBody = document.getElementById('detalleBody');
    const modalTitle = document.getElementById('detalleNombre');
    
    try {
        modalBody.innerHTML = '<div class="text-center p-5"><div class="spinner-border" role="status"></div></div>';
        modal.show();
        
        const data = await fetchAPI(`/api/duenios/${id}`);
        
        if (data.success) {
            const duenio = data.data;
            modalTitle.textContent = `${duenio.nombre} ${duenio.apellido}`;
            
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Nombre:</label>
                        <p class="mb-0">${duenio.nombre}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Apellido:</label>
                        <p class="mb-0">${duenio.apellido}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Teléfono:</label>
                        <p class="mb-0">${duenio.telefono || '<span class="text-muted">No registrado</span>'}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Email:</label>
                        <p class="mb-0">${duenio.email || '<span class="text-muted">No registrado</span>'}</p>
                    </div>
                    <div class="col-12 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Registrado:</label>
                        <p class="mb-0">${formatDate(duenio.fecha_registro, true)}</p>
                    </div>
                    ${duenio.adopciones && duenio.adopciones.length > 0 ? `
                        <div class="col-12">
                            <label class="fw-600 text-dark-gray d-block mb-10px">Adopciones realizadas (${duenio.adopciones.length}):</label>
                            <div class="list-group">
                                ${duenio.adopciones.map(adopcion => `
                                    <div class="list-group-item">
                                        <div class="d-flex align-items-center mb-2">
                                            <img src="${getImageUrl(adopcion.foto_url)}" 
                                                 class="border-radius-6px me-3" 
                                                 style="width: 60px; height: 60px; object-fit: cover;"
                                                 alt="${adopcion.nombre}">
                                            <div class="flex-fill">
                                                <strong>${adopcion.nombre}</strong> - ${adopcion.raza}
                                                <br>
                                                <small class="text-muted">Adoptado el ${formatDate(adopcion.fecha_adopcion)}</small>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '<div class="col-12"><p class="text-muted text-center">No ha realizado adopciones</p></div>'}
                </div>
                <div class="d-flex gap-2 mt-4">
                    <button onclick="editarDuenio(${duenio.id}); bootstrap.Modal.getInstance(document.getElementById('modalDetalle')).hide();" 
                            class="btn btn-medium btn-dark-gray btn-rounded flex-fill">
                        <i class="bi bi-pencil me-5px"></i>Editar
                    </button>
                    <button onclick="confirmarEliminar(${duenio.id}, '${duenio.nombre} ${duenio.apellido}'); bootstrap.Modal.getInstance(document.getElementById('modalDetalle')).hide();" 
                            class="btn btn-medium btn-outline-danger btn-rounded flex-fill">
                        <i class="bi bi-trash me-5px"></i>Eliminar
                    </button>
                </div>
            `;
        }
        
    } catch (error) {
        modalBody.innerHTML = '<div class="alert alert-danger">Error al cargar los detalles</div>';
    }
}

/**
 * Ver adopciones del dueño
 */
function verAdopciones(id) {
    verDetalle(id);
}

// ==============================================
// UTILIDADES
// ==============================================

/**
 * Reset modal
 */
function resetModal() {
    const form = document.getElementById('formDuenio');
    resetForm(form);
    modoEdicion = false;
    duenioEditando = null;
    document.getElementById('duenioId').value = '';
}