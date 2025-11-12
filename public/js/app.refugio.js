// public/js/app.refugio.js

/**
 * REFUGIO DON PEPITO - Funciones Globales
 * Archivo con utilidades compartidas por todas las páginas
 */

const RefugioAPI = {
    baseURL: '/api',
    
    // URLs de los endpoints
    endpoints: {
        animales: '/api/animales',
        responsables: '/api/responsables',
        duenios: '/api/duenios',
        adopciones: '/api/adopciones'
    }
};

// ==============================================
// UTILIDADES DE FETCH
// ==============================================

/**
 * Wrapper de fetch con manejo de errores
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones de fetch
 * @returns {Promise<object>}
 */
// ===============================================
// UTILIDADES DE FETCH
// ===============================================

const API_BASE = 'http://localhost:3000';

/**
 * Wrapper de fetch con manejo de errores
 * @param {string} url - URL del endpoint
 * @param {object} options - Opciones de fetch
 * @returns {Promise<object>}
 */
async function fetchAPI(url, options = {}) {
    const fullUrl = `${API_BASE}${url}`;
    console.log('🔍 Llamando a:', fullUrl);

    try {
        const response = await fetch(fullUrl, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        // Evitar intentar parsear HTML por error
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error(`Respuesta no válida del servidor (${response.status})`);
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en fetchAPI:', error);
        throw error;
    }
}

/**
 * Fetch para FormData (archivos)
 * @param {string} url - URL del endpoint
 * @param {FormData} formData - Datos del formulario
 * @param {string} method - Método HTTP
 * @returns {Promise<object>}
 */
async function fetchFormData(url, formData, method = 'POST') {
    const fullUrl = `${API_BASE}${url}`;
    console.log('📤 Enviando datos a:', fullUrl);

    try {
        const response = await fetch(fullUrl, {
            method,
            body: formData
        });

        const text = await response.text();
        const data = text ? JSON.parse(text) : {};

        if (!response.ok) {
            throw new Error(data.message || 'Error en la petición');
        }

        return data;
    } catch (error) {
        console.error('Error en fetchFormData:', error);
        throw error;
    }
}


// ==============================================
// MENSAJES Y ALERTAS
// ==============================================

/**
 * Mostrar mensaje de alerta
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: success, error, warning, info
 * @param {number} duration - Duración en ms (0 = sin auto-cerrar)
 */
function showAlert(message, type = 'info', duration = 4000) {
    // Remover alertas anteriores
    const existingAlert = document.querySelector('.alert-refugio-notification');
    if (existingAlert) {
        existingAlert.remove();
    }

    // Colores según tipo
    const colors = {
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3'
    };

    const icons = {
        success: 'bi-check-circle-fill',
        error: 'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info: 'bi-info-circle-fill'
    };

    // Crear alerta
    const alert = document.createElement('div');
    alert.className = 'alert-refugio-notification';
    alert.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        min-width: 300px;
        max-width: 500px;
        padding: 20px;
        background: white;
        border-left: 4px solid ${colors[type]};
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        z-index: 9999;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideIn 0.3s ease-out;
    `;

    alert.innerHTML = `
        <i class="bi ${icons[type]}" style="font-size: 24px; color: ${colors[type]};"></i>
        <div style="flex: 1;">
            <strong style="display: block; margin-bottom: 5px; color: #333;">${type === 'error' ? 'Error' : type === 'success' ? 'Éxito' : type === 'warning' ? 'Advertencia' : 'Información'}</strong>
            <span style="color: #666; font-size: 14px;">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #999; padding: 0; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;">
            <i class="bi bi-x"></i>
        </button>
    `;

    // Agregar estilos de animación si no existen
    if (!document.getElementById('alert-animations')) {
        const style = document.createElement('style');
        style.id = 'alert-animations';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(400px);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(400px);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(alert);

    // Auto-cerrar
    if (duration > 0) {
        setTimeout(() => {
            alert.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => alert.remove(), 300);
        }, duration);
    }
}

/**
 * Mostrar mensaje de confirmación
 * @param {string} message - Mensaje a mostrar
 * @param {function} onConfirm - Callback al confirmar
 * @param {function} onCancel - Callback al cancelar
 */
function showConfirm(message, onConfirm, onCancel = null) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 9998;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: fadeIn 0.2s ease-out;
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        max-width: 400px;
        width: 90%;
        text-align: center;
        animation: scaleIn 0.3s ease-out;
    `;

    modal.innerHTML = `
        <i class="bi bi-question-circle text-warning" style="font-size: 48px; margin-bottom: 20px;"></i>
        <h4 style="margin-bottom: 15px; color: #333;">Confirmar acción</h4>
        <p style="margin-bottom: 25px; color: #666;">${message}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="btn-cancel" class="btn btn-medium btn-white border-1 btn-rounded" style="min-width: 100px;">
                Cancelar
            </button>
            <button id="btn-confirm" class="btn btn-medium btn-base-color btn-rounded" style="min-width: 100px;">
                Confirmar
            </button>
        </div>
    `;

    // Agregar animaciones si no existen
    if (!document.getElementById('modal-animations')) {
        const style = document.createElement('style');
        style.id = 'modal-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.7); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Eventos
    modal.querySelector('#btn-confirm').addEventListener('click', () => {
        overlay.remove();
        if (onConfirm) onConfirm();
    });

    modal.querySelector('#btn-cancel').addEventListener('click', () => {
        overlay.remove();
        if (onCancel) onCancel();
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
            if (onCancel) onCancel();
        }
    });
}

// ==============================================
// FORMATEO Y VALIDACIONES
// ==============================================

/**
 * Formatear fecha a formato local
 * @param {string|Date} date - Fecha a formatear
 * @param {boolean} includeTime - Incluir hora
 * @returns {string}
 */
function formatDate(date, includeTime = false) {
    if (!date) return 'N/A';
    
    const d = new Date(date);
    const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    };
    
    if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
    }
    
    return d.toLocaleDateString('es-PE', options);
}

/**
 * Validar email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
function isValidEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Validar teléfono (formato peruano)
 * @param {string} phone - Teléfono a validar
 * @returns {boolean}
 */
function isValidPhone(phone) {
    // Celular peruano: 9 seguido de 8 dígitos
    const regex = /^[9]\d{8}$/; 
    return regex.test(phone.replace(/\s/g, ''));
}

/**
 * Capitalizar primera letra
 * @param {string} str - String a capitalizar
 * @returns {string}
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncar texto
 * @param {string} text - Texto a truncar
 * @param {number} length - Longitud máxima
 * @returns {string}
 */
function truncateText(text, length = 100) {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
}


// ==============================================
// 🐾 NUEVAS FUNCIONES DE UTILIDAD PARA EL REFUGIO 🐾
// ==============================================

/**
 * Obtener URL de imagen o placeholder si no existe.
 * Importante: Usar una URL absoluta o un placeholder seguro.
 * @param {string} imageUrl - URL de la imagen del animal
 * @returns {string}
 */
function getImageUrl(imageUrl) {
    if (imageUrl && imageUrl.startsWith('http')) {
        return imageUrl;
    }
    // Asume que las imágenes del refugio están bajo una ruta específica
    if (imageUrl) {
        // Ajusta esta ruta si tus imágenes locales están en otro lugar
        return `../public/images/animales/${imageUrl}`; 
    }
    // Placeholder por defecto (URL externa segura)
    return 'https://placehold.co/100x100?text=Sin+Foto'; 
}


/**
 * Calcular la edad en años a partir de una fecha de nacimiento (o año)
 * @param {string|Date|number} dob - Fecha de nacimiento (string o Date) o solo el año.
 * @returns {number|string} Edad en años o 'N/A' si es inválido.
 */
function calculateAge(dob) {
    if (!dob) return 'N/A';
    
    let birthDate;

    if (typeof dob === 'number' && dob > 1900 && dob <= new Date().getFullYear()) {
        // Si solo se proporciona el año (ej: 2020)
        birthDate = new Date(dob, 0, 1); 
    } else {
        // Si se proporciona la fecha completa (string o Date)
        birthDate = new Date(dob);
    }
    
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    
    // Ajustar si aún no ha pasado el cumpleaños de este año
    const monthDifference = today.getMonth() - birthDate.getMonth();
    const dayDifference = today.getDate() - birthDate.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }
    
    // Manejar el caso de fechas inválidas
    return isNaN(age) || age < 0 ? 'N/A' : age;
}

/**
 * Formatear el peso del animal con unidades y precisión.
 * @param {number} weight - Peso del animal.
 * @returns {string} Peso formateado (ej: 15.5 kg).
 */
function formatWeight(weight) {
    if (typeof weight !== 'number' || isNaN(weight)) return 'N/A';
    return `${weight.toFixed(2)} kg`;
}

// ==============================================
// MANEJO DE IMÁGENES
// ==============================================

/**
 * Preview de imagen antes de subir
 * @param {HTMLInputElement} input - Input file
 * @param {HTMLImageElement} imgElement - Elemento img donde mostrar preview
 */
function previewImage(input, imgElement) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            imgElement.src = e.target.result;
            imgElement.style.display = 'block';
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

/**
 * Validar archivo de imagen
 * @param {File} file - Archivo a validar
 * @param {number} maxSizeMB - Tamaño máximo en MB
 * @returns {object} {valid: boolean, message: string}
 */
function validateImageFile(file, maxSizeMB = 5) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    const maxSize = maxSizeMB * 1024 * 1024;

    if (!file) {
        return { valid: false, message: 'No se seleccionó ningún archivo' };
    }

    if (!validTypes.includes(file.type)) {
        return { valid: false, message: 'Solo se permiten imágenes JPG, PNG o GIF' };
    }

    if (file.size > maxSize) {
        return { valid: false, message: `El archivo no debe superar ${maxSizeMB}MB` };
    }

    return { valid: true, message: 'Archivo válido' };
}

/**
 * Obtener URL de imagen o placeholder
 * @param {string} imageUrl - URL de la imagen
 * @returns {string}
 */
function getImageUrl(imageUrl) {
    // 🛑 DEBE USAR EL ENLACE EXTERNO O LA RUTA COMPLETA CORREGIDA
    return imageUrl || 'https://placehold.co/100x100?text=Sin+Foto'; 
}

// ==============================================
// LOADING Y ESTADOS
// ==============================================

/**
 * Mostrar/ocultar loading en un botón
 * @param {HTMLButtonElement} button - Botón
 * @param {boolean} loading - Estado de loading
 * @param {string} text - Texto opcional
 */
function setButtonLoading(button, loading, text = null) {
    if (loading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ${text || 'Procesando...'}
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText || text || 'Guardar';
    }
}

/**
 * Mostrar loading en un contenedor
 * @param {HTMLElement} container - Contenedor
 * @param {string} message - Mensaje opcional
 */
function showLoading(container, message = 'Cargando...') {
    container.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="text-muted">${message}</p>
        </div>
    `;
}

/**
 * Mostrar mensaje de "sin datos"
 * @param {HTMLElement} container - Contenedor
 * @param {string} message - Mensaje
 */
function showEmptyState(container, message = 'No hay datos para mostrar') {
    container.innerHTML = `
        <div class="text-center p-5">
            <i class="bi bi-inbox fs-1 text-muted mb-3"></i>
            <p class="text-muted">${message}</p>
        </div>
    `;
}

// ==============================================
// BADGES Y ESTADOS
// ==============================================

/**
 * Obtener badge HTML según estado del animal
 * @param {string} estado - Estado: disponible, adoptado, en_proceso
 * @returns {string} HTML del badge
 */
function getEstadoBadge(estado) {
    const badges = {
        'disponible': '<span class="badge bg-success">Disponible</span>',
        'adoptado': '<span class="badge bg-primary">Adoptado</span>',
        'en_proceso': '<span class="badge bg-warning text-dark">En Proceso</span>'
    };
    return badges[estado] || `<span class="badge bg-secondary">${estado}</span>`;
}

/**
 * Obtener color según estado
 * @param {string} estado - Estado del animal
 * @returns {string} Clase de color Bootstrap
 */
function getEstadoColor(estado) {
    const colors = {
        'disponible': 'success',
        'adoptado': 'primary',
        'en_proceso': 'warning'
    };
    return colors[estado] || 'secondary';
}

// ==============================================
// FORMULARIOS
// ==============================================

/**
 * Resetear formulario y errores
 * @param {HTMLFormElement} form - Formulario
 */
function resetForm(form) {
    form.reset();
    
    // Limpiar mensajes de error
    form.querySelectorAll('.invalid-feedback').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
    
    // Remover clases de validación
    form.querySelectorAll('.is-invalid').forEach(el => {
        el.classList.remove('is-invalid');
    });
    
    form.querySelectorAll('.is-valid').forEach(el => {
        el.classList.remove('is-valid');
    });
}

/**
 * Mostrar error en campo de formulario
 * @param {HTMLInputElement} input - Campo de input
 * @param {string} message - Mensaje de error
 */
function showFieldError(input, message) {
    input.classList.add('is-invalid');
    
    let feedback = input.nextElementSibling;
    if (!feedback || !feedback.classList.contains('invalid-feedback')) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        input.parentNode.appendChild(feedback);
    }
    
    feedback.textContent = message;
    feedback.style.display = 'block';
}

/**
 * Limpiar error en campo de formulario
 * @param {HTMLInputElement} input - Campo de input
 */
function clearFieldError(input) {
    input.classList.remove('is-invalid');
    
    const feedback = input.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = '';
        feedback.style.display = 'none';
    }
}

// ==============================================
// NAVEGACIÓN
// ==============================================

/**
 * Navegar a una página
 * @param {string} url - URL destino
 */
function navigateTo(url) {
    window.location.href = url;
}

/**
 * Recargar página actual
 */
function reloadPage() {
    window.location.reload();
}

/**
 * Volver a la página anterior
 */
function goBack() {
    window.history.back();
}

// ==============================================
// DESCARGAS
// ==============================================

/**
 * Descargar archivo PDF
 * @param {string} url - URL del PDF
 * @param {string} filename - Nombre del archivo
 */
async function downloadPDF(url, filename = 'documento.pdf') {
    try {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(link.href);
    } catch (error) {
        showAlert('Error al descargar el archivo', 'error');
        console.error('Error en downloadPDF:', error);
    }
}

// ==============================================
// UTILIDADES VARIAS
// ==============================================

/**
 * Debounce para eventos
 * @param {function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @returns {function}
 */
function debounce(func, wait = 300) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Copiar texto al portapapeles
 * @param {string} text - Texto a copiar
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showAlert('Copiado al portapapeles', 'success', 2000);
    } catch (error) {
        showAlert('Error al copiar', 'error');
    }
}

/**
 * Scroll suave a un elemento
 * @param {string} elementId - ID del elemento
 */
function scrollToElement(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ==============================================
// INICIALIZACIÓN
// ==============================================

/**
 * Inicializar tooltips de Bootstrap
 */
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Ejecutar al cargar el DOM
 */
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar tooltips
    if (typeof bootstrap !== 'undefined') {
        initTooltips();
    }
    
    console.log('🐾 Refugio Don Pepito - Sistema cargado correctamente');

    const fechaInput = document.getElementById('fecha_adopcion');
    if (fechaInput) {
        // Obtener la fecha de hoy, forzando el formato YYYY-MM-DD sin problemas de zona horaria local.
        function getTodayString() {
            const today = new Date();
            const year = today.getFullYear();
            // Los meses en JS son de 0 a 11, por eso sumamos 1
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        }

        // ESTO ES CRUCIAL: Establece la fecha mínima seleccionable al día de hoy
        const todayString = getTodayString();
        fechaInput.setAttribute('min', todayString); 

        // Verifica en la consola: console.log('Fecha mínima establecida a:', fechaInput.getAttribute('min')); 
        // Debe mostrar la fecha de hoy (ej: 2025-11-11)
    }

});

// ==============================================
// EXPORTAR (si usas módulos ES6)
// ==============================================
/*
export {
    fetchAPI,
    fetchFormData,
    showAlert,
    showConfirm,
    formatDate,
    isValidEmail,
    isValidPhone,
    capitalize,
    truncateText,
    previewImage,
    validateImageFile,
    getImageUrl,
    setButtonLoading,
    showLoading,
    showEmptyState,
    getEstadoBadge,
    getEstadoColor,
    resetForm,
    showFieldError,
    clearFieldError,
    navigateTo,
    reloadPage,
    goBack,
    downloadPDF,
    debounce,
    copyToClipboard,
    scrollToElement,
    initTooltips,
    RefugioAPI
};
*/