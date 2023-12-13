// Inicializa o mapa Leaflet
function initMap() {
  var mymap = L.map('mapid').setView([latitudeInicial, longitudeInicial], zoomInicial); // Substitua com valores iniciais

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
          .bindPopup(`Data: ${loc.data_hora}<br>Código Ativo: ${loc.codigo_ativo}`);
  });
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
