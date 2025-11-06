// config/db.js
const mysql = require('mysql2/promise'); //versión de MySQL2 que usa promesas, lo que permite
require('dotenv').config(); //carga variables de entorno desde un archivo .env (credenciales DB).

// Configuración del pool de conexiones
/*
   Dato: Un pool (grupo de conexiones).
   Mantiene abiertas varias conexiones a la base de datos para reutilizarlas, 
   en lugar de abrir una nueva cada vez.
*/
const pool = mysql.createPool({
    //Se leen desde .env para no exponer datos sensibles.
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    //Puerto del servidor MySQL (por defecto 3306).
    port: process.env.DB_PORT || 3306,
    //Si no hay conexiones disponibles, espera hasta que una se libere.
    waitForConnections: true,
    //Máximo 10 conexiones simultáneas.
    connectionLimit: 10,        
    //Permite colas ilimitadas de peticiones si todas las conexiones están ocupadas.
    queueLimit: 0,    
    //Mantiene vivas las conexiones inactivas (evita desconexiones).          
    enableKeepAlive: true,  
    //No espera para iniciar el keep-alive.    
    keepAliveInitialDelay: 0
});

/* 
    📊 Ejemplo:
        Si 20 usuarios hacen peticiones al mismo tiempo, 
        el pool gestiona hasta 10 conexiones reales con la BD, y el resto espera en cola.
*/

// Función para probar la conexión | Intenta obtener una conexión desde el pool.
const testConnection = async () => {
    //Si lo logra:
    try {
        const connection = await pool.getConnection(); //Esta función se usa en el server.js antes de iniciar el servidor
        //💡 Así nos aseguramos de que el servidor no arranque si la base de datos no está disponible.
        console.log('✅ Conexión exitosa a MySQL');
        console.log(`📊 Base de datos: ${process.env.DB_NAME}`);
        console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
        connection.release();
        return true;

    //Si falla:
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
const query = async (sql, params) => { //params es un array con los valores para los placeholders ? en la consulta SQL.
    try {
        //Ejecuta la consulta SQL con los parámetros dados.
        const [results] = await pool.execute(sql, params);
        return results;
    } catch (error) { //Si hay error:
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

// Si ejecutas este archivo directamente, prueba la conexión | 💡 Esto es muy útil para probar la conexión sin levantar todo el servidor.
if (require.main === module) {
    testConnection().then(() => {
        process.exit(0); //Salir si todo bien.
    });
}