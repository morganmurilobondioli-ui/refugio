const express = require('express');
const router = express.Router();
const responsableController = require('../controllers/responsableController');

// Rutas de responsables
router.get('/', responsableController.obtenerResponsables);
router.get('/:id', responsableController.obtenerResponsable);
router.post('/', responsableController.crearResponsable);
router.put('/:id', responsableController.actualizarResponsable);
router.delete('/:id', responsableController.eliminarResponsable);

module.exports = router;