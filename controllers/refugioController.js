// controllers/refugioController.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 🟢 Obtener todos los animales
router.get('/animales', (req, res) => {
  db.query('SELECT * FROM animal', (err, results) => {
    if (err) {
      console.error('Error al obtener animales:', err);
      res.status(500).json({ error: 'Error en el servidor' });
    } else {
      res.json(results);
    }
  });
});

// 🔵 Obtener un animal por ID
router.get('/animales/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM animal WHERE id = ?', [id], (err, result) => {
    if (err) res.status(500).json({ error: 'Error al obtener el animal' });
    else res.json(result[0]);
  });
});

// 🟡 Crear un nuevo animal
router.post('/animales', (req, res) => {
  const { id, nombre, raza, edad, peso, responsable_id } = req.body;
  const sql = 'INSERT INTO animal (id, nombre, raza, edad, peso, responsable_id) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [id, nombre, raza, edad, peso, responsable_id], (err) => {
    if (err) res.status(500).json({ error: 'Error al crear el animal' });
    else res.json({ message: 'Animal agregado exitosamente' });
  });
});

// 🟠 Actualizar animal
router.put('/animales/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, raza, edad, peso, responsable_id } = req.body;
  const sql = 'UPDATE animal SET nombre=?, raza=?, edad=?, peso=?, responsable_id=? WHERE id=?';
  db.query(sql, [nombre, raza, edad, peso, responsable_id, id], (err) => {
    if (err) res.status(500).json({ error: 'Error al actualizar el animal' });
    else res.json({ message: 'Animal actualizado correctamente' });
  });
});

// 🔴 Eliminar animal
router.delete('/animales/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM animal WHERE id = ?', [id], (err) => {
    if (err) res.status(500).json({ error: 'Error al eliminar el animal' });
    else res.json({ message: 'Animal eliminado correctamente' });
  });
});

module.exports = router;