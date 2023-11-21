const express = require('express');
const path = require('path');
const router = express.Router();

// Definições de rotas
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/GP5.html'));
});

router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/home.html'));
});

router.get('/comecar_viagem', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/comecar.html'));
});

router.get('/entrega', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/entrega.html'));
});
module.exports = router;
