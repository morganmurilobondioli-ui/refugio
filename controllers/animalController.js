const path = require('path');
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
            console.error('Error al crear animal:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear animal',
                error: error.message
            });
        }
    },

    //Actualizar un animal existente
    actualizarAnimal: async (req, res) => {
        try {
            const id = req.params.id;
            const { nombre, raza, edad, peso, descripcion, estado, responsable_id } = req.body;

            let foto_url = req.body.foto_url || null;
            if (req.file) {
                foto_url = path.join('/uploads/animales', req.file.filename);
            }

            const dataActualizada = {
                nombre,
                raza,
                edad,
                peso: peso || null,
                descripcion: descripcion || null,
                estado: estado || 'disponible',
                responsable_id: responsable_id || null,
                foto_url
            };

            const actualizado = await animalModel.update(id, dataActualizada);

            if (!actualizado) {
                return res.status(404).json({
                    success: false,
                    message: 'Animal no encontrado'
                });
            }

            const animalActualizado = await animalModel.getById(id);

            res.json({
                success: true,
                message: 'Animal actualizado exitosamente',
                data: animalActualizado
            });
        } catch (error) {
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