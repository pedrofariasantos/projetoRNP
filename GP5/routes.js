const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.json());


const fs = require('fs');



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


router.get('/comecar_viagem/:codigo_ativo?', (req, res) => {
    const codigo_ativo = req.params.codigo_ativo || '';

    fs.readFile(path.join(__dirname, 'public/comecar.html'), 'utf8', function (err, html) {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao carregar a página');
        }

        // Injeta o código ativo no HTML
        const modifiedHtml = html.replace('<!--INJETAR_CODIGO_ATIVO-->', `<script>document.addEventListener('DOMContentLoaded', function() { document.getElementById('assetCodeInput').value = '${codigo_ativo}'; });</script>`);

        res.send(modifiedHtml);
    });
});

router.post('/comecar_viagem/:codigo_ativo?', (req, res) => {
    let { startCity, endCity, assetCode, dataHoraInicio, viagemFinalizada } = req.body;
    const codigo_ativo = req.params.codigo_ativo;

    // Se o código_ativo está presente na URL, use-o em vez do valor do corpo da requisição
    if (codigo_ativo) {
        assetCode = codigo_ativo;
    }

    // Aqui você insere os dados no banco de dados
    const sql = `INSERT INTO trips (local_saida, destino, codigo_ativo, data_hora_inicio, viagem_finalizada) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [startCity, endCity, assetCode, dataHoraInicio, viagemFinalizada], function (err) {
        if (err) {
            return console.error(err.message);
        }
        res.send({ message: "Viagem iniciada com sucesso!" });
    });
});



// Rota para servir a página do mapa
// Rota para servir a página do mapa
router.get('/mapa/:codigo_ativo/:data_hora_inicio/:data_hora_final?', (req, res) => {
    let { codigo_ativo, data_hora_inicio, data_hora_final } = req.params;
    let sql;
    let params = [codigo_ativo, data_hora_inicio];

    if (data_hora_final) {
        sql = 'SELECT latitude, longitude, data_hora FROM locs WHERE codigo_ativo = ? AND data_hora >= ? AND data_hora <= ?';
        params.push(data_hora_final);
    } else {
        sql = 'SELECT latitude, longitude, data_hora FROM locs WHERE codigo_ativo = ? AND data_hora >= ?';
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Erro ao buscar dados de localização');
        }

        fs.readFile(path.join(__dirname, 'public/mapa.html'), 'utf8', (err, html) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Erro ao carregar a página do mapa');
            }

            const modifiedHtml = html.replace('var locData = [];', `var locData = ${JSON.stringify(rows)};`);
            res.send(modifiedHtml);
        });
    });
});



// Rota para servir a página de registrar ativo
router.get('/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/registrar.html'));
});

// Rota para buscar dados
function filtrarViagens(req, res) {
    const { local_saida, destino, codigo_ativo, viagemFinalizada } = req.query;

    let sql = 'SELECT * FROM trips';
    let params = [];
    let conditions = [];

    if (local_saida) {
        conditions.push("local_saida LIKE ?");
        params.push(`%${local_saida}%`);
    }
    if (destino) {
        conditions.push("destino LIKE ?");
        params.push(`%${destino}%`);
    }
    if (codigo_ativo) {
        conditions.push("codigo_ativo = ?");
        params.push(codigo_ativo);
    }
    if (viagemFinalizada !== undefined) {
        conditions.push("viagem_finalizada = ?");
        params.push(viagemFinalizada);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: err.message });
            return;
        }
        res.json(rows);
    });
}

// Rota para servir a página de viagem e buscar dados
router.get('/viagem', (req, res) => {
    if (Object.keys(req.query).length === 0) {
        res.sendFile(path.join(__dirname, 'public/viagem.html'));
    } else {
        filtrarViagens(req, res);
    }
});

// Rota para servir a página de entrega e buscar dados
router.get('/entrega', (req, res) => {
    // Se houver parâmetros de consulta, filtrar viagens
    if (Object.keys(req.query).length > 0) {
        filtrarViagens(req, res);
    } else {
        // Se não houver parâmetros de consulta, enviar arquivo HTML
        res.sendFile(path.join(__dirname, 'public/entrega.html'));
    }
});

// Rota para finalizar viagens
router.post('/entrega', (req, res) => {
    const { idViagem } = req.body;
    // Use a função strftime do SQLite para formatar a data e hora no formato ISO 8601
    const sql = "UPDATE trips SET viagem_finalizada = 1, data_hora_final = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id_viagem = ?";
    db.run(sql, [idViagem], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).send({ error: err.message });
            return;
        }
        res.json({ message: 'Viagem finalizada com sucesso!' });
    });
});

module.exports = router;