const mqtt = require('mqtt');
const sqlite3 = require('sqlite3').verbose();
// Configurações MQTT
const mqttBrokerUrl = 'wss://mqtt-dashboard.com:8884/mqtt'; // Endereço do broker MQTT
const mqttClientId = 'clientId-zp6TCxjTBz'; // ID do cliente MQTT
const mqttTopic = 'teste123dz'; // Tópico MQTT
// Caminho completo para o banco de dados SQLite
const dbFilePath = 'public/viagens.db';
// Conectar ao banco de dados SQLite
const db = new sqlite3.Database(dbFilePath);
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