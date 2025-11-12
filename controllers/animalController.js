const path = require('path');
const fs = require('fs').promises; // 1. AGREGADO: Importación para manejo asíncrono de archivos
const animalModel = require('../models/animalModel');

const animalController = {
    //Obtener todos los animales
    obtenerAnimales: async (req, res) => {
        try {
            const animales = await animalModel.getAll();
            res.json({
                success: true,
                total: animales.length,
                data: animales
            });
        } catch (error) {
            console.error('Error al obtener animales:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener animales',
                error: error.message
            });
        }
    },

    //Obtener un solo animal
    obtenerAnimal: async (req, res) => {
        try {
            const animal = await animalModel.getById(req.params.id);
            if (!animal) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal no encontrado'
                });
            }
            res.json({
                success: true,
                data: animal
            });
        } catch (error) {
            console.error('Error al obtener animal:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener animal',
                error: error.message
            });
        }
    },

    //Crear un nuevo animal
    crearAnimal: async (req, res) => {
        try {
            const { nombre, raza, edad, peso, descripcion, estado, responsable_id } = req.body;

            // Validación básica
            if (!nombre || !raza || !edad) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos obligatorios: nombre, raza, edad'
                });
            }

            // Manejar la imagen subida
            let foto_url = null;
            if (req.file) {
                foto_url = path.join('/uploads/animales', req.file.filename);
            }

            const nuevoAnimal = {
                nombre,
                raza,
                edad,
                peso: peso || null,
                descripcion: descripcion || null,
                estado: estado || 'disponible',
                responsable_id: responsable_id || null,
                foto_url
            };

            const insertId = await animalModel.create(nuevoAnimal);
            const animalCreado = await animalModel.getById(insertId);

            res.status(201).json({
                success: true,
                message: 'Animal creado exitosamente',
                data: animalCreado
            });
        } catch (error) {
            // Si hay error y se subió un archivo, eliminarlo (Asumiendo que usa fs)
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error al eliminar archivo temporal:', unlinkError.message);
                }
            }
            
            console.error('Error al crear animal:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear animal',
                error: error.message
            });
        }
    },

    actualizarAnimal: async (req, res) => {
        try {
            const { id } = req.params;
            const { nombre, raza, edad, peso, descripcion, estado, responsable_id } = req.body;

            // 1. Verificar que existe y obtener datos actuales
            const animalExiste = await animalModel.getById(id);
            if (!animalExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal no encontrado'
                });
            }

            // 🛑 PASO 1.5: MANEJAR CAMBIO DE ESTADO SIMPLE 🛑
            // Si la solicitud es un cambio de estado simple (solo se envió 'estado' o 'estado' y 'responsable_id')
            // y NO es una subida de archivo (indicador de edición completa con formulario),
            // procedemos con una actualización mínima.
            const isSimpleStateChange = (Object.keys(req.body).length === 1 && req.body.hasOwnProperty('estado')) ||
                                        (Object.keys(req.body).length === 2 && req.body.hasOwnProperty('estado') && req.body.hasOwnProperty('responsable_id'));

            if (isSimpleStateChange && !req.file) {
                
                // Lógica de desvinculación: si el nuevo estado es 'disponible', forzamos responsable_id a null
                let finalResponsableId = responsable_id || animalExiste.responsable_id; // Mantener existente si no se envía nada
                
                if (estado && estado.toLowerCase() === 'disponible') {
                    finalResponsableId = null; // Desvincular si pasa a disponible
                } else if (estado === 'adoptado' && !responsable_id) {
                    // Si pasa a adoptado pero no se envía responsable_id, mantener el existente si lo hay.
                    // Si no lo hay, la lógica de 'responsable_id || animalExiste.responsable_id' ya lo maneja.
                }
                
                const dataToUpdate = {
                    // Solo se envían los campos a actualizar: estado y responsable_id
                    estado: estado.toLowerCase(),
                    responsable_id: finalResponsableId
                };
                
                await animalModel.update(id, dataToUpdate);
                const animalActualizado = await animalModel.getById(id);
                
                return res.json({
                    success: true,
                    message: 'Estado del animal actualizado exitosamente',
                    data: animalActualizado
                });
            }
            // 🛑 FIN DE MANEJO DE CAMBIO DE ESTADO SIMPLE 🛑


            // 2. LÓGICA DE ACTUALIZACIÓN COMPLETA (Requiere nombre, raza, edad, etc.)
            // Las siguientes validaciones SÓLO se ejecutan si no fue un cambio de estado simple.
            
            // Validaciones para la edición completa
            if (!nombre || !raza || !edad) {
                return res.status(400).json({
                    success: false,
                    message: 'Nombre, raza y edad son obligatorios para la edición completa'
                });
            }

            // 3. Preparar datos para la actualización completa
            const nuevoEstado = estado || animalExiste.estado || 'disponible';
            let nuevoResponsableId = responsable_id || null; // Valor por defecto del body o null

            // ⚡ FIX CRÍTICO: Si el nuevo estado es 'disponible', forzamos la desvinculación
            if (nuevoEstado === 'disponible') {
                nuevoResponsableId = null;
            } else if (nuevoResponsableId === null && animalExiste.responsable_id) {
                // Si no se envió 'responsable_id', mantenemos el existente (solo en edición completa)
                nuevoResponsableId = animalExiste.responsable_id;
            }
            
            const dataToUpdate = {
                nombre: nombre.trim(),
                raza: raza.trim(),
                edad: parseInt(edad),
                peso: peso ? parseFloat(peso) : null,
                descripcion: descripcion ? descripcion.trim() : null,
                estado: nuevoEstado,
                responsable_id: nuevoResponsableId, // Aplicamos la lógica de desvinculación
                foto_url: animalExiste.foto_url // Mantenemos la foto existente
            };

            // 4. Lógica para manejar la foto (si hay nueva foto)
            if (req.file) {
                // ... (lógica para eliminar foto anterior)
                if (animalExiste.foto_url) {
                    try {
                        const oldPath = path.join(__dirname, '..', animalExiste.foto_url);
                        await fs.unlink(oldPath);
                    } catch (err) {
                        console.error('Error al intentar eliminar foto anterior:', err.message);
                    }
                }
                dataToUpdate.foto_url = `/uploads/animales/${req.file.filename}`;
            }

            // 5. Actualizar
            await animalModel.update(id, dataToUpdate);

            // 6. Obtener actualizado y retornar
            const animalActualizado = await animalModel.getById(id);

            res.json({
                success: true,
                message: 'Animal actualizado exitosamente',
                data: animalActualizado
            });
            
        } catch (error) {
            // ... (manejo de errores y eliminación de archivo temporal)
            if (req.file) {
                try {
                    await fs.unlink(req.file.path);
                } catch (unlinkError) {
                    console.error('Error al eliminar archivo temporal:', unlinkError.message);
                }
            }

            console.error('Error al actualizar animal:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar animal',
                error: error.message
            });
        }
    },
    //Eliminar animal
    eliminarAnimal: async (req, res) => {
        try {
            // Opcional: Podrías buscar el animal primero para eliminar su foto del disco
            const eliminado = await animalModel.delete(req.params.id);
            if (!eliminado) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal no encontrado'
                });
            }
            res.json({
                success: true,
                message: 'Animal eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar animal:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar animal',
                error: error.message
            });
        }
    }
};

module.exports = animalController;