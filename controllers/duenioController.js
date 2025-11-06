// controllers/duenioController.js
const duenioModel = require('../models/duenioModel');

const duenioController = {

    // GET /api/duenios - Obtener todos
    obtenerDuenios: async (req, res) => {
        try {
            const duenios = await duenioModel.getAll();
            res.json({
                success: true,
                data: duenios,
                total: duenios.length
            });
        } catch (error) {
            console.error('Error al obtener dueños:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener dueños',
                error: error.message
            });
        }
    },

    // GET /api/duenios/:id - Obtener uno
    obtenerDuenio: async (req, res) => {
        try {
            const { id } = req.params;
            const duenio = await duenioModel.getById(id);
            
            if (!duenio) {
                return res.status(404).json({
                    success: false,
                    message: 'Dueño no encontrado'
                });
            }

            // Obtener también sus adopciones
            const adopciones = await duenioModel.getAdopciones(id);

            res.json({
                success: true,
                data: {
                    ...duenio,
                    adopciones
                }
            });
        } catch (error) {
            console.error('Error al obtener dueño:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener dueño',
                error: error.message
            });
        }
    },

    // POST /api/duenios - Crear
    crearDuenio: async (req, res) => {
        try {
            const { nombre, apellido, telefono, email } = req.body;

            // Validaciones básicas
            if (!nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y apellido son obligatorios'
                });
            }

            // Validar email si se proporciona
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email inválido'
                    });
                }

                // Verificar si el email ya existe
                const emailExists = await duenioModel.existsByEmail(email);
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
            }

            // Crear dueño
            const duenioId = await duenioModel.create({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono ? telefono.trim() : null,
                email: email ? email.trim().toLowerCase() : null
            });

            // Obtener el dueño creado
            const nuevoDuenio = await duenioModel.getById(duenioId);

            res.status(201).json({
                success: true,
                message: 'Dueño registrado exitosamente',
                data: nuevoDuenio
            });
        } catch (error) {
            console.error('Error al crear dueño:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear dueño',
                error: error.message
            });
        }
    },

    // PUT /api/duenios/:id - Actualizar
    actualizarDuenio: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, apellido, telefono, email } = req.body;

            // Verificar que existe
            const duenioExiste = await duenioModel.getById(id);
            if (!duenioExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Dueño no encontrado'
                });
            }

            // Validaciones
            if (!nombre || !apellido) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre y apellido son obligatorios'
                });
            }

            // Validar email
            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email inválido'
                    });
                }

                // Verificar si el email ya existe (excluyendo el actual)
                const emailExists = await duenioModel.existsByEmail(email, id);
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
            }

            // Actualizar
            await duenioModel.update(id, {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono ? telefono.trim() : null,
                email: email ? email.trim().toLowerCase() : null
            });

            // Obtener actualizado
            const duenioActualizado = await duenioModel.getById(id);

            res.json({
                success: true,
                message: 'Dueño actualizado exitosamente',
                data: duenioActualizado
            });
        } catch (error) {
            console.error('Error al actualizar dueño:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar dueño',
                error: error.message
            });
        }
    },

    // DELETE /api/duenios/:id - Eliminar
    eliminarDuenio: async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar que existe
            const duenioExiste = await duenioModel.getById(id);
            if (!duenioExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Dueño no encontrado'
                });
            }

            // Intentar eliminar
            await duenioModel.delete(id);

            res.json({
                success: true,
                message: 'Dueño eliminado exitosamente'
            });
        } catch (error) {
            // Si el error es por adopciones asociadas
            if (error.message.includes('adopciones')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            console.error('Error al eliminar dueño:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar dueño',
                error: error.message
            });
        }
    }
};

module.exports = duenioController;