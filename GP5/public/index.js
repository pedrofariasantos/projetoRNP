document.addEventListener('DOMContentLoaded', function() {
  var btnComecarViagem = document.getElementById('btnComecarViagem');
  if (btnComecarViagem) {
      btnComecarViagem.onclick = function() {
          window.location.href = '/comecar_viagem';
      };
  }

  var btnEntrega = document.getElementById('btnEntrega');
  if (btnEntrega) {
      btnEntrega.onclick = function() {
          window.location.href = '/entrega';
      };
  }

  var btnViagens = document.getElementById('btnViagens');
  if (btnViagens) {
      btnViagens.onclick = function() {
          window.location.href = '/viagem'; 
      };
    }
  var btnMapa = document.getElementById('btnMapa');
  if (btnMapa) {
        btnMapa.onclick = function() {
            window.location.href = '/mapa'; 
      };
    }

  var botaoComecar = document.getElementById('botaoComecar');
  if (botaoComecar) {
      botaoComecar.addEventListener('click', mostrarCard);
  }

})


let lugarDeSaida = '';
let destino = '';
function selectOption(element, dropdownId) {
  var selectedCity = element.textContent;

  if (dropdownId === 'dropdownButtonCidades') {
      lugarDeSaida = selectedCity;
      document.getElementById('startCity').value = selectedCity; // Atualiza o valor do input oculto para lugar de saída
  } else if (dropdownId === 'destino') {
      destino = selectedCity; 
      document.getElementById('endCity').value = element.textContent;
      // Se necessário, adicione um input oculto para 'destino' e atualize seu valor aqui
  }

  document.getElementById(dropdownId).innerText = selectedCity; // Atualiza o texto do botão
}

document.addEventListener('DOMContentLoaded', function() {
    // Funções e manipuladores de eventos aqui

    function selectOption(element, dropdownId) {
        if (dropdownId === 'dropdownButtonCidades') {
            lugarDeSaida = element.textContent;
        } else if (dropdownId === 'destino') {
            destino = element.textContent;
        }
        document.getElementById(dropdownId).innerText = element.textContent;
    }

    document.getElementById('botaoComecar').addEventListener('click', function() {
        mostrarCard(lugarDeSaida, destino);
    });

  function mostrarCard(lugarDeSaida, destino) {
    const localDoCard = document.getElementById('localDoCard');
    localDoCard.innerHTML = ''; // Limpa conteúdo existente

    const card = document.createElement('div');
    card.className = 'card';
    card.style.width = '18rem';
    card.innerHTML = `
  
      <div class="card-body">
        <h5 class="card-title">${lugarDeSaida} para ${destino}</h5>

        <div class="col-auto">
          <button type="button" id="btnMapa" class="btn btn-primary btn-lg mb-2">Mapa</button>
        </div>
      </div>
    `;

    localDoCard.appendChild(card);

    document.getElementById('btnMapa').addEventListener('click', function() {
      var mapaFrame = document.getElementById('mapaFrame');
      mapaFrame.src = '/mapa'; // Substitua pelo URL correto do mapa
    });
  }


});
document.getElementById('botaoComecar').addEventListener('click', function() {
  const startCity = document.getElementById('startCity').value;
  const endCity = document.getElementById('endCity').value;
  var url = `/GP5/public/mapa.html?startCity=${encodeURIComponent(startCity)}&endCity=${encodeURIComponent(endCity)}`;
});

document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const startCity = urlParams.get('startCity');
  const endCity = urlParams.get('endCity');

  if (startCity) {
      document.getElementById('startCity').value = startCity;
  }
  if (endCity) {
      document.getElementById('endCity').value = endCity;
  }
});

// Adicione este código no seu arquivo JavaScript do lado do cliente

document.getElementById('buscarViagemBtn').addEventListener('click', function() {
  buscarViagens();
});

function buscarViagens() {
  var startCity = document.getElementById('startCity').value;
  var endCity = document.getElementById('endCity').value;
  var assetCode = document.getElementById('assetCode').value;

  fetch(`/buscar_viagens?local_saida=${startCity}&destino=${endCity}&codigo_ativo=${assetCode}`)
  .then(response => response.json())
  .then(viagens => {
      var resultadosDiv = document.getElementById('resultadosViagem');
      resultadosDiv.innerHTML = ''; // Limpa resultados anteriores

      viagens.forEach(viagem => {
          var card = document.createElement('div');
          card.innerHTML = `
              <h5>Viagem: ${viagem.id_viagem}</h5>
              <p>De: ${viagem.local_saida} Para: ${viagem.destino}</p>
              <p>Código do Ativo: ${viagem.codigo_ativo}</p>
              <button onclick="finalizarViagem(${viagem.id_viagem})">Finalizar Viagem</button>
          `;
          resultadosDiv.appendChild(card);
      });
  })
  .catch(error => console.error('Erro ao buscar viagens:', error));
}

$(document).ready(function() {
  // Manipule o clique do botão "Buscar Viagem"
  $('#buscarViagemBtn').click(function() {
      // Obtenha os valores selecionados para cidade de partida, cidade de destino e código do ativo
      var startCity = $('#startCity').val();
      var endCity = $('#endCity').val();
      var assetCode = $('#assetCode').val();

      // Envie uma solicitação AJAX para o servidor para buscar as viagens com base nas opções selecionadas
      $.ajax({
          url: '/entrega', // Endpoint no servidor para buscar viagens
          method: 'GET',
          data: {
              startCity: startCity,
              endCity: endCity,
              assetCode: assetCode
          },
          success: function(response) {
              // Limpe os resultados anteriores
              $('#resultadosViagem').empty();

              // Exiba as viagens encontradas
              if (response.length > 0) {
                  for (var i = 0; i < response.length; i++) {
                      var viagem = response[i];
                      var viagemHtml = '<div>';
                      viagemHtml += '<h3>Viagem ' + viagem.id_viagem + '</h3>';
                      viagemHtml += '<p>Cidade de Partida: ' + viagem.local_saida + '</p>';
                      viagemHtml += '<p>Cidade de Destino: ' + viagem.destino + '</p>';
                      viagemHtml += '<p>Código do Ativo: ' + viagem.codigo_ativo + '</p>';
                      viagemHtml += '</div>';

                      $('#resultadosViagem').append(viagemHtml);

                      // Adicione um modal para cada viagem
                      var modalHtml = '<div class="modal fade" id="modalViagem' + viagem.id_viagem + '" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">';
                      modalHtml += '<div class="modal-dialog" role="document">';
                      modalHtml += '<div class="modal-content">';
                      modalHtml += '<div class="modal-header">';
                      modalHtml += '<h5 class="modal-title" id="exampleModalLabel">Detalhes da Viagem</h5>';
                      modalHtml += '<button type="button" class="close" data-dismiss="modal" aria-label="Fechar">';
                      modalHtml += '<span aria-hidden="true">&times;</span>';
                      modalHtml += '</button>';
                      modalHtml += '</div>';
                      modalHtml += '<div class="modal-body">';
                      modalHtml += '<p>ID da Viagem: ' + viagem.id_viagem + '</p>';
                      modalHtml += '<p>Data/Hora de Início: ' + viagem.data_hora_inicio + '</p>';
                      modalHtml += '<p>Data/Hora de Fim: ' + viagem.data_hora_fim + '</p>';
                      modalHtml += '<p>Status: ' + viagem.status + '</p>';
                      modalHtml += '</div>';
                      modalHtml += '<div class="modal-footer">';
                      modalHtml += '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>';
                      modalHtml += '</div>';
                      modalHtml += '</div>';
                      modalHtml += '</div>';
                      modalHtml += '</div>';

                      $('body').append(modalHtml);
                  }
              } else {
                  $('#resultadosViagem').html('<p>Nenhuma viagem encontrada.</p>');
              }
          },
          error: function() {
              console.error('Erro ao buscar viagens.');
          }
      });
  });
});


