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

// Rota para servir a página de viagem
router.get('/viagem', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/viagem.html'));
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

// Rota para servir a página de registrar ativo
router.get('/registrar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/registrar.html'));
});


module.exports = router;




//teste

const mqtt = require('mqtt');

// Configurações MQTT
const mqttBrokerUrl = 'wss://mqtt-dashboard.com:8884/mqtt'; // Endereço do broker MQTT
const mqttClientId = 'clientId-zp6TCxjTBz'; // ID do cliente MQTT
const mqttTopic = 'teste123dz'; // Tópico MQTT
// Caminho completo para o banco de dados SQLite
const dbFilePath = 'public/viagens.db';
// Conectar ao banco de dados SQLite
// Tratar mensagens recebidas do MQTT
const handleMqttMessage = (topic, message) => {
  const dataHora = new Date().toISOString(); // Data e hora atual
  // Parse da mensagem recebida (assumindo que a mensagem está no formato 'LAT_EXEMPLO, LONG_EXEMPLO')
  const coords = message.toString().split(',').map(coord => parseFloat(coord.trim()));
  if (coords.length === 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
    const [latitude, longitude] = coords;
    // Inserir dados na tabela 'locs' do banco de dados SQLite
    db.run(
      'INSERT INTO locs (latitude, longitude, trip_id, data_hora) VALUES (?, ?, ?, ?)',
      [latitude, longitude, 1, dataHora],
      (err) => {
        if (err) {
          console.error('Erro ao inserir dados no banco de dados:', err.message);
        } else {
          console.log(`Dados inseridos no banco de dados: Latitude ${latitude}, Longitude ${longitude}, Data/Hora ${dataHora}`);
        }
      }
    );
  } else {
    console.log('Mensagem MQTT ignorada: Formato inválido ou não contém coordenadas.');
  }
};
// Conectar ao broker MQTT
const client = mqtt.connect(mqttBrokerUrl, { clientId: mqttClientId });
// Subscrever ao tópico MQTT
client.on('connect', () => {
  console.log(`Conectado ao broker MQTT: ${mqttBrokerUrl}`);
  client.subscribe(mqttTopic, (err) => {
    if (!err) {
      console.log(`Inscrito no tópico MQTT: ${mqttTopic}`);
    } else {
      console.error('Erro ao se inscrever no tópico MQTT:', err);
    }
  });
});
// Lidar com mensagens MQTT recebidas
client.on('message', handleMqttMessage);
// Lidar com erros de conexão MQTT
client.on('error', (error) => {
  console.error('Erro na conexão MQTT:', error);
});
// Processo principal do programa
process.on('SIGINT', () => {
  console.log('Desconectando do broker MQTT e fechando o banco de dados.');
  client.end();
  db.close();
  process.exit(0);
});