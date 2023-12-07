const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());

// Abre a conexão com o banco de dados
let db = new sqlite3.Database('public/viagens.db', sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado ao banco de dados viagens.db');
    }
});

// Rota para servir a página principal
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/home.html'));
});

// Rota para servir a página de viagem
router.get('/viagem', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viagem.html'));
});

router.get('/comecar_viagem/:numero?', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/comecar.html'));
});

router.post('/comecar_viagem/:numero?', (req, res) => {
    let { startCity, endCity, assetCode, dataHoraInicio, viagemFinalizada } = req.body;
    const numero = req.params.numero;

    // Se o número está presente na URL, use-o em vez do valor do corpo da requisição
    if (numero) {
        assetCode = numero;
    }

    // Aqui você insere os dados no banco de dados
    const sql = `INSERT INTO trips (local_saida, destino, codigo_ativo, data_hora_inicio, viagem_finalizada) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [startCity, endCity, assetCode, dataHoraInicio, viagemFinalizada], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.send({ message: "Viagem iniciada com sucesso!" });
    });
});

// Rota para servir a página de entrega
router.get('/entrega', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/entrega.html'));
});

// Rota para servir a página do mapa
router.get('/mapa', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/mapa.html'));
});


module.exports = router;
