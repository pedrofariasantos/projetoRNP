document.addEventListener('DOMContentLoaded', function() {
    // Configuração dos botões para navegar para diferentes rotas
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

    // Função para buscar viagens com base nos filtros e exibir os cards
    var botaoComecar = document.getElementById('botaoComecar');
    if (botaoComecar) {
        botaoComecar.addEventListener('click', buscarViagens);
    }
});

function buscarViagens() {
    var startCityElem = document.getElementById('startCity');
    var endCityElem = document.getElementById('endCity');
    var assetCodeElem = document.getElementById('assetCodeInput');
    var resultadosDiv = document.getElementById('resultadosViagem');

    if (!resultadosDiv) {
        console.error('Elemento para exibir resultados não encontrado.');
        return;
    }

    var params = new URLSearchParams();
    if (startCityElem && startCityElem.value) params.append('local_saida', startCityElem.value);
    if (endCityElem && endCityElem.value) params.append('destino', endCityElem.value);
    if (assetCodeElem && assetCodeElem.value) params.append('codigo_ativo', assetCodeElem.value);

    fetch(`/viagem?${params.toString()}`)
    .then(response => {
        if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
        return response.json();
    })
    .then(viagens => {
        resultadosDiv.innerHTML = ''; // Limpa resultados anteriores
        viagens.forEach(viagem => {
            var card = document.createElement('div');
            card.className = 'card';
            card.style.width = '18rem';
            card.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">Viagem: ${viagem.id_viagem}</h5>
                    <p>De: ${viagem.local_saida} Para: ${viagem.destino}</p>
                    <p>Código do Ativo: ${viagem.codigo_ativo}</p>
                    <p>Finalizada: ${viagem.viagemFinalizada ? 'Sim' : 'Não'}</p>
                </div>
            `;
            resultadosDiv.appendChild(card);
        });
    })
    .catch(error => console.error('Erro ao buscar viagens:', error));
    
}