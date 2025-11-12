/**
 * GESTIÓN DE RESPONSABLES
 */

let todosLosResponsables = [];
let responsablesFiltrados = [];
let modoEdicion = false;
let responsableEditando = null;



/**
 * Inicializar event listeners
 */
function initEventListeners() {
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', debounce(aplicarFiltros, 300));
    
    // Formulario
    document.getElementById('formResponsable').addEventListener('submit', handleSubmit);
    
    // Reset modal al cerrar
    document.getElementById('modalResponsable').addEventListener('hidden.bs.modal', resetModal);
}


// ==============================================
// CARGAR RESPONSABLES
// ==============================================
async function cargarResponsables() {
    const tbody = document.querySelector('#tablaResponsables tbody');

    if (!tbody) {
        console.error('⚠️ No se encontró el elemento #tablaResponsables tbody en el DOM.');
        return;
    }

    try {
        showLoading(tbody, 'Cargando responsables...');
        const data = await fetchAPI('/api/responsables');

        if (data.success) {
            todosLosResponsables = data.data;
            responsablesFiltrados = [...todosLosResponsables];
            renderizarTabla();
            document.getElementById('totalResponsables').textContent = todosLosResponsables.length;

            if (todosLosResponsables.length > 0) {
                showAlert(`${todosLosResponsables.length} responsables cargados`, 'success', 2000);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center p-5">
                        <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                        <p class="mb-0">Error al cargar responsables</p>
                    </td>
                </tr>
            `;
        }
    }
}

// ✅ Hazla visible globalmente
window.cargarResponsables = cargarResponsables;


// ==============================================
// CARGAR RESPONSABLES
// ==============================================

/**
 * Cargar todos los responsables
 */
function renderizarTabla() {
    const tbody = document.querySelector('#tablaResponsables tbody');
    if (!tbody) {
        console.error('⚠️ No se encontró el tbody de la tabla #tablaResponsables');
        return;
    }

    let html = '';

    if (responsablesFiltrados.length === 0) {
        html = `
            <tr>
                <td colspan="7" class="text-center p-5">
                    <i class="bi bi-info-circle fs-1 text-muted mb-3"></i>
                    <p class="mb-0">No hay responsables registrados</p>
                </td>
            </tr>`;
    } else {
        html = responsablesFiltrados.map(r => `
            <tr>
                <td>${r.nombre}</td>
                <td>${r.apellido}</td>
                <td>${r.telefono || '-'}</td>
                <td>${r.email || '-'}</td>
                <td>${r.animales_count || 0}</td>
                <td>${new Date(r.createdAt).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="verDetalle(${r.id})">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning me-1" onclick="editarResponsable(${r.id})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarResponsable(${r.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    tbody.innerHTML = html;
}

// ==============================================
// FILTROS
// ==============================================

/**
 * Aplicar filtros de búsqueda
 */
function aplicarFiltros() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    responsablesFiltrados = todosLosResponsables.filter(resp => {
        return !searchTerm || 
            resp.nombre.toLowerCase().includes(searchTerm) ||
            resp.apellido.toLowerCase().includes(searchTerm) ||
            (resp.telefono && resp.telefono.includes(searchTerm)) ||
            (resp.email && resp.email.toLowerCase().includes(searchTerm));
    });
    
    renderizarTabla();
}

// ==============================================
// RENDERIZADO
// ==============================================

/**
 * Renderizar tabla de responsables
 */
function renderizarTabla() {
    const tbody = document.querySelector('#tablaResponsables tbody');
    console.log('🔎 Buscando tbody en renderizarTabla...');
    console.log('tbody encontrado:', tbody);

    if (!tbody) {
        console.error('⚠️ No se encontró el tbody de la tabla #tablaResponsables');
        console.log('HTML actual:', document.body.innerHTML);
        return;
    }
    
    if (responsablesFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <p class="mb-0">No se encontraron responsables</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = responsablesFiltrados.map(resp => `
        <tr>
            <td class="align-middle fw-600">${resp.nombre}</td>
            <td class="align-middle">${resp.apellido}</td>
            <td class="align-middle">${resp.telefono || '<span class="text-muted">-</span>'}</td>
            <td class="align-middle">${resp.email || '<span class="text-muted">-</span>'}</td>
            <td class="align-middle">
                <button onclick="verAnimales(${resp.id})" class="btn btn-extra-small btn-outline-primary btn-rounded">
                    Ver animales
                </button>
            </td>
            <td class="align-middle text-muted small">${formatDate(resp.fecha_registro)}</td>
            <td class="align-middle">
                <div class="d-flex gap-1">
                    <button onclick="verDetalle(${resp.id})" 
                            class="btn btn-extra-small btn-base-color btn-rounded"
                            title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button onclick="editarResponsable(${resp.id})" 
                            class="btn btn-extra-small btn-dark-gray btn-rounded"
                            title="Editar">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button onclick="confirmarEliminar(${resp.id}, '${resp.nombre} ${resp.apellido}')" 
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
 * Abrir modal para nuevo responsable
 */
function nuevoResponsable() {
    modoEdicion = false;
    responsableEditando = null;
    document.getElementById('modalTitle').textContent = 'Nuevo Responsable';
    
    const modal = new bootstrap.Modal(document.getElementById('modalResponsable'));
    modal.show();
}

/**
 * Editar responsable
 */
async function editarResponsable(id) {
    try {
        const data = await fetchAPI(`/api/responsables/${id}`);
        
        if (data.success) {
            modoEdicion = true;
            responsableEditando = data.data;
            
            document.getElementById('modalTitle').textContent = 'Editar Responsable';
            document.getElementById('responsableId').value = responsableEditando.id;
            document.getElementById('nombre').value = responsableEditando.nombre;
            document.getElementById('apellido').value = responsableEditando.apellido;
            document.getElementById('telefono').value = responsableEditando.telefono || '';
            document.getElementById('email').value = responsableEditando.email || '';
            
            const modal = new bootstrap.Modal(document.getElementById('modalResponsable'));
            modal.show();
        }
        
    } catch (error) {
        showAlert('Error al cargar responsable', 'error');
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
            data = await fetchAPI(`/api/responsables/${responsableEditando.id}`, {
                method: 'PUT',
                body: JSON.stringify(datos)
            });
        } else {
            // Crear
            data = await fetchAPI('/api/responsables', {
                method: 'POST',
                body: JSON.stringify(datos)
            });
        }
        
        if (data.success) {
            showAlert(
                modoEdicion ? 'Responsable actualizado correctamente' : 'Responsable registrado correctamente',
                'success'
            );
            
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('modalResponsable')).hide();
            
            // Recargar tabla
            await cargarResponsables();
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
            await eliminarResponsable(id);
        }
    );
}

/**
 * Eliminar responsable
 */
async function eliminarResponsable(id) {
    try {
        const data = await fetchAPI(`/api/responsables/${id}`, {
            method: 'DELETE'
        });
        
        if (data.success) {
            showAlert('Responsable eliminado correctamente', 'success');
            await cargarResponsables();
        }
        
    } catch (error) {
        showAlert(error.message, 'error');
    }
}

// ==============================================
// DETALLE
// ==============================================

/**
 * Ver detalle del responsable
 */
async function verDetalle(id) {
    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    const modalBody = document.getElementById('detalleBody');
    const modalTitle = document.getElementById('detalleNombre');
    
    try {
        modalBody.innerHTML = '<div class="text-center p-5"><div class="spinner-border" role="status"></div></div>';
        modal.show();
        
        const data = await fetchAPI(`/api/responsables/${id}`);
        
        if (data.success) {
            const resp = data.data;
            modalTitle.textContent = `${resp.nombre} ${resp.apellido}`;
            
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Nombre:</label>
                        <p class="mb-0">${resp.nombre}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Apellido:</label>
                        <p class="mb-0">${resp.apellido}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Teléfono:</label>
                        <p class="mb-0">${resp.telefono || '<span class="text-muted">No registrado</span>'}</p>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Email:</label>
                        <p class="mb-0">${resp.email || '<span class="text-muted">No registrado</span>'}</p>
                    </div>
                    <div class="col-12 mb-3">
                        <label class="fw-600 text-dark-gray d-block mb-5px">Registrado:</label>
                        <p class="mb-0">${formatDate(resp.fecha_registro, true)}</p>
                    </div>
                    ${resp.animales && resp.animales.length > 0 ? `
                        <div class="col-12">
                            <label class="fw-600 text-dark-gray d-block mb-10px">Animales registrados (${resp.animales.length}):</label>
                            <div class="list-group">
                                ${resp.animales.map(animal => `
                                    <div class="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            <strong>${animal.nombre}</strong> - ${animal.raza}
                                            ${getEstadoBadge(animal.estado)}
                                        </div>
                                        <small class="text-muted">${formatDate(animal.fecha_registro)}</small>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : '<div class="col-12"><p class="text-muted text-center">No ha registrado animales</p></div>'}
                </div>
                <div class="d-flex gap-2 mt-4">
                    <button onclick="editarResponsable(${resp.id}); bootstrap.Modal.getInstance(document.getElementById('modalDetalle')).hide();" 
                            class="btn btn-medium btn-dark-gray btn-rounded flex-fill">
                        <i class="bi bi-pencil me-5px"></i>Editar
                    </button>
                    <button onclick="confirmarEliminar(${resp.id}, '${resp.nombre} ${resp.apellido}'); bootstrap.Modal.getInstance(document.getElementById('modalDetalle')).hide();" 
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
 * Ver animales del responsable
 */
function verAnimales(id) {
    verDetalle(id);
}

// ==============================================
// UTILIDADES
// ==============================================

/**
 * Reset modal
 */
function resetModal() {
    const form = document.getElementById('formResponsable');
    resetForm(form);
    modoEdicion = false;
    responsableEditando = null;
    document.getElementById('responsableId').value = '';
}

// ==============================================
// INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Módulo de responsables cargado');
    esperarTablaYcargar();
    initEventListeners();
});

function esperarTablaYcargar() {
    const tbody = document.querySelector('#tablaResponsables tbody');
    if (tbody) {
        console.log('✅ Tabla encontrada, cargando responsables...');
        cargarResponsables();
        return;
    }

    console.log('⌛ Esperando a que se cargue la tabla...');
    setTimeout(esperarTablaYcargar, 200);
}


// Exponer funciones al ámbito global (window)
window.cargarResponsables = cargarResponsables;
window.initEventListeners = initEventListeners;

window.addEventListener("load", () => {
  window.cargarResponsables = cargarResponsables;
  window.initEventListeners = initEventListeners;
  console.log("🌍 Funciones expuestas al window");
});

