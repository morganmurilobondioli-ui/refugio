const { query } = require('../config/db'); // Ejecuta consultas SQL
const responsableModel = require('./responsableModel'); // Para obtener info del responsable

// Cada función se encarga de una operación específica (CRUD)
const animalModel = {
    //Obtener todos los animales
    getAll: async () => {
        try {
            const sql = `
                SELECT
                    id,
                    nombre,
                    raza,
                    edad,
                    peso,
                    descripcion,
                    foto_url,
                    estado,
                    responsable_id,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
                FROM animal
                ORDER BY fecha_registro DESC
            `;
            const results = await query(sql);
            return results;
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    },

    //Obtener un animal por su ID
    getById: async (id) => {
        try {
            const sql = `
                SELECT
                    id,
                    nombre,
                    raza,
                    edad,
                    peso,
                    descripcion,
                    foto_url,
                    estado,
                    responsable_id,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
                FROM animal
                WHERE id = ?
            `;
            const results = await query(sql, [id]);
            const animal = results[0];

            // Si existe, también obtenemos el responsable
            if (animal && animal.responsable_id) {
                const responsable = await responsableModel.getById(animal.responsable_id);
                animal.responsable = responsable || null;
            }

            return animal || null;
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    //Crear nuevo animal
    create: async (data) => {
        try {
            const sql = `
                INSERT INTO animal (
                    nombre, raza, edad, peso, descripcion, foto_url, estado, responsable_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            const result = await query(sql, [
                data.nombre,
                data.raza,
                data.edad,
                data.peso || null,
                data.descripcion || null,
                data.foto_url || null,
                data.estado || 'disponible',
                data.responsable_id || null
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

    //Actualizar animal existente
    update: async (id, data) => {
        try {
            const sql = `
                UPDATE animal
                SET
                    nombre = ?,
                    raza = ?,
                    edad = ?,
                    peso = ?,
                    descripcion = ?,
                    foto_url = ?,
                    estado = ?,
                    responsable_id = ?
                WHERE id = ?
            `;
            const result = await query(sql, [
                data.nombre,
                data.raza,
                data.edad,
                data.peso || null,
                data.descripcion || null,
                data.foto_url || null,
                data.estado || 'disponible',
                data.responsable_id || null,
                id
            ]);

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    },

    //Eliminar animal
    delete: async (id) => {
        try {
            const sql = 'DELETE FROM animal WHERE id = ?';
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    //Obtener todos los animales de un responsable
    getByResponsable: async (responsableId) => {
        try {
            const sql = `
                SELECT
                    id,
                    nombre,
                    raza,
                    edad,
                    peso,
                    descripcion,
                    foto_url,
                    estado,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
                FROM animal
                WHERE responsable_id = ?
                ORDER BY fecha_registro DESC
            `;
            const results = await query(sql, [responsableId]);
            return results;
        } catch (error) {
            console.error('Error en getByResponsable:', error);
            throw error;
        }
    },

    //Buscar animales por estado (disponible, adoptado, etc.)
    getByEstado: async (estado) => {
        try {
            const sql = `
                SELECT
                    id,
                    nombre,
                    raza,
                    edad,
                    peso,
                    descripcion,
                    foto_url,
                    estado,
                    responsable_id,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
                FROM animal
                WHERE estado = ?
                ORDER BY fecha_registro DESC
            `;
            const results = await query(sql, [estado]);
            return results;
        } catch (error) {
            console.error('Error en getByEstado:', error);
            throw error;
        }
    }
};

module.exports = animalModel;