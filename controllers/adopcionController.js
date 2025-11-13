// controllers/adopcionController.js
const adopcionModel = require('../models/adopcionModel');
const { generarCompromisoPDF } = require('../utils/generarCompromisoPDF');
const { generarCitaPDF } = require('../utils/generarCitaPDF');
const fs = require('fs').promises;
const path = require('path');

const adopcionController = {

    // GET /api/adopciones - Obtener todas
    obtenerAdopciones: async (req, res) => {
        try {
            const adopciones = await adopcionModel.getAll();
            res.json({
                success: true,
                data: adopciones,
                total: adopciones.length
            });
        } catch (error) {
            console.error('Error al obtener adopciones:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener adopciones',
                error: error.message
            });
        }
    },

    // GET /api/adopciones/:id - Obtener una
    obtenerAdopcion: async (req, res) => {
        try {
            const { id } = req.params;
            const adopcion = await adopcionModel.getById(id);
            
            if (!adopcion) {
                return res.status(404).json({
                    success: false,
                    message: 'Adopción no encontrada'
                });
            }

            res.json({
                success: true,
                data: adopcion
            });
        } catch (error) {
            console.error('Error al obtener adopción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener adopción',
                error: error.message
            });
        }
    },

    // POST /api/adopciones - Crear adopción
    crearAdopcion: async (req, res) => {
        try {
            // ✅ CORRECCIÓN 1: Extraer TODAS las variables necesarias
            const { animal_id, duenio_id, fecha_adopcion, tipo } = req.body;

            console.log('Datos recibidos:', { animal_id, duenio_id, fecha_adopcion, tipo });

            // ✅ CORRECCIÓN 2: Validar con el nombre correcto
            if (!animal_id || !duenio_id || !fecha_adopcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Animal, dueño y fecha de adopción son obligatorios'
                });
            }

            // ✅ CORRECCIÓN 3: Usar la variable correcta
            const fechaAdopcion = new Date(fecha_adopcion);
            const hoy = new Date();
            fechaAdopcion.setHours(0, 0, 0, 0);
            hoy.setHours(0, 0, 0, 0);
            
            // Permitir hasta 1 año atrás para adopciones
            const unAnioAtras = new Date(hoy);
            unAnioAtras.setFullYear(unAnioAtras.getFullYear() - 1);
            const maxFuturo = new Date(hoy);
            maxFuturo.setDate(maxFuturo.getDate() + 60);

            if (fechaAdopcion < unAnioAtras) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de adopción no puede ser anterior a 1 año atrás'
                });
            }

            if (fechaAdopcion > maxFuturo) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de adopción no puede ser más de 60 días en el futuro'
                });
            }

            // Crear adopción
            const adopcionId = await adopcionModel.create({
                animal_id,
                duenio_id,
                fecha_adopcion
            });

            // Obtener la adopción completa
            const adopcionCompleta = await adopcionModel.getById(adopcionId);

            // Generar PDF
            const pdfDir = path.join(__dirname, '..', 'uploads', 'documentos');
            
            try {
                await fs.access(pdfDir);
            } catch {
                await fs.mkdir(pdfDir, { recursive: true });
            }

            let pdfFilename, pdfUrl, mensaje;

            // ✅ CORRECCIÓN 4: Tipo ahora está definido
            if (tipo === 'cita') {
                // Cliente público: generar CITA
                pdfFilename = `cita-adopcion-${adopcionId}-${Date.now()}.pdf`;
                const pdfPath = path.join(pdfDir, pdfFilename);
                pdfUrl = `/uploads/documentos/${pdfFilename}`;
                
                await generarCitaPDF(adopcionCompleta, pdfPath);
                mensaje = 'Cita de adopción registrada exitosamente.';
                
            } else {
                // Admin: generar COMPROMISO
                pdfFilename = `compromiso-${adopcionId}-${Date.now()}.pdf`;
                const pdfPath = path.join(pdfDir, pdfFilename);
                pdfUrl = `/uploads/documentos/${pdfFilename}`;
                
                await generarCompromisoPDF(adopcionCompleta, pdfPath);
                mensaje = 'Adopción registrada exitosamente. Documento de compromiso generado.';
            }

            await adopcionModel.updateCompromisoUrl(adopcionId, pdfUrl);

            const adopcionFinal = await adopcionModel.getById(adopcionId);

            res.status(201).json({
                success: true,
                message: mensaje,
                data: adopcionFinal,
                pdfUrl: pdfUrl,
                tipo: tipo || 'compromiso'
            });
        } catch (error) {
            console.error('Error al crear adopción:', error);
            console.error('Stack completo:', error.stack);
            
            if (error.message.includes('no existe') || 
                error.message.includes('no está disponible')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al crear adopción',
                error: error.message
            });
        }
    },

    // POST /api/adopciones/cita - Crear cita de adopción
    crearCitaAdopcion: async (req, res) => {
        try {
            // ✅ CORRECCIÓN: Extraer fecha_cita correctamente
            const { animal_id, duenio_id, fecha_cita } = req.body;

            console.log('Datos de cita recibidos:', { animal_id, duenio_id, fecha_cita });

            // Validaciones de campos obligatorios
            if (!animal_id || !duenio_id || !fecha_cita) {
                return res.status(400).json({
                    success: false,
                    message: 'Animal, dueño y fecha de la cita son obligatorios'
                });
            }
            
            // Validación de fecha para CITAS (Hoy hasta 60 días futuro)
            const fechaCita = new Date(fecha_cita);
            const hoy = new Date();
            
            fechaCita.setHours(0, 0, 0, 0); 
            hoy.setHours(0, 0, 0, 0);
            
            const maxFuturo = new Date(hoy);
            maxFuturo.setDate(maxFuturo.getDate() + 60); 

            // Las citas NO pueden ser en el pasado (solo desde hoy)
            if (fechaCita.getTime() < hoy.getTime()) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de la cita no puede ser anterior a hoy.'
                });
            }

            // No puede ser más de 60 días en el futuro
            if (fechaCita.getTime() > maxFuturo.getTime()) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de la cita no puede ser más de 60 días en el futuro.'
                });
            }
            
            // ✅ Crear el registro usando fecha_cita como fecha_adopcion
            const adopcionId = await adopcionModel.create({
                animal_id,
                duenio_id,
                fecha_adopcion: fecha_cita
            });

            // Obtener la cita completa
            const adopcionCompleta = await adopcionModel.getById(adopcionId);

            // Generar PDF
            const pdfDir = path.join(__dirname, '..', 'uploads', 'documentos');
            
            try {
                await fs.access(pdfDir);
            } catch {
                await fs.mkdir(pdfDir, { recursive: true });
            }

            const pdfFilename = `cita-adopcion-${adopcionId}-${Date.now()}.pdf`;
            const pdfPath = path.join(pdfDir, pdfFilename);
            const pdfUrl = `/uploads/documentos/${pdfFilename}`;
            
            await generarCitaPDF(adopcionCompleta, pdfPath); 
            const mensaje = 'Cita de adopción registrada exitosamente. Documento de cita generado.';
            
            // Actualizar URL del documento
            await adopcionModel.updateCompromisoUrl(adopcionId, pdfUrl);

            const adopcionFinal = await adopcionModel.getById(adopcionId);

            res.status(201).json({
                success: true,
                message: mensaje,
                data: adopcionFinal,
                pdfUrl: pdfUrl,
                tipo: 'cita'
            });
            
        } catch (error) {
            console.error('Error al crear cita de adopción:', error);
            console.error('Stack completo:', error.stack);
            
            if (error.message.includes('no existe') || 
                error.message.includes('no está disponible')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            res.status(500).json({
                success: false,
                message: 'Error al crear la cita de adopción',
                error: error.message
            });
        }
    },

    // GET /api/adopciones/:id/descargar - Descargar PDF
    descargarCompromiso: async (req, res) => {
        try {
            const { id } = req.params;
            
            const adopcion = await adopcionModel.getById(id);
            
            if (!adopcion) {
                return res.status(404).json({
                    success: false,
                    message: 'Adopción no encontrada'
                });
            }

            if (!adopcion.compromiso_url) {
                return res.status(404).json({
                    success: false,
                    message: 'No hay documento disponible'
                });
            }

            const filePath = path.join(__dirname, '..', adopcion.compromiso_url);
            
            await fs.access(filePath);

            const filename = adopcion.compromiso_url.includes('cita') 
                ? `Cita-Adopcion-${id}.pdf`
                : `Compromiso-Adopcion-${id}.pdf`;

            res.download(filePath, filename, (err) => {
                if (err) {
                    console.error('Error al descargar:', err);
                    res.status(500).json({
                        success: false,
                        message: 'Error al descargar el documento'
                    });
                }
            });
        } catch (error) {
            console.error('Error al descargar documento:', error);
            res.status(500).json({
                success: false,
                message: 'Error al descargar documento',
                error: error.message
            });
        }
    },

    // DELETE /api/adopciones/:id - Eliminar adopción
    eliminarAdopcion: async (req, res) => {
        try {
            const { id } = req.params;

            const adopcionExiste = await adopcionModel.getById(id);
            if (!adopcionExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Adopción no encontrada'
                });
            }

            const result = await adopcionModel.delete(id);

            if (result.compromisoUrl) {
                try {
                    const filePath = path.join(__dirname, '..', result.compromisoUrl);
                    await fs.unlink(filePath);
                } catch (unlinkError) {
                    console.error('Error al eliminar PDF:', unlinkError);
                }
            }

            res.json({
                success: true,
                message: 'Adopción eliminada exitosamente. El animal está nuevamente disponible.'
            });
        } catch (error) {
            console.error('Error al eliminar adopción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar adopción',
                error: error.message
            });
        }
    },

    // PUT /api/adopciones/:id/finalizar - Finalizar Adopción
    finalizarAdopcion: async (req, res) => {
        const id = req.params.id;
        try {
            await adopcionModel.finalizar(id);
            res.json({
                success: true,
                message: 'Adopción finalizada y animal marcado como adoptado.'
            });
        } catch (error) {
            console.error('Error al finalizar adopción:', error);
            res.status(500).json({
                success: false,
                message: 'Error al finalizar adopción',
                error: error.message
            });
        }
    }
};

module.exports = adopcionController;