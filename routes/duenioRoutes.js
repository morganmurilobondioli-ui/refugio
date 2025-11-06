// routes/duenioRoutes.js
const express = require('express');
const router = express.Router();
const duenioController = require('../controllers/duenioController');

// Rutas de dueños
router.get('/', duenioController.obtenerDuenios);
router.get('/:id', duenioController.obtenerDuenio);
router.post('/', duenioController.crearDuenio);
router.put('/:id', duenioController.actualizarDuenio);
router.delete('/:id', duenioController.eliminarDuenio);

module.exports = router;