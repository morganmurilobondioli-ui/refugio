/**
 * GESTIÓN DE ADOPCIONES (versión unificada y optimizada)
 */

let todasLasAdopciones = [];
let adopcionesFiltradas = [];
let animalesDisponibles = []; // Animales con estado 'disponible'
let todosLosDuenios = [];
let estadoFiltroActual = 'en_proceso'; // Se mantiene como filtro por defecto

// ==============================================
// INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Módulo de adopciones cargado');

    // --- Configuración de la fecha ---
    const fechaInput = document.getElementById('fecha_adopcion');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.max = hoy;
    
    // Opcional: Establecer fecha mínima (1 año atrás)
    const unAnioAtras = new Date();
    unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
    fechaInput.min = unAnioAtras.toISOString().split('T')[0];
    
    fechaInput.value = hoy; // Valor por defecto
    // ---------------------------------
    
    cargarAdopciones();
    cargarAnimalesDisponibles();
    cargarDuenios();
    initEventListeners();
    initFiltrosAdopciones();
});

/**
 * Inicializar event listeners para los filtros de estado
 */
function initFiltrosAdopciones() {
    document.querySelectorAll('.btn-filtro-adopcion').forEach(button => {
        button.addEventListener('click', function() {
            const estado = this.getAttribute('data-estado');
            aplicarFiltroEstado(estado);
        });
    });
}

/**
 * Inicializar event listeners
 */
function initEventListeners() {
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', debounce(aplicarFiltros, 300));
    
    // Formulario (Se asume que handleSubmit existe en otro script o está abajo)
    document.getElementById('formAdopcion').addEventListener('submit', handleSubmit); 
    
    // Preview
    document.getElementById('animal_id').addEventListener('change', mostrarPreviewAnimal);
    document.getElementById('duenio_id').addEventListener('change', mostrarPreviewDuenio);
    
    // Recargar listas
    document.getElementById('btnRecargarAnimales').addEventListener('click', cargarAnimalesDisponibles);
    document.getElementById('btnRecargarDuenios').addEventListener('click', cargarDuenios);
    
    // Reset modal al cerrar
    document.getElementById('modalAdopcion').addEventListener('hidden.bs.modal', resetModal);
}

// ==============================================
// CARGAR DATOS
// ==============================================

/**
 * Cargar todas las adopciones y aplica el filtro inicial
 */
async function cargarAdopciones() {
    const tbody = document.querySelector('#tablaAdopciones tbody');
    
    try {
        // showLoading(tbody, 'Cargando adopciones...'); 
        
        const data = await fetchAPI('/api/adopciones');
        
        if (data.success) {
            todasLasAdopciones = data.data;
            
            aplicarFiltroEstado(estadoFiltroActual); 
            
            actualizarEstadisticas();
        } else {
            // showEmptyState(tbody, data.message || 'Error al cargar las adopciones.');
        }
    } catch (error) {
        console.error('Error al cargar adopciones:', error);
        // showEmptyState(tbody, 'Error al cargar adopciones. Revise la conexión.', 'error');
    }
}
/**
 * Cargar animales disponibles
 */
async function cargarAnimalesDisponibles() {
    const select = document.getElementById('animal_id');
    const btn = document.getElementById('btnRecargarAnimales');
    
    try {
        // Se asume que setButtonLoading existe
        setButtonLoading(btn, true);
        
        // CORRECCIÓN: Usar la ruta general si /api/animales/disponibles da 404
        const data = await fetchAPI('/api/animales'); 
        
        if (data.success) {
            // Filtrar solo disponibles
            animalesDisponibles = data.data.filter(a => a.estado === 'disponible');
            
            select.innerHTML = '<option value="">-- Seleccionar animal --</option>' +
                animalesDisponibles.map(animal => 
                    `<option value="${animal.id}" data-animal='${JSON.stringify(animal)}'>
                        ${animal.nombre} - ${animal.raza} 
                    </option>`
                ).join('');
            
            if (animalesDisponibles.length === 0) {
                select.innerHTML = '<option value="" disabled>No hay animales disponibles</option>';
            }
        }
        
    } catch (error) {
        showAlert('Error al cargar animales disponibles', 'error');
    } finally {
        // Se asume que setButtonLoading existe
        setButtonLoading(btn, false, '<i class="bi bi-arrow-clockwise"></i>');
    }
}

/**
 * Cargar dueños
 */
async function cargarDuenios() {
    const select = document.getElementById('duenio_id');
    const btn = document.getElementById('btnRecargarDuenios');
    
    try {
        // Se asume que setButtonLoading existe
        setButtonLoading(btn, true);
        
        const data = await fetchAPI('/api/duenios');
        
        if (data.success) {
            todosLosDuenios = data.data;
            
            select.innerHTML = '<option value="">-- Seleccionar dueño --</option>' +
                todosLosDuenios.map(duenio => 
                    `<option value="${duenio.id}" data-duenio='${JSON.stringify(duenio)}'>
                        ${duenio.nombre} ${duenio.apellido}
                    </option>`
                ).join('');
            
            if (todosLosDuenios.length === 0) {
                select.innerHTML = '<option value="" disabled>No hay dueños registrados</option>';
            }
        }
        
    } catch (error) {
        showAlert('Error al cargar dueños', 'error');
    } finally {
        // Se asume que setButtonLoading existe
        setButtonLoading(btn, false, '<i class="bi bi-arrow-clockwise"></i>');
    }
}

// ==============================================
// FILTRADO
// ==============================================

/**
 * Filtra adopciones según el estado y actualiza la tabla y los botones.
 */
function aplicarFiltroEstado(nuevoEstado) {
    estadoFiltroActual = nuevoEstado;
    
    // ⚠️ CORRECCIÓN CRÍTICA: Mapear el estado de la pestaña al estado del animal en la BD
    let estadoBuscado = estadoFiltroActual;

    if (estadoFiltroActual === 'finalizadas') { 
        estadoBuscado = 'adoptado';            
    } else if (estadoFiltroActual === 'canceladas') {
        estadoBuscado = 'cancelada';
    }
    
    // 1. Filtrar los datos:
    if (estadoFiltroActual === 'todos') {
        adopcionesFiltradas = todasLasAdopciones;
    } else if (estadoFiltroActual === 'disponible') {
         // Crear un mock de adopción para la vista 'disponible' (se mantiene la lógica original)
         adopcionesFiltradas = animalesDisponibles.map((a) => ({
            id: a.id,
            animal_nombre: a.nombre,
            animal_raza: a.raza,
            animal_foto: a.foto_url,
            animal_estado: 'disponible', 
            duenio_nombre: "N/A", 
            duenio_apellido: "",
            duenio_telefono: "",
            fecha_adopcion: null, 
            fecha_registro: a.fecha_registro,
            compromiso_url: null,
        }));
    } else {
        // Filtrar por estado normal (en_proceso, adoptado, cancelada)
        // ESTA LÍNEA AHORA USA 'adoptado' si la pestaña es 'finalizadas'
        adopcionesFiltradas = todasLasAdopciones.filter(adopcion => adopcion.animal_estado === estadoBuscado);
    }
    
    // 2. Renderizar la tabla con los datos filtrados
    renderizarAdopciones();
    
    // 3. Actualizar la UI de los botones (pestañas)
    document.querySelectorAll('.btn-filtro-adopcion').forEach(button => {
        button.classList.remove('btn-primary', 'btn-light');
        button.classList.add(button.getAttribute('data-estado') === nuevoEstado ? 'btn-primary' : 'btn-light');
    });
}

/**
 * Aplicar filtros de búsqueda
 */
function aplicarFiltros() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    // Reaplicamos el filtro de estado para tener la base correcta
    aplicarFiltroEstado(estadoFiltroActual);

    // Luego aplicamos el filtro de búsqueda sobre los datos ya filtrados por estado
    adopcionesFiltradas = adopcionesFiltradas.filter(adopcion => {
        return !searchTerm || 
            adopcion.animal_nombre.toLowerCase().includes(searchTerm) ||
            (adopcion.duenio_nombre && adopcion.duenio_nombre.toLowerCase().includes(searchTerm)) ||
            (adopcion.duenio_apellido && adopcion.duenio_apellido.toLowerCase().includes(searchTerm));
    });
    
    renderizarAdopciones();
}

// ==============================================
// RENDERIZADO (CORRECCIÓN VISUAL CRÍTICA)
// ==============================================

/**
 * Helper para obtener la clase de badge según el estado
 */
function getEstadoBadge(estado) {
    switch (estado) {
        case 'adoptado':
            return 'bg-success';
        case 'cancelada':
            return 'bg-danger';
        case 'en_proceso':
            return 'bg-primary';
        case 'disponible':
            return 'bg-info';
        default:
            return 'bg-secondary';
    }
}

/**
 * Renderiza la tabla con los datos filtrados (adopcionesFiltradas)
 */
function renderizarAdopciones() {
    const tbody = document.querySelector('#tablaAdopciones tbody');

    if (!tbody) {
        console.error('No se encontró tbody al renderizar');
        return;
    }
    
    if (adopcionesFiltradas.length === 0) {
         tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-5 text-muted">
                    <i class="bi bi-inbox fs-1 mb-3"></i>
                    <p class="mb-0">No se encontraron registros en el estado 
                        <strong>${estadoFiltroActual.toUpperCase().replace('_', ' ')}</strong>.
                    </p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = adopcionesFiltradas.map(adopcion => {
        const esActiva = adopcion.animal_estado === 'en_proceso';
        const esDisponible = adopcion.animal_estado === 'disponible';
        const tienePDF = adopcion.compromiso_url;
        
        const nombreAnimal = (adopcion.animal_nombre || '').replace(/'/g, "\\'");
        const nombreDuenio = (adopcion.duenio_nombre || '').replace(/'/g, "\\'");


        return `
            <tr class="align-middle border-bottom">
                <td class="py-3">
                    <img src="${getImageUrl(adopcion.animal_foto)}"
                        alt="${adopcion.animal_nombre}"
                        onerror="this.src='https://placehold.co/100x100?text=Sin+Foto'"
                        class="rounded shadow-sm"
                        style="width: 60px; height: 60px; object-fit: cover;">
                </td>

                <td class="py-3">
                    <strong class="d-block text-dark">${adopcion.animal_nombre}</strong>
                    <small class="text-muted">${adopcion.animal_raza || 'Sin raza'}</small>
                </td>

                <td class="py-3">
                    <strong class="d-block text-dark">${adopcion.duenio_nombre || 'N/A'} ${adopcion.duenio_apellido || ''}</strong>
                    <small class="text-muted"><i class="bi bi-telephone"></i> ${adopcion.duenio_telefono || 'N/A'}</small>
                </td>

                <td class="py-3 fw-medium">${adopcion.fecha_adopcion ? formatDate(adopcion.fecha_adopcion) : 'N/A'}</td>

                <td class="py-3 text-muted small">${adopcion.fecha_registro ? formatDate(adopcion.fecha_registro, true) : 'Invalid Date'}</td>
                
                <td class="py-3">
                    ${tienePDF ? `
                        <button onclick="descargarCompromiso(${adopcion.id});"
                            class="btn btn-sm btn-success d-flex align-items-center gap-1 shadow-sm mb-1" title="Descargar Compromiso">
                            <i class="bi bi-file-earmark-pdf"></i> PDF
                        </button>
                    ` : esDisponible ? '' : '<span class="text-muted small">Sin PDF</span>'}
                </td>
                
                <td class="py-3">
                    ${esActiva ? `
                        <div class="d-flex flex-wrap gap-1">
                            <button onclick="confirmarFinalizar(${adopcion.id}, '${nombreAnimal}', '${nombreDuenio} ${adopcion.duenio_apellido}');"
                                class="btn btn-sm btn-success shadow-sm" title="Finalizar Adopción">
                                <i class="bi bi-check-circle"></i> Finalizar
                            </button>
                            <button onclick="confirmarEliminar(${adopcion.id}, '${nombreAnimal}')"
                                class="btn btn-sm btn-outline-danger shadow-sm" title="Cancelar Adopción">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="verDetalle(${adopcion.id});"
                                class="btn btn-sm btn-outline-primary shadow-sm" title="Ver Detalle">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    ` : esDisponible ? `
                        <span class="badge ${getEstadoBadge(adopcion.animal_estado)} px-3 py-2">
                           DISPONIBLE
                        </span>
                    ` : `
                         <div class="d-flex flex-wrap gap-1 align-items-center">
                            
                            ${adopcion.animal_estado === 'adoptado' ? `
                                <button onclick="devolverAnimal(${adopcion.id}, '${nombreAnimal}', '${nombreDuenio} ${adopcion.duenio_apellido}');"
                                    class="btn btn-sm btn-outline-danger shadow-sm" title="Devolver Animal">
                                    <i class="bi bi-arrow-return-left"></i> Devolver
                                </button>
                            ` : ''}

                            <span class="badge ${getEstadoBadge(adopcion.animal_estado)} px-3 py-2">
                                ${adopcion.animal_estado.toUpperCase().replace('_', ' ')}
                            </span>
                             <button onclick="verDetalle(${adopcion.id});"
                                class="btn btn-sm btn-outline-primary shadow-sm" title="Ver Detalle">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    `}
                </td>
            </tr>
        `;
    }).join('');
}


// ==============================================
// PREVIEW
// ==============================================

/**
 * Mostrar preview del animal seleccionado
 */
function mostrarPreviewAnimal() {
    const select = document.getElementById('animal_id');
    const preview = document.getElementById('animalPreview');
    
    if (!select.value) {
        preview.style.display = 'none';
        return;
    }
    
    const option = select.options[select.selectedIndex];
    const animal = JSON.parse(option.dataset.animal);
    
    // CORRECCIÓN: Si getImageUrl no está en este archivo, se asume que está en app.refugio.js
    document.getElementById('animalFoto').src = getImageUrl(animal.foto_url); 
    document.getElementById('animalNombre').textContent = animal.nombre;
    document.getElementById('animalRaza').textContent = animal.raza;
    document.getElementById('animalEdad').textContent = animal.edad;
    document.getElementById('animalPeso').textContent = animal.peso || 'N/A';
    
    preview.style.display = 'block';
}

/**
 * Mostrar preview del dueño seleccionado
 */
function mostrarPreviewDuenio() {
    const select = document.getElementById('duenio_id');
    const preview = document.getElementById('duenioPreview');
    
    if (!select.value) {
        preview.style.display = 'none';
        return;
    }
    
    const option = select.options[select.selectedIndex];
    const duenio = JSON.parse(option.dataset.duenio);
    
    document.getElementById('duenioNombre').textContent = `${duenio.nombre} ${duenio.apellido}`;
    document.getElementById('duenioTelefono').textContent = duenio.telefono || 'No registrado';
    document.getElementById('duenioEmail').textContent = duenio.email || 'No registrado';
    
    preview.style.display = 'block';
}

// ==============================================
// ESTADÍSTICAS
// ==============================================

/**
 * Actualizar estadísticas
 */
function actualizarEstadisticas() {
    const total = todasLasAdopciones.length;
    document.getElementById('totalAdopciones').textContent = total;
    
    // Adopciones de este mes
    const hoy = new Date();
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    const esteMes = todasLasAdopciones.filter(a => {
        const fecha = new Date(a.fecha_adopcion);
        return fecha >= primerDiaMes;
    }).length;
    document.getElementById('adopcionesEsteMes').textContent = esteMes;
    
    // Total de animales adoptados (Solo cuenta los con estado 'adoptado')
    const adoptados = todasLasAdopciones.filter(a => a.animal_estado === 'adoptado').length;
    document.getElementById('animalesAdoptados').textContent = adoptados;
}


// ==============================================
// CRUD Y ACCIONES
// ==============================================

// ==============================================
// CRUD (Manejo de Formulario)
// ==============================================
/**
 * Maneja el envío del formulario de nueva adopción.
 */
async function handleSubmit(event) {
    // Es VITAL agregar 'event' aquí
    event.preventDefault(); 
    
    const form = event.target;
    // ⚠️ Recoge los datos del formulario aquí
    const data = {
        animal_id: form.animal_id.value,
        duenio_id: form.duenio_id.value,
        fecha_adopcion: form.fecha_adopcion.value,
        // Agrega cualquier otro campo necesario
    };
    
    // Simple validación (Asegúrate de que los campos no estén vacíos)
    if (!data.animal_id || !data.duenio_id) {
         showAlert('Debe seleccionar un animal y un dueño.', 'warning');
         return;
    }

    try {
        const response = await fetchAPI('/api/adopciones', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data) 
        });

        if (response.success) {
            showAlert('Adopción registrada correctamente', 'success');
            
            // 🚨 Sincronización completa de las vistas
            await cargarAdopciones(); 
            await cargarAnimalesDisponibles(); 
            aplicarFiltroEstado('en_proceso');
            
            // Suponiendo que usas Bootstrap Modal, esto lo cerraría
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalAdopcion'));
            if (modal) modal.hide();
        } else {
            showAlert(response.message || 'Error al registrar adopción', 'error');
        }
    } catch (error) {
        console.error('Error al enviar formulario:', error);
        showAlert('Error de conexión al registrar adopción.', 'error');
    }
}
/**
 * Descarga el PDF de Compromiso de Adopción.
 */
function descargarCompromiso(adopcionId) {
    // Se asume que API_BASE y downloadPDF están definidos globalmente
    const url = `${API_BASE}/api/adopciones/${adopcionId}/descargar`;
    const filename = `Compromiso_Adopcion_${adopcionId}.pdf`;
    
    if (typeof downloadPDF === 'function') {
        downloadPDF(url, filename);
    } else {
        showAlert('Error: La función de descarga no está disponible.', 'error');
    }
}

/**
 * Ver detalle de adopción
 */
function verDetalle(id) {
    const adopcion = todasLasAdopciones.find(a => a.id === id);
    if (!adopcion) return showAlert('No se encontró la adopción', 'error');

    // Se asume que modalDetalle y sus elementos existen
    const modal = new bootstrap.Modal(document.getElementById('modalDetalle'));
    document.getElementById('detalleAnimalFoto').src = getImageUrl(adopcion.animal_foto);
    document.getElementById('detalleAnimalNombre').textContent = adopcion.animal_nombre;
    document.getElementById('detalleAnimalRaza').textContent = adopcion.animal_raza;
    document.getElementById('detalleDuenio').textContent = `${adopcion.duenio_nombre} ${adopcion.duenio_apellido}`;
    document.getElementById('detalleTelefono').textContent = adopcion.duenio_telefono || 'Sin teléfono';
    document.getElementById('detalleFecha').textContent = formatDate(adopcion.fecha_adopcion);
    modal.show();
}

/**
 * Confirmar eliminación (Cancelar)
 */
function confirmarEliminar(id, nombreAnimal) {
    // Se asume que Swal.fire está disponible (SweetAlert2)
    Swal.fire({
        title: '¿Cancelar adopción?',
        html: `Esto marcará al animal <strong>${nombreAnimal}</strong> como disponible nuevamente.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No',
        confirmButtonColor: '#dc3545',
    }).then(async (result) => {
        if (result.isConfirmed) {
            await eliminarAdopcion(id);
        }
    });
}

/**
 * Eliminar adopción (Cancelación)
 */
async function eliminarAdopcion(id) {
    try {
        const data = await fetchAPI(`/api/adopciones/${id}`, { method: 'DELETE' });

        if (data.success) {
            showAlert('Adopción cancelada correctamente', 'success');
            await cargarAdopciones();
            await cargarAnimalesDisponibles(); // El animal vuelve a estar disponible
        } else {
            showAlert(data.message || 'Error al eliminar adopción', 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('Error al cancelar adopción', 'error');
    }
}

/**
 * Finalizar adopción (Marcar como Adoptado)
 */
async function finalizarAdopcion(id) {
    try {
        const data = await fetchAPI(`/api/adopciones/${id}/finalizar`, { 
            method: 'PUT' 
        });

        if (data.success) {
            showAlert('Adopción finalizada correctamente', 'success');
            await cargarAdopciones();
        } else {
            showAlert(data.message || 'Error al finalizar adopción', 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('Error de conexión al finalizar adopción', 'error');
    }
}

/**
 * Confirmación para finalizar (CORRECCIÓN CRÍTICA del [object Object])
 */
function confirmarFinalizar(id, nombreAnimal, nombreDuenio) {
    // CORRECCIÓN: Usamos Swal.fire directamente con HTML para evitar el [object Object]
    // Se asume que 'showConfirm' era un wrapper custom que estaba fallando al recibir el objeto de evento o mensaje.
    
    const messageHTML = `¿Estás seguro de que quieres finalizar la adopción de <strong>${nombreAnimal}</strong> con <strong>${nombreDuenio}</strong>? El estado del animal pasará a "Adoptado"`;
    
    Swal.fire({
        title: 'Confirmar finalización',
        html: messageHTML,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, finalizar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#198754', // color verde de éxito
    }).then(async (result) => {
        if (result.isConfirmed) {
            await finalizarAdopcion(id);
        }
    });
}

/**
 * Resetear modal
 */
function resetModal() {
    const form = document.getElementById('formAdopcion');
    form.reset();

    document.getElementById('animalPreview').style.display = 'none';
    document.getElementById('duenioPreview').style.display = 'none';

    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
}

/**
 * Utilidades simples (Necesarias)
 */

// Esta función se necesita en initEventListeners
function debounce(fn, delay) {
    let timer;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

/**
 * ⚠️ NUEVA FUNCIÓN
 * Abre la confirmación para devolver un animal.
 * @param {number} id - ID de la adopción a revertir.
 * @param {string} animalNombre - Nombre del animal.
 * @param {string} duenioNombre - Nombre del dueño.
 */
function devolverAnimal(id, animalNombre, duenioNombre) {
    Swal.fire({
        title: '¿Devolver a ' + animalNombre + '?',
        html: `Esta acción marcará la adopción de <strong>${duenioNombre}</strong> como eliminada/cancelada y el animal volverá al estado <strong>DISPONIBLE</strong>.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, Devolver (Eliminar Adopción)',
        cancelButtonText: 'No, Cancelar',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            // 🚨 Llamar a la función que usa DELETE /api/adopciones/:id
            await eliminarAdopcion(id);
        }
    });
}

// ⚠️ Mantén esta función probada tal como me la enviaste:
// Ella se encargará de hacer el fetch DELETE.
async function eliminarAdopcion(id) {
    try {
        // Usa la ruta DELETE para eliminar la adopción (y liberar al animal en el backend)
        const data = await fetchAPI(`/api/adopciones/${id}`, { method: 'DELETE' }); 

        if (data.success) {
            showAlert('Adopción cancelada correctamente', 'success');
            await cargarAdopciones();
            await cargarAnimalesDisponibles();
        } else {
            showAlert(data.message || 'Error al eliminar adopción', 'error');
        }
    } catch (error) {
        console.error(error);
        showAlert('Error al cancelar adopción', 'error');
    }
}