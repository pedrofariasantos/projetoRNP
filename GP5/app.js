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
