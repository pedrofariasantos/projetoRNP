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
            window.location.href = '/mapa_biguacu_poa'; 
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
  if (dropdownId === 'dropdownButtonCidades') {
      lugarDeSaida = element.textContent;
  } else if (dropdownId === 'destino') {
      destino = element.textContent;
  }
  document.getElementById(dropdownId).innerText = element.textContent;
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
      mapaFrame.src = '/mapa_biguacu_poa'; // Substitua pelo URL correto do mapa
    });
  }


});
