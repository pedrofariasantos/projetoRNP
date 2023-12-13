// Inicializa o mapa Leaflet
function initMap() {
  // Substitua com valores iniciais adequados
  var latitudeInicial = -23.550520; // Exemplo: Latitude de São Paulo
  var longitudeInicial = -46.633308; // Exemplo: Longitude de São Paulo
  var zoomInicial = 13; // Exemplo: Nível de zoom inicial

  var mymap = L.map('mapDIV').setView([latitudeInicial, longitudeInicial], zoomInicial);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
  }).addTo(mymap);

  return mymap;
}

// Adiciona marcadores ao mapa
function addMarkersToMap(mymap, locations) {
  locations.forEach(loc => {
      L.marker([loc.latitude, loc.longitude])
          .addTo(mymap)
          .bindPopup(`Data: ${formatDate(loc.data_hora)}<br>Código Ativo: ${loc.codigo_ativo}`);
  });
}

// Função para formatar a data e hora
function formatDate(dataHora) {
  var date = new Date(dataHora);
  return date.toLocaleString(); // Formata a data e hora conforme local
}

// Função principal que executa as funções de inicialização e adição de marcadores
function main() {
  const mymap = initMap();

  // Verifica se a variável locData (dados injetados pelo servidor) existe
  if (typeof locData !== 'undefined' && locData.length > 0) {
      addMarkersToMap(mymap, locData);
  }
}

// Executa a função principal após o carregamento da página
document.addEventListener('DOMContentLoaded', main);
