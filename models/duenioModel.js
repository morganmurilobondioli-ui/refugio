// models/duenioModel.js
const { query } = require('../config/db');

const duenioModel = {
    
    // Obtener todos los dueños
    getAll: async () => {
        try {
            const sql = `
                SELECT 
                    id,
                    nombre,
                    apellido,
                    telefono,
                    email,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y %H:%i') as fecha_registro
                FROM duenio
                ORDER BY fecha_registro DESC
            `;
            const results = await query(sql);
            return results;
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    },

    // Obtener dueño por ID
    getById: async (id) => {
        try {
            const sql = `
                SELECT 
                    id,
                    nombre,
                    apellido,
                    telefono,
                    email,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y %H:%i') as fecha_registro
                FROM duenio
                WHERE id = ?
            `;
            const results = await query(sql, [id]);
            return results[0] || null;
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    // Verificar si el email ya existe
    existsByEmail: async (email, excludeId = null) => {
        try {
            let sql = 'SELECT id FROM duenio WHERE email = ?';
            const params = [email];
            
            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }
            
            const results = await query(sql, params);
            return results.length > 0;
        } catch (error) {
            console.error('Error en existsByEmail:', error);
            throw error;
        }
    },

    // Crear nuevo dueño
    create: async (data) => {
        try {
            const sql = `
                INSERT INTO duenio (nombre, apellido, telefono, email)
                VALUES (?, ?, ?, ?)
            `;
            const result = await query(sql, [
                data.nombre,
                data.apellido,
                data.telefono || null,
                data.email || null
            ]);
            return result.insertId;
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

    // Actualizar dueño
    update: async (id, data) => {
        try {
            const sql = `
                UPDATE duenio
                SET nombre = ?,
                    apellido = ?,
                    telefono = ?,
                    email = ?
                WHERE id = ?
            `;
            const result = await query(sql, [
                data.nombre,
                data.apellido,
                data.telefono || null,
                data.email || null,
                id
            ]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    },

    // Eliminar dueño
    delete: async (id) => {
        try {
            // Verificar si tiene adopciones
            const checkSql = 'SELECT COUNT(*) as count FROM adopcion WHERE duenio_id = ?';
            const checkResult = await query(checkSql, [id]);
            
            if (checkResult[0].count > 0) {
                throw new Error('No se puede eliminar. El dueño tiene adopciones registradas.');
            }

            const sql = 'DELETE FROM duenio WHERE id = ?';
            const result = await query(sql, [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    // Obtener adopciones de un dueño
    getAdopciones: async (duenioId) => {
        try {
            const sql = `
                SELECT 
                    a.id,
                    a.fecha_adopcion,
                    an.nombre as animal_nombre,
                    an.raza as animal_raza,
                    an.foto_url,
                    DATE_FORMAT(a.fecha_registro, '%d/%m/%Y') as fecha_registro
                FROM adopcion a
                INNER JOIN animal an ON a.animal_id = an.id
                WHERE a.duenio_id = ?
                ORDER BY a.fecha_adopcion DESC
            `;
            const results = await query(sql, [duenioId]);
            return results;
        } catch (error) {
            console.error('Error en getAdopciones:', error);
            throw error;
        }
    }
};

module.exports = duenioModel;