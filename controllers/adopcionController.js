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
            const { animal_id, duenio_id, fecha_adopcion } = req.body;

            // Validaciones
            if (!animal_id || !duenio_id || !fecha_adopcion) {
                return res.status(400).json({
                    success: false,
                    message: 'Animal, dueño y fecha de adopción son obligatorios'
                });
            }

            // Validar fecha
            const fechaAdopcion = new Date(fecha_adopcion);
            const hoy = new Date();
            fechaAdopcion.setHours(0, 0, 0, 0);
            hoy.setHours(0, 0, 0, 0);
            
            const ayer = new Date(hoy);
            ayer.setDate(ayer.getDate() - 1);
            const maxFuturo = new Date(hoy);
            maxFuturo.setDate(maxFuturo.getDate() + 60);

            if (fechaAdopcion < ayer) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de adopción no puede ser anterior a ayer'
                });
            }

            if (fechaAdopcion > maxFuturo) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha de adopción no puede ser más de 60 días en el futuro'
                });
            }

            // Crear adopción (el modelo maneja la transacción)
            const adopcionId = await adopcionModel.create({
                animal_id,
                duenio_id,
                fecha_adopcion
            });

            // Obtener la adopción completa
            const adopcionCompleta = await adopcionModel.getById(adopcionId);

            // Generar PDF DE CITA (no compromiso)
            const pdfDir = path.join(__dirname, '..', 'uploads', 'documentos');
            
            try {
                await fs.access(pdfDir);
            } catch {
                await fs.mkdir(pdfDir, { recursive: true });
            }

           
            const pdfFilename = `cita-adopcion-${adopcionId}-${Date.now()}.pdf`;
            const pdfPath = path.join(pdfDir, pdfFilename);
            const citaUrl = `/uploads/documentos/${pdfFilename}`;

            
            await generarCitaPDF(adopcionCompleta, pdfPath);
            await adopcionModel.updateCompromisoUrl(adopcionId, citaUrl);

            const adopcionFinal = await adopcionModel.getById(adopcionId);

            res.status(201).json({
                success: true,
                message: 'Cita de adopción registrada exitosamente.',
                data: adopcionFinal,
                citaUrl: citaUrl 
            });
        } catch (error) {
            console.error('Error al crear adopción:', error);
            
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
            
            // Verificar que el archivo existe
            await fs.access(filePath);

            // ✅ Cambiar nombre de descarga
            const filename = adopcion.compromiso_url.includes('cita') 
                ? `Cita-Adopcion-${id}.pdf`
                : `Compromiso-Adopcion-${id}.pdf`;

            // Enviar archivo
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

            // Verificar que existe
            const adopcionExiste = await adopcionModel.getById(id);
            if (!adopcionExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Adopción no encontrada'
                });
            }

            // Eliminar (el modelo maneja la transacción y retorna el PDF)
            const result = await adopcionModel.delete(id);

            // Eliminar archivo PDF si existe
            if (result.compromisoUrl) {
                try {
                    const filePath = path.join(__dirname, '..', result.compromisoUrl);
                    await fs.unlink(filePath);
                } catch (unlinkError) {
                    console.error('Error al eliminar PDF:', unlinkError);
                    // No fallar la operación si no se puede eliminar el archivo
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
    }
};

module.exports = adopcionController;