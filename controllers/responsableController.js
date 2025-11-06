//Se importa el archivo que contiene las funciones que interactúan directamente con la base de datos (getAll, getById, create, update, delete, etc.).
const responsableModel = require('../models/responsableModel');

//Se creo un objeto con varios métodos asíncronos.
//Cada método se asocia con una ruta HTTP específica (GET, POST, PUT, DELETE).
const responsableController = {

    // GET /api/responsables - Obtener todos
    obtenerResponsables: async (req, res) => {
      /*
        Llama al método del modelo getAll() → obtiene todos los responsables.
          Envía una respuesta en formato JSON con:
            success: true (indica que salió bien),
            data (los resultados),
            total (cantidad de registros).
          Si hay error, devuelve un status(500) (error interno del servidor) con un mensaje.
      */
        try {
            const responsables = await responsableModel.getAll();
            res.json({
                success: true,
                data: responsables,
                total: responsables.length
            });
        } catch (error) {
            console.error('Error al obtener responsables:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener responsables',
                error: error.message
            });
        }
    },

    // GET /api/responsables/:id - Obtener uno: Devuelve un JSON con el responsable y su lista de animales.
    //Extrae el id del parámetro de la URL y usa el modelo para obtener el responsable correspondiente.
    obtenerResponsable: async (req, res) => {
        try {
            const { id } = req.params;
            const responsable = await responsableModel.getById(id);
            
            if (!responsable) {
                return res.status(404).json({
                    success: false,
                    message: 'Responsable no encontrado'
                });
            }

            // Si existe, también obtiene sus animales (getAnimales(id)).
            const animales = await responsableModel.getAnimales(id);

            res.json({
                success: true,
                data: {
                    ...responsable,
                    animales
                }
            });
          // Si no existe, devuelve error 404 (“no encontrado”).
        } catch (error) {
            console.error('Error al obtener responsable:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener responsable',
                error: error.message
            });
        }
    },

    // POST /api/responsables - Crear | Valida los datos que envía el cliente
    crearResponsable: async (req, res) => {
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
                const emailExists = await responsableModel.existsByEmail(email);
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
            }

            // Crear responsable
            const responsableId = await responsableModel.create({
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono ? telefono.trim() : null,
                email: email ? email.trim().toLowerCase() : null
            });

            // Obtener el responsable creado
            const nuevoResponsable = await responsableModel.getById(responsableId);

            res.status(201).json({
                success: true,
                message: 'Responsable creado exitosamente',
                data: nuevoResponsable
            });
        } catch (error) {
            console.error('Error al crear responsable:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear responsable',
                error: error.message
            });
        }
    },

    // PUT /api/responsables/:id - Actualizar
    actualizarResponsable: async (req, res) => {
      /*
        Verifica si el responsable existe (getById).
          Si no, responde con 404.
          Valida que tenga nombre y apellido.
          Si hay email, lo valida igual que antes.
        Además, revisa si el email está duplicado excluyendo el actual
      */
        try {
            const { id } = req.params;
            const { nombre, apellido, telefono, email } = req.body;

            // Verificar que existe
            const responsableExiste = await responsableModel.getById(id);
            if (!responsableExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Responsable no encontrado'
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
                const emailExists = await responsableModel.existsByEmail(email, id);
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'El email ya está registrado'
                    });
                }
            }

            // Actualizar
            await responsableModel.update(id, {
                nombre: nombre.trim(),
                apellido: apellido.trim(),
                telefono: telefono ? telefono.trim() : null,
                email: email ? email.trim().toLowerCase() : null
            });

            // Obtener actualizado
            const responsableActualizado = await responsableModel.getById(id);

            res.json({
                success: true,
                message: 'Responsable actualizado exitosamente',
                data: responsableActualizado
            });
        } catch (error) {
            console.error('Error al actualizar responsable:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar responsable',
                error: error.message
            });
        }
    },

    // DELETE /api/responsables/:id - Eliminar | comprueba si el responsable existe (getById).
    eliminarResponsable: async (req, res) => {
        try {
            const { id } = req.params;

            // Verificar que existe
            const responsableExiste = await responsableModel.getById(id);
            if (!responsableExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Responsable no encontrado'
                });
            }

            // Intentar eliminar, llama al modelo delete(id).
            await responsableModel.delete(id);

            res.json({
                success: true,
                message: 'Responsable eliminado exitosamente'
            });
        } catch (error) {
            // Si el error es por animales asociados
            if (error.message.includes('animales asociados')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }

            console.error('Error al eliminar responsable:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar responsable',
                error: error.message
            });
        }
    }
};

module.exports = responsableController;