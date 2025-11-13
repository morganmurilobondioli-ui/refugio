/**
 * GESTIÓN DE ADOPCIONES
 */

let todasLasAdopciones = [];
let adopcionesFiltradas = [];
let animalesDisponibles = [];
let todosLosDuenios = [];

// ==============================================
// INICIALIZACIÓN
// ==============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Módulo de adopciones cargado');

    // Establecer fecha máxima (hoy)
    const fechaInput = document.getElementById('fecha_adopcion');
    const hoy = new Date().toISOString().split('T')[0];
    fechaInput.max = hoy;
    
    // Opcional: Establecer fecha mínima (1 año atrás)
    const unAnioAtras = new Date();
    unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
    fechaInput.min = unAnioAtras.toISOString().split('T')[0];
    
    // Establecer valor por defecto: hoy
    fechaInput.value = hoy;
    
    cargarAdopciones();
    cargarAnimalesDisponibles();
    cargarDuenios();
    initEventListeners();
    
    // Establecer fecha máxima (hoy)
    document.getElementById('fecha_adopcion').max = new Date().toISOString().split('T')[0];
});

/**
 * Inicializar event listeners
 */
function initEventListeners() {
    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', debounce(aplicarFiltros, 300));
    
    // Formulario
    document.getElementById('formAdopcion').addEventListener('submit', handleSubmit);
    
    // Selección de animal
    document.getElementById('animal_id').addEventListener('change', mostrarPreviewAnimal);
    
    // Selección de dueño
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
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐾 Módulo de adopciones cargado');

    console.log('📋 Verificando tabla al inicio:', document.querySelector('#tablaAdopciones'));
    console.log('📋 Verificando tbody al inicio:', document.querySelector('#tablaAdopciones tbody'));
});

/**
 * Cargar todas las adopciones
 */
async function cargarAdopciones() {
    const tbody = document.querySelector('#tablaAdopciones tbody');
    
    try {
        showLoading(tbody, 'Cargando adopciones...');
        
        const data = await fetchAPI('/api/adopciones');
        
        if (data.success) {
            todasLasAdopciones = data.data;
            adopcionesFiltradas = [...todasLasAdopciones];
            
            renderizarTabla();
            actualizarEstadisticas();
            
            if (todasLasAdopciones.length > 0) {
                showAlert(`${todasLasAdopciones.length} adopciones cargadas`, 'success', 2000);
            }
        }
        
    } catch (error) {
        console.error('Error:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-5">
                    <i class="bi bi-exclamation-triangle fs-1 text-danger mb-3"></i>
                    <p class="mb-0">Error al cargar adopciones</p>
                </td>
            </tr>
        `;
    }
}

/**
 * Cargar animales disponibles
 */
async function cargarAnimalesDisponibles() {
    const select = document.getElementById('animal_id');
    const btn = document.getElementById('btnRecargarAnimales');
    
    try {
        setButtonLoading(btn, true);
        
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
                showAlert('No hay animales disponibles para adopción', 'warning');
            }
        }
        
    } catch (error) {
        showAlert('Error al cargar animales', 'error');
    } finally {
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
        setButtonLoading(btn, false, '<i class="bi bi-arrow-clockwise"></i>');
    }
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
    
    // Total de animales adoptados (mismo que total adopciones)
    document.getElementById('animalesAdoptados').textContent = total;
}

// ==============================================
// FILTROS
// ==============================================

/**
 * Aplicar filtros de búsqueda
 */
function aplicarFiltros() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    adopcionesFiltradas = todasLasAdopciones.filter(adopcion => {
        return !searchTerm || 
            adopcion.animal_nombre.toLowerCase().includes(searchTerm) ||
            adopcion.duenio_nombre.toLowerCase().includes(searchTerm) ||
            adopcion.duenio_apellido.toLowerCase().includes(searchTerm) ||
            adopcion.fecha_adopcion.includes(searchTerm);
    });
    
    renderizarTabla();
}

/**
 * Descarga el PDF de Compromiso de Adopción.
 * Usa la función de utilidad downloadPDF definida en app.refugio.js
 * @param {number} adopcionId - ID de la adopción
 */
function descargarCompromiso(adopcionId) {
    // 1. Construir la URL y el nombre de archivo específicos
    // Se asume que API_BASE es una constante global definida en app.refugio.js
    const url = `${API_BASE}/api/adopciones/${adopcionId}/descargar`;
    const filename = `Compromiso_Adopcion_${adopcionId}.pdf`;
    
    // 2. Ejecutar la función de descarga robusta (la que ya existe)
    if (typeof downloadPDF === 'function') {
        downloadPDF(url, filename);
    } else {
        showAlert('Error: La función de descarga no está disponible.', 'error');
        console.error('La función downloadPDF no fue encontrada.');
    }
}

// ==============================================
// RENDERIZADO
// ==============================================

/**
 * Renderizar tabla de adopciones
 */
function renderizarTabla() {
    const tbody = document.querySelector('#tablaAdopciones tbody');
    console.log('📋 tbody dentro de renderizarTabla:', tbody);
    if (!tbody) {
        console.error('🚨 No se encontró tbody al renderizar');
        console.log('HTML actual:', document.getElementById('tablaAdopciones')?.outerHTML);
        return;
    }
    
    if (adopcionesFiltradas.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center p-5">
                    <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
                    <p class="mb-0">No se encontraron adopciones</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = adopcionesFiltradas.map(adopcion => `
        <tr>
            <td class="align-middle">
                <img src="${getImageUrl(adopcion.animal_foto)}" 
                     class="border-radius-6px" 
                     style="width: 60px; height: 60px; object-fit: cover;"
                     alt="${adopcion.animal_nombre}"
                     onerror="this.src='https://placehold.co/100x100?text=Sin+Foto'"
            </td>
            <td class="align-middle">
                <strong>${adopcion.animal_nombre}</strong><br>
                <small class="text-muted">${adopcion.animal_raza}</small>
            </td>
            <td class="align-middle">
                ${adopcion.duenio_nombre} ${adopcion.duenio_apellido}<br>
                <small class="text-muted">${adopcion.duenio_telefono || 'Sin teléfono'}</small>
            </td>
            <td class="align-middle">${formatDate(adopcion.fecha_adopcion)}</td>
            <td class="align-middle text-muted small">${formatDate(adopcion.fecha_registro, true)}</td>
            <td class="align-middle">
                ${adopcion.compromiso_url ? `
                    <a href="#" // Establecer href a '#'
                onclick="descargarCompromiso(${adopcion.id}); return false;" // 🎯 Llama a la nueva función
                class="btn btn-extra-small btn-success btn-rounded"
                title="Descargar compromiso">
                    <i class="bi bi-file-pdf"></i> PDF
                </a>
                ` : '<span class="text-muted">-</span>'}
            </td>
            <td class="align-middle">
            <td class="align-middle">
                <div class="d-flex gap-1">
                    <button onclick="verDetalle(${adopcion.id})" 
                            class="btn btn-extra-small btn-base-color btn-rounded"
                            title="Ver detalle">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button onclick="confirmarEliminar(${adopcion.id}, '${adopcion.animal_nombre}')" 
                            class="btn btn-extra-small btn-outline-danger btn-rounded"
                            title="Cancelar adopción">
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
 * Manejar submit del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const btnGuardar = document.getElementById('btnGuardar');
    
    // Limpiar errores
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    
    // Obtener datos
    const animal_id = document.getElementById('animal_id').value;
    const duenio_id = document.getElementById('duenio_id').value;
    const fecha_adopcion = document.getElementById('fecha_adopcion').value;
    
    // Validaciones básicas
    if (!animal_id || !duenio_id || !fecha_adopcion) {
        showAlert('Por favor completa todos los campos', 'warning');
        
        if (!animal_id) showFieldError(document.getElementById('animal_id'), 'Selecciona un animal');
        if (!duenio_id) showFieldError(document.getElementById('duenio_id'), 'Selecciona un dueño');
        if (!fecha_adopcion) showFieldError(document.getElementById('fecha_adopcion'), 'Selecciona la fecha');
        
        return;
    }
    
    // VALIDAR FECHA
    const fechaSeleccionada = new Date(fecha_adopcion);
    const hoy = new Date();
    
    // Resetear horas para comparar solo fechas
    fechaSeleccionada.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    
    // No puede ser futura
    if (fechaSeleccionada > hoy) {
        showFieldError(
            document.getElementById('fecha_adopcion'), 
            'La fecha no puede ser futura'
        );
        showAlert('La fecha de adopción debe ser hoy o anterior', 'warning');
        return;
    }
    
    // No puede ser muy antigua (opcional: máximo 1 año atrás)
    const unAnioAtras = new Date();
    unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
    unAnioAtras.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada < unAnioAtras) {
        showFieldError(
            document.getElementById('fecha_adopcion'), 
            'La fecha no puede ser mayor a 1 año en el pasado'
        );
        showAlert('La fecha de adopción no puede ser tan antigua', 'warning');
        return;
    }
    
    try {
        setButtonLoading(btnGuardar, true, 'Registrando adopción...');
        
        // Enviar datos
        const data = await fetchAPI('/api/adopciones', {
            method: 'POST',
            body: JSON.stringify({
                animal_id: parseInt(animal_id),
                duenio_id: parseInt(duenio_id),
                fecha_adopcion
            })
        });
        
        if (data.success) {
            showAlert('¡Adopción registrada exitosamente! PDF generado.', 'success');
            
            // Cerrar modal
            bootstrap.Modal.getInstance(document.getElementById('modalAdopcion')).hide();
            
            // Recargar datos
            await Promise.all([
                cargarAdopciones(),
                cargarAnimalesDisponibles() // Recargar porque uno ya no está disponible
            ]);
            
            // Opcional: Mostrar confirmación con opción de descargar PDF
            showConfirm(
                `Adopción registrada correctamente.<br>¿Deseas descargar el documento de compromiso ahora?`,
                () => {
                    // Descargar PDF
                    window.open(`/api/adopciones/${data.data.id}/descargar`, '_blank');
                },
                () => {
                    // No hacer nada
                }
            );
        }
        
    } catch (error) {
        console.error('Error:', error);
        showAlert(error.message, 'error');
    } finally {
        setButtonLoading(btnGuardar, false, '<i class="bi bi-save me-5px"></i>Registrar Adopción');
    }
}

/**
 * Ver detalle de adopción
 */
function verDetalle(id) {
  const adopcion = todasLasAdopciones.find(a => a.id === id);
  if (!adopcion) return showAlert('No se encontró la adopción', 'error');

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
 * Confirmar eliminación
 */
function confirmarEliminar(id, nombreAnimal) {
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
 * Eliminar adopción
 */
async function eliminarAdopcion(id) {
  try {
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
 * Utilidades simples
 */
function showFieldError(element) {
  element.classList.add('is-invalid');
}

function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

