
var map = L.map(document.getElementById('mapDIV'), {
  center: [-26.2633205, -49.1276949],
  zoom: 8
});
var basemap = L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {});
basemap.addTo(map);
var startPoint, endPoint, routeControl, markersLayer, selectedAssetCode;
var startDateTime = null;
var endDateTime = null;
var historicoViagens = [];

// Geocodificar as cidades para obter coordenadas
geocodificarCidade(startCity, function (startCoords) {
  geocodificarCidade(endCity, function (endCoords) {
    // Remover marcadores, rota e camada de marcadores existentes, se houver
    removerMarcadores();

    // Atualizar o centro do mapa para o ponto de partida
    map.setView(startCoords, 13);

    // Adicionar marcadores para o ponto de partida e destino
    startPoint = L.marker(startCoords).addTo(map);
    endPoint = L.marker(endCoords).addTo(map);

    // Criar controle de rota
    routeControl = L.Routing.control({
      waypoints: [
        L.latLng(startCoords),
        L.latLng(endCoords)
      ],
      routeWhileDragging: true
    }).addTo(map);

    // Adicionar marcadores a cada 50 km
    adicionarMarcadoresAoLongoDaRota(startCoords, endCoords, 50);

    // Exibir QR code dedicado
    exibirQRCode(selectedAssetCode);
  });
});

function finalizarViagem() {
  // Armazenar a hora de término da viagem
  endDateTime = new Date();
  // Remover marcadores, rota e camada de marcadores
  removerMarcadores();
  // Remover controle de rota
  if (routeControl) {
    map.removeControl(routeControl);
  }
  // Adicionar informações ao histórico
  var viagem = {
    assetCode: selectedAssetCode,
    startDateTime: startDateTime,
    endDateTime: endDateTime,
    startCity: document.getElementById('startCity').value,
    endCity: document.getElementById('endCity').value
  };
  historicoViagens.push(viagem);
  // Exibir informações de término da viagem
  exibirInformacoesViagem();
  // Limpar o conteúdo do elemento qrcode
  document.getElementById("qrcode").innerHTML = '';
}
function exibirQRCode(assetCode) {
  // Gerar QR code com o código do ativo
  var qrcode = new QRCode(document.getElementById("qrcode"), {
    text: assetCode,
    width: 128,
    height: 128
  });
}
function exibirInformacoesViagem() {
  // Obter o nome das cidades de origem e destino
  var startCity = document.getElementById('startCity').value;
  var endCity = document.getElementById('endCity').value;
  // Exibir informações de término da viagem
  var infoViagem = `
        <p><strong>Ativo:</strong> ${selectedAssetCode}</p>
        <p><strong>Início:</strong> ${formatarDataHora(startDateTime)}</p>
        <p><strong>Término:</strong> ${formatarDataHora(endDateTime)}</p>
        <p><strong>De:</strong> ${startCity}</p>
        <p><strong>Para:</strong> ${endCity}</p>
        <p><strong>Mensagem:</strong> Entrega bem-sucedida!</p>
      `;
  // Exibir no elemento históricoViagens
  document.getElementById("historicoViagens").innerHTML += infoViagem;
}
function formatarDataHora(dateTime) {
  if (!dateTime) {
    console.log("Erro: dateTime é undefined");
    return "";
  }
  var options = { /* suas opções aqui */ };
  return dateTime.toLocaleDateString('pt-BR', options);
}
function removerMarcadores() {
  if (startPoint) {
    map.removeLayer(startPoint);
  }
  if (endPoint) {
    map.removeLayer(endPoint);
  }
  if (routeControl) {
    map.removeControl(routeControl);
  }
  if (markersLayer) {
    map.removeLayer(markersLayer);
  }
}
function adicionarMarcadoresAoLongoDaRota(startCoords, endCoords, intervaloKm) {
  // Solicitar a rota detalhada do OpenStreetMap
  var apiUrl = 'https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&steps=true';
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.routes && data.routes.length > 0) {
        var route = data.routes[0];
        var distanciaTotal = route.distance / 1000; // em quilômetros
        var intervalo = intervaloKm;
        for (var i = intervalo; i < distanciaTotal; i += intervalo) {
          var pontoAoLongoDaRota = route.geometry.coordinates.find((coords, index) => {
            if (index > 0) {
              var distanciaParcial = route.legs[index - 1].distance / 1000; // em quilômetros
              return distanciaParcial >= i;
            }
            return false;
          });
          if (pontoAoLongoDaRota) {
            var marker = L.marker([pontoAoLongoDaRota[1], pontoAoLongoDaRota[0]]);
            markersLayer.addLayer(marker);
          }
        }
      }
    })
    .catch(error => {
      console.error('Erro na solicitação da rota detalhada:', error);
    });
}
function geocodificarCidade(city, callback) {
  // Utilizar serviço Nominatim do OpenStreetMap para geocodificação
  var apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)},Brazil&format=json&limit=1`;
  fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data.length > 0) {
        var coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        callback(coords);
      } else {
        alert('Não foi possível encontrar as coordenadas para a cidade.');
      }
    })
    .catch(error => {
      console.error('Erro na solicitação de geocodificação:', error);
    });
}

function enviarDadosViagem() {
  if (!startDateTime || !endDateTime) {
    console.log("Erro: startDateTime ou endDateTime é undefined");
    return;
  }
  var startCity = document.getElementById('startCity').value;
  var endCity = document.getElementById('endCity').value;
  var assetCode = selectedAssetCode;
  var inicio = formatarDataHora(startDateTime);
  var termino = formatarDataHora(endDateTime);

  var dadosViagem = {
    local_saida: startCity,
    destino: endCity,
    codigo_ativo: assetCode,
    data_hora_inicio: inicio,
    data_hora_fim: termino
  };

  fetch('/comecar_viagem', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dadosViagem),
  })
    .then(response => response.json())
    .then(data => {
      console.log('Resposta do servidor:', data);
      if (data.message) {
        alert("Viagem registrada com sucesso!");
      }
    })
    .catch((error) => {
      console.error('Erro:', error);
    });
}

