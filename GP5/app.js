const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const routes = require('./routes'); // Importe as rotas do arquivo 'routes.js'

app.use(bodyParser.json()); // para analisar application/json
app.use(bodyParser.urlencoded({ extended: true })); // para analisar application/x-www-form-urlencoded

// Configurar cabeçalhos CORS para permitir solicitações de qualquer origem
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permitir solicitações de qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept'); // Cabeçalhos permitidos
  next();
});

app.use('/GP5/public', express.static('public'));

// Use as rotas importadas do arquivo 'routes.js'
app.use(routes);

// O servidor começa a escutar na porta especificada
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});


// Configurações MQTT
const mqttBrokerUrl = 'wss://mqtt-dashboard.com:8884/mqtt'; // Endereço do broker MQTT
const mqttClientId = 'clientId-zp6TCxjTBz'; // ID do cliente MQTT
const mqttTopic = 'INTELI-RNP-M4T08-GP5'; // Tópico MQTT
// Caminho completo para o banco de dados SQLite
const dbFilePath = 'public/viagens.db';

// Conectar ao banco de dados SQLite
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFilePath);

// Tratar mensagens recebidas do MQTT
const handleMqttMessage = (topic, message) => {
  const dataHora = new Date().toISOString(); // Data e hora atual
  // Parse da mensagem recebida (formato 'CODIGO_ATIVO,LAT,LONG')
  const parts = message.toString().split(',').map(part => part.trim());
  if (parts.length === 3 && !isNaN(parseFloat(parts[1])) && !isNaN(parseFloat(parts[2]))) {
    const [codigoAtivo, latitude, longitude] = parts;
    // Inserir dados na tabela 'locs' do banco de dados SQLite
    db.run(
      'INSERT INTO locs (latitude, longitude, data_hora, codigo_ativo) VALUES (?, ?, ?, ?)',
      [parseFloat(latitude), parseFloat(longitude), dataHora, codigoAtivo],
      (err) => {
        if (err) {
          console.error('Erro ao inserir dados no banco de dados:', err.message);
        } else {
          console.log(`Dados inseridos no banco de dados: Código Ativo ${codigoAtivo}, Latitude ${latitude}, Longitude ${longitude}, Data/Hora ${dataHora}`);
        }
      }
    );
  } else {
    console.log('Mensagem MQTT ignorada: Formato não contém coordenadas válidas.');
  }
};

// Conectar ao broker MQTT
const mqtt = require('mqtt');
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
  if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
    console.log('Falha na conexão MQTT, tentando novamente...');
  } else {
    console.error('Erro na conexão MQTT:', error);
  }
});


// Processo principal do programa
process.on('SIGINT', () => {
  console.log('Desconectando do broker MQTT e fechando o banco de dados.');
  client.end();
  db.close();
  process.exit(0);
});
