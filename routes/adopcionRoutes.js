// routes/adopcionRoutes.js
const express = require('express');
const router = express.Router();
const adopcionController = require('../controllers/adopcionController');


// Rutas de adopciones
router.get('/', adopcionController.obtenerAdopciones);
router.get('/:id', adopcionController.obtenerAdopcion);
router.get('/:id/descargar', adopcionController.descargarCompromiso); 
router.post('/', adopcionController.crearAdopcion); 
router.delete('/:id', adopcionController.eliminarAdopcion);
router.put('/:id/finalizar', adopcionController.finalizarAdopcion);
router.post('/cita', adopcionController.crearCitaAdopcion);

module.exports = router;