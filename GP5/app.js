// Importando o módulo Express.js
const express = require('express');
const app = express();
const port = 3000;

// Importando o módulo body-parser para lidar com dados JSON e URL-encoded no corpo das requisições
const bodyParser = require('body-parser');

// Importando as rotas definidas em outro arquivo (presumivelmente './routes')
const routes = require('./routes');

// Configurando o uso do body-parser para lidar com JSON e URL-encoded
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configurando cabeçalhos de resposta para permitir requisições de qualquer origem (CORS)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Servindo arquivos estáticos a partir do diretório 'public' quando as URLs começam com '/GP5/public'
app.use('/GP5/public', express.static('public'));

// Usando as rotas definidas no arquivo importado
app.use(routes);

// Inicializando o servidor Express na porta especificada
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

// Configurações MQTT e banco de dados SQLite
const mqttBrokerUrl = 'wss://mqtt-dashboard.com:8884/mqtt';
const mqttClientId = 'clientId-zp6TCxjTBz';
const mqttTopic = 'INTELI-RNP-M4T08-GP5';
const dbFilePath = 'public/viagens.db';

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(dbFilePath);

// Função para lidar com mensagens MQTT recebidas
const handleMqttMessage = (topic, message) => {
  const dataHora = new Date().toISOString();
  const parts = message.toString().split(',').map(part => part.trim());
  if (parts.length === 3 && !isNaN(parseFloat(parts[1])) && !isNaN(parseFloat(parts[2]))) {
    const [codigoAtivo, latitude, longitude] = parts;
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

// Importando e configurando o cliente MQTT
const mqtt = require('mqtt');
const client = mqtt.connect(mqttBrokerUrl, { clientId: mqttClientId });

let isSubscribed = false;

// Lidando com a conexão MQTT bem-sucedida
client.on('connect', () => {
  console.log(`Conectado ao broker MQTT: ${mqttBrokerUrl}`);
  if (!isSubscribed) {
    client.subscribe(mqttTopic, (err) => {
      if (!err) {
        isSubscribed = true;
        console.log(`Inscrito no tópico MQTT: ${mqttTopic}`);
      } else {
        console.error('Erro ao se inscrever no tópico MQTT:', err);
      }
    });
  }
});

// Lidando com mensagens MQTT recebidas
client.on('message', handleMqttMessage);

// Lidando com erros de conexão MQTT
client.on('error', (error) => {
  if (error.code === 'ERR_SOCKET_CONNECTION_TIMEOUT') {
    console.log('Falha na conexão MQTT, tentando novamente...');
  } else {
    console.error('Erro na conexão MQTT:', error);
  }
});

// Lidando com o sinal SIGINT (Ctrl+C) para encerrar o servidor e fechar o banco de dados
process.on('SIGINT', () => {
  console.log('Desconectando do broker MQTT e fechando o banco de dados.');
  client.end();
  db.close();
  process.exit(0);
});
