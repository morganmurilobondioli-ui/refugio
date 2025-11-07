const express = require('express'); // Framework principal para crear el servidor.
const cors = require('cors'); // Middleware para permitir solicitudes desde otros dominios.
const path = require('path'); // Módulo nativo de Node para manejar rutas de archivos/directorios.
require('dotenv').config(); // Carga variables de entorno desde un archivo .env (por ejemplo, puerto, credenciales DB).

const { testConnection } = require('./config/db'); // Verifica que la base de datos MySQL esté conectando correctamente.

// Importar rutas
const responsableRoutes = require('./routes/responsableRoutes'); // Rutas relacionadas con responsables.
const animalRoutes = require('./routes/animalRoutes'); 
const duenioRoutes = require('./routes/duenioRoutes');
const adopcionRoutes = require('./routes/adopcionRoutes');

const app = express(); // app es tu instancia principal del servidor Express.
const PORT = process.env.PORT || 3000; // PORT usa una variable de entorno (.env), o por defecto el 3000.

// Middlewares
app.use(cors());
app.use(express.json()); // Permite leer cuerpos JSON en peticiones POST/PUT.
app.use(express.urlencoded({ extended: true })); // Permite leer datos enviados desde formularios HTML.
app.use(express.static('public')); // Sirve archivos estáticos (HTML, CSS, JS, imágenes, etc.) desde la carpeta public/.
app.use('/uploads', express.static('uploads')); // Sirve los archivos subidos por el usuario desde /uploads.

// Rutas de la API
app.use('/api/responsables', responsableRoutes);
app.use('/api/animales', animalRoutes);
app.use('/api/duenios', duenioRoutes);
app.use('/api/adopciones', adopcionRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ API funcionando correctamente',
        timestamp: new Date()
    });
});

// Middleware de manejo de errores 404 | Si ninguna ruta coincide, Express llega hasta aquí.
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Ruta no encontrada: ${req.originalUrl}` // 🔍 Muestra cuál fue la ruta no encontrada
    });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        await testConnection(); // ✅ Verifica conexión DB
        app.listen(PORT, () => {
            console.log('🚀 Servidor corriendo en:');
            console.log(`   http://localhost:${PORT}`);
            console.log(`📁 Sirviendo archivos desde: public/`);
            console.log('📡 Rutas disponibles:');
            console.log('   GET    /api/responsables');
            console.log('   GET    /api/responsables/:id');
            console.log('   POST   /api/responsables');
            console.log('   PUT    /api/responsables/:id');
            console.log('   DELETE /api/responsables/:id');
            console.log('-------------------------------------------');
            console.log('   GET    /api/animales');
            console.log('   GET    /api/animales/:id');
            console.log('   POST   /api/animales');
            console.log('   PUT    /api/animales/:id');
            console.log('   DELETE /api/animales/:id');
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor:', error.message);
        process.exit(1); 
    }
};

startServer();

// Captura promesas rechazadas no manejadas
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
    process.exit(1);
});

/* 
Nota: 
    Esto evita que el servidor se quede en un estado inconsistente.
    Luego detiene el proceso de forma controlada.
*/
