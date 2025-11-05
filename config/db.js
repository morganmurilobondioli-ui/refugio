// config/db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'refugio_Don_Pepito'
});

connection.connect((err) => {
  if (err) {
    console.error('Error de conexión a la BD:', err);
    return;
  }
  console.log('Conectado a la base de datos refugio_Don_Pepito');
});

module.exports = connection;