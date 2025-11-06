// config/db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración del pool de conexiones
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,        // Máximo 10 conexiones simultáneas
    queueLimit: 0,              // Sin límite de cola
    enableKeepAlive: true,      // Mantener conexiones vivas
    keepAliveInitialDelay: 0
});

// Función para probar la conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a MySQL');
        console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
        console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error al conectar a MySQL:', error.message);
        console.error('💡 Verifica:');
        console.error('   - MySQL está corriendo');
        console.error('   - Credenciales en .env son correctas');
        console.error('   - La base de datos existe');
        return false;
    }
};

// Función helper para ejecutar queries con manejo de errores
const query = async (sql, params) => {
    try {
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) {
        console.error('❌ Error en query:', error.message);
        throw error;
    }
};

// Exportar pool y funciones
module.exports = {
    pool,
    query,
    testConnection
};

// Si ejecutas este archivo directamente, prueba la conexión
if (require.main === module) {
    testConnection().then(() => {
        process.exit(0);
    });
}