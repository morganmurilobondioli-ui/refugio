// models/adopcionModel.js
const { query } = require('../config/db');

const adopcionModel = {
    
    // Obtener todas las adopciones con información completa
    getAll: async () => {
        try {
            const sql = `
                SELECT 
                    a.id,
                    a.fecha_adopcion,
                    a.compromiso_url,
                    DATE_FORMAT(a.fecha_registro, '%d/%m/%Y %H:%i') as fecha_registro,
                    an.id as animal_id,
                    an.nombre as animal_nombre,
                    an.raza as animal_raza,
                    an.foto_url as animal_foto,
                    d.id as duenio_id,
                    d.nombre as duenio_nombre,
                    d.apellido as duenio_apellido,
                    d.telefono as duenio_telefono,
                    d.email as duenio_email
                FROM adopcion a
                INNER JOIN animal an ON a.animal_id = an.id
                INNER JOIN duenio d ON a.duenio_id = d.id
                ORDER BY a.fecha_adopcion DESC
            `;
            const results = await query(sql);
            return results;
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    },

    // Obtener adopción por ID
    getById: async (id) => {
        try {
            const sql = `
                SELECT 
                    a.id,
                    a.fecha_adopcion,
                    a.compromiso_url,
                    DATE_FORMAT(a.fecha_registro, '%d/%m/%Y %H:%i') as fecha_registro,
                    an.id as animal_id,
                    an.nombre as animal_nombre,
                    an.raza as animal_raza,
                    an.edad as animal_edad,
                    an.peso as animal_peso,
                    an.foto_url as animal_foto,
                    d.id as duenio_id,
                    d.nombre as duenio_nombre,
                    d.apellido as duenio_apellido,
                    d.telefono as duenio_telefono,
                    d.email as duenio_email
                FROM adopcion a
                INNER JOIN animal an ON a.animal_id = an.id
                INNER JOIN duenio d ON a.duenio_id = d.id
                WHERE a.id = ?
            `;
            const results = await query(sql, [id]);
            return results[0] || null;
        } catch (error) {
            console.error('Error en getById:', error);
            throw error;
        }
    },

    // Obtener adopciones por animal
    getByAnimal: async (animalId) => {
        try {
            const sql = `
                SELECT 
                    a.id,
                    a.fecha_adopcion,
                    d.nombre,
                    d.apellido,
                    d.telefono
                FROM adopcion a
                INNER JOIN duenio d ON a.duenio_id = d.id
                WHERE a.animal_id = ?
                ORDER BY a.fecha_adopcion DESC
            `;
            const results = await query(sql, [animalId]);
            return results;
        } catch (error) {
            console.error('Error en getByAnimal:', error);
            throw error;
        }
    },

    // Obtener adopciones por dueño
    getByDuenio: async (duenioId) => {
        try {
            const sql = `
                SELECT 
                    a.id,
                    a.fecha_adopcion,
                    an.nombre,
                    an.raza,
                    an.foto_url
                FROM adopcion a
                INNER JOIN animal an ON a.animal_id = an.id
                WHERE a.duenio_id = ?
                ORDER BY a.fecha_adopcion DESC
            `;
            const results = await query(sql, [duenioId]);
            return results;
        } catch (error) {
            console.error('Error en getByDuenio:', error);
            throw error;
        }
    },

    // Verificar si un animal ya está adoptado
    isAnimalAdoptado: async (animalId) => {
        try {
            const sql = 'SELECT estado FROM animal WHERE id = ?';
            const results = await query(sql, [animalId]);
            
            if (results.length === 0) {
                throw new Error('Animal no encontrado');
            }
            
            return results[0].estado === 'adoptado';
        } catch (error) {
            console.error('Error en isAnimalAdoptado:', error);
            throw error;
        }
    },

    create: async (data) => {
        const connection = await require('../config/db').pool.getConnection();
        
        try {
            // Iniciar transacción
            await connection.beginTransaction();

            // 1. Verificar que el animal existe y está disponible
            const [animal] = await connection.execute(
                'SELECT estado FROM animal WHERE id = ?',
                [data.animal_id]
            );

            if (animal.length === 0) {
                throw new Error('El animal no existe');
            }

            if (animal[0].estado !== 'disponible') {
                throw new Error('El animal no está disponible para adopción');
            }

            // 2. Verificar que el dueño existe
            const [duenio] = await connection.execute(
                'SELECT id FROM duenio WHERE id = ?',
                [data.duenio_id]
            );

            if (duenio.length === 0) {
                throw new Error('El dueño no existe');
            }

            // 3. Crear la adopción
            const [result] = await connection.execute(
                `INSERT INTO adopcion (animal_id, duenio_id, fecha_adopcion)
                VALUES (?, ?, ?)`,
                [
                    data.animal_id,
                    data.duenio_id,
                    data.fecha_adopcion
                ]
            );

            // 4. ✅ CAMBIAR ESTADO A 'en_proceso' en lugar de 'adoptado'
            await connection.execute(
                "UPDATE animal SET estado = 'en_proceso' WHERE id = ?",
                [data.animal_id]
            );

            // Confirmar transacción
            await connection.commit();
            
            return result.insertId;
        } catch (error) {
            // Revertir cambios si hay error
            await connection.rollback();
            console.error('Error en create:', error);
            throw error;
        } finally {
            connection.release();
        }
    },

    // AGREGAR método para actualizar compromiso_url
    updateCompromisoUrl: async (id, compromisoUrl) => {
        try {
            const sql = 'UPDATE adopcion SET compromiso_url = ? WHERE id = ?';
            const result = await query(sql, [compromisoUrl, id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en updateCompromisoUrl:', error);
            throw error;
        }
    },


    // Eliminar adopción (con transacción para revertir estado del animal)
    delete: async (id) => {
        const connection = await require('../config/db').pool.getConnection();
        
        try {
            // Iniciar transacción
            await connection.beginTransaction();

            // 1. Obtener el animal_id antes de eliminar
            const [adopcion] = await connection.execute(
                'SELECT animal_id, compromiso_url FROM adopcion WHERE id = ?',
                [id]
            );

            if (adopcion.length === 0) {
                throw new Error('Adopción no encontrada');
            }

            const animalId = adopcion[0].animal_id;
            const compromisoUrl = adopcion[0].compromiso_url;

            // 2. Eliminar la adopción
            await connection.execute('DELETE FROM adopcion WHERE id = ?', [id]);

            // 3. Cambiar estado del animal a 'disponible'
            await connection.execute(
                "UPDATE animal SET estado = 'disponible' WHERE id = ?",
                [animalId]
            );

            // Confirmar transacción
            await connection.commit();
            
            return { success: true, compromisoUrl };
        } catch (error) {
            // Revertir cambios si hay error
            await connection.rollback();
            console.error('Error en delete:', error);
            throw error;
        } finally {
            connection.release();
        }
    }
};

module.exports = adopcionModel;