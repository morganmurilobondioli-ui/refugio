const { query } = require('../config/db'); //query es una función que ejecuta sentencias SQL en la base de datos y devuelve una promesa (por eso usamos await más adelante).


//Cada función se encarga de una operación específica (CRUD: Crear, Leer, Actualizar, Eliminar) y algunas extras.
const responsableModel = { //objeto que agrupa todas las funciones relacionadas con la tabla responsable.
    
    // Obtener todos los responsables
    getAll: async () => {  //async permite usar await dentro.
        try {
          // Sentencia SQL para obtener todos los responsables
            const sql = `
                SELECT 
                    id,
                    nombre,
                    apellido,
                    telefono,
                    email,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y %H:%i') as fecha_registro
                FROM responsable
                ORDER BY fecha_registro DESC
            `;
            //Nota: DATE_FORMAT convierte la fecha a formato legible tipo 25/10/2025 13:45.
            const results = await query(sql);
            return results;
        } catch (error) {
            console.error('Error en getAll:', error);
            throw error;
        }
    },

    // Obtener responsable por ID
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
                FROM responsable
                WHERE id = ?
            `;
            /*
              Nota: ? es un placeholder para prevenir inyección SQL.
              [id] es el array de parámetros a reemplazar en los ?. 
            */
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
            let sql = 'SELECT id FROM responsable WHERE email = ?';
            const params = [email];
            //El excludeId se usa para actualizar, para no contar el email del mismo registro.
            if (excludeId) {
                sql += ' AND id != ?';
                params.push(excludeId);
            }
            //Devuelve true si existe otro registro con ese email.
            const results = await query(sql, params);
            return results.length > 0;
        } catch (error) {
            console.error('Error en existsByEmail:', error);
            throw error;
        }
    },

    // Crear nuevo responsable: Devuelve el id del nuevo responsable creado.
    create: async (data) => {
        try {
            const sql = `
                INSERT INTO responsable (nombre, apellido, telefono, email)
                VALUES (?, ?, ?, ?)
            `;
            //Si algún campo no está definido, pone null (evita errores).
            const result = await query(sql, [
                data.nombre,
                data.apellido,
                data.telefono || null,
                data.email || null
            ]);
            //result.insertId devuelve el id autogenerado del nuevo registro.
            return result.insertId;
        } catch (error) {
            console.error('Error en create:', error);
            throw error;
        }
    },

    // Actualizar responsable: Devuelve true si se actualizó, false si no encontró el registro.
    update: async (id, data) => {
        try {
            const sql = `
                UPDATE responsable
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
            //Nota: affectedRows > 0 indica si realmente se actualizó algo.
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en update:', error);
            throw error;
        }
    },

    // Eliminar responsable: Devuelve true si se eliminó, o lanza un error si no puede.
    delete: async (id) => {
        try {
            // Verificar si tiene animales asociados
            const checkSql = 'SELECT COUNT(*) as count FROM animal WHERE responsable_id = ?';
            const checkResult = await query(checkSql, [id]);
            //Primero verifica si el responsable tiene animales asignados. Si los tiene, lanza un error (se captura en el controlador).
            if (checkResult[0].count > 0) {
                throw new Error('No se puede eliminar. El responsable tiene animales asociados.');
            }
            //Si no, ejecuta el DELETE.
            const sql = 'DELETE FROM responsable WHERE id = ?';
            const result = await query(sql, [id]);
            //Nota: affectedRows > 0 confirma si realmente se eliminó algo.
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Error en delete:', error);
            throw error;
        }
    },

    // Obtener animales de un responsable: Devuelve un array de animales asociados.
    //Muestra todos los animales que pertenecen al responsable indicado y los ordena por la fecha de registro más reciente.
    getAnimales: async (responsableId) => {
        try {
            const sql = `
                SELECT 
                    id,
                    nombre,
                    raza,
                    estado,
                    DATE_FORMAT(fecha_registro, '%d/%m/%Y') as fecha_registro
                FROM animal
                WHERE responsable_id = ?
                ORDER BY fecha_registro DESC
            `;
            const results = await query(sql, [responsableId]);
            return results;
        } catch (error) {
            console.error('Error en getAnimales:', error);
            throw error;
        }
    }
};

//Al final se exporta para poder usarlo en los controladores:
module.exports = responsableModel;