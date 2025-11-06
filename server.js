// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Servir archivos subidos
app.use('/uploads', express.static('uploads'));

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        message: '✅ API funcionando correctamente',
        timestamp: new Date()
    });
});

// Iniciar servidor
const startServer = async () => {
    try {
        // Probar conexión a BD antes de iniciar
        await testConnection();
        
        app.listen(PORT, () => {
            console.log('🚀 Servidor corriendo en:');
            console.log(`   http://localhost:${PORT}`);
            console.log(`📁 Sirviendo archivos desde: public/`);
        });
    } catch (error) {
        console.error('❌ No se pudo iniciar el servidor:', error.message);
        process.exit(1);
    }
};

startServer();

// Manejo de errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('❌ Error no manejado:', error);
    process.exit(1);
});