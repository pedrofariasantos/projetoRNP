const express = require('express');
const app = express();
const port = 3000;

app.use('/GP5/public', express.static('public'));
// Importa as rotas
const router = require('./routes'); // Ajuste o caminho conforme necessário

// Usa as rotas definidas em routes.js
app.use(router);

// O servidor começa a escutar na porta especificada
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
