// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const refugioRoutes = require('./controllers/refugioController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (HTML, JS, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/api', refugioRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});