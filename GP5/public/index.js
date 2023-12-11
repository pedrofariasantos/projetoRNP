console.log("Script carregado");
document.addEventListener('DOMContentLoaded', function () {
    // Configuração dos botões para navegar para diferentes rotas
    var btnComecarViagem = document.getElementById('btnComecarViagem');
    if (btnComecarViagem) {
        btnComecarViagem.onclick = function () {
            window.location.href = '/comecar_viagem';
        };
    }

    var btnEntrega = document.getElementById('btnEntrega');
    if (btnEntrega) {
        btnEntrega.onclick = function () {
            window.location.href = '/entrega';
        };
    }

    var btnViagens = document.getElementById('btnViagens');
    if (btnViagens) {
        btnViagens.onclick = function () {
            window.location.href = '/viagem';
        };
    }

    var btnMapa = document.getElementById('btnMapa');
    if (btnMapa) {
        btnMapa.onclick = function () {
            window.location.href = '/mapa';
        };
    }

    var btnMapa = document.getElementById('btnRegistro');
    if (btnMapa) {
        btnMapa.onclick = function () {
            window.location.href = '/registrar';
        };
    }

    // Função para buscar viagens com base nos filtros e exibir os cards
    var botaoBuscar = document.getElementById('botaoBuscar');
    if (botaoBuscar) {
        botaoBuscar.addEventListener('click', buscarViagens);
    }

    
});

function buscarViagens() {
    var startCityElem = document.getElementById('startCity');
    var endCityElem = document.getElementById('endCity');
    var assetCodeElem = document.getElementById('assetCodeInput');
    var resultadosDiv = document.getElementById('resultadosViagem');
    var viagemFinalizadaElem = document.querySelector('input[name="btnradio"]:checked');

    var params = new URLSearchParams();
    if (startCityElem && startCityElem.value) {
        params.append('local_saida', startCityElem.value);
        console.log('Cidade de partida:', startCityElem.value);
    }
    if (endCityElem && endCityElem.value) {
        params.append('destino', endCityElem.value);
        console.log('Cidade de destino:', endCityElem.value);
    }
    if (assetCodeElem && assetCodeElem.value) {
        params.append('codigo_ativo', assetCodeElem.value);
        console.log('Código do ativo:', assetCodeElem.value);
    }
    if (viagemFinalizadaElem) {
        params.append('viagemFinalizada', viagemFinalizadaElem.value);
        console.log('Viagem finalizada:', viagemFinalizadaElem.value);
    } else {
        console.log('Viagem finalizada: Não definido');
    }

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
                        <p>Finalizada: ${viagem.viagemFinalizada === 1 ? 'Sim' : viagem.viagemFinalizada === 0 ? 'Não' : 'Não'}</p>
                    </div>
                `;
                resultadosDiv.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar viagens:', error);
            resultadosDiv.innerHTML = '<p>Ocorreu um erro ao buscar as viagens.</p>';
        });
}

function buscarEntregas() {
    console.log("Função buscarEntregas chamada");

    var startCityElem = document.getElementById('startCity');
    var endCityElem = document.getElementById('endCity');
    var assetCodeElem = document.getElementById('assetCodeInput');
    var resultadosDiv = document.getElementById('resultadosEntrega');

    console.log("Cidade de partida: ", startCityElem ? startCityElem.value : "Elemento não encontrado");
    console.log("Cidade de destino: ", endCityElem ? endCityElem.value : "Elemento não encontrado");
    console.log("Código do Ativo: ", assetCodeElem ? assetCodeElem.value : "Elemento não encontrado");

    var params = new URLSearchParams({
        local_saida: startCityElem.value,
        destino: endCityElem.value,
        codigo_ativo: assetCodeElem.value,
        viagemFinalizada: 0 // Filtrar apenas por viagens não finalizadas
    });

    fetch('/entrega?' + params.toString())
        .then(response => {
            console.log("Resposta do servidor: ", response);
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Dados recebidos: ", data);
            resultadosDiv.innerHTML = ''; // Limpar conteúdo anterior
            data.forEach(viagem => {
                let card = criarCardEntrega(viagem);
                resultadosDiv.appendChild(card);
            });
        })
        .catch(error => {
            console.error('Erro ao buscar entregas:', error);
        });
}

function criarCardEntrega(viagem) {
    var card = document.createElement('div');
    card.className = 'card';
    card.style.width = '18rem';
    card.innerHTML = `
        <div class="card-body">
            <h5 class="card-title">Viagem: ${viagem.id_viagem}</h5>
            <p>De: ${viagem.local_saida} Para: ${viagem.destino}</p>
            <p>Código do Ativo: ${viagem.codigo_ativo}</p>
            <p>Finalizada: Não</p>
            <button class="btn btn-danger" onclick="finalizarViagem(${viagem.id_viagem})">Finalizar Viagem</button>
        </div>
    `;
    return card;
}

function finalizarViagem(idViagem) {
    fetch('/entrega', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idViagem: idViagem })
    })
    .then(response => {
        if (!response.ok) throw new Error(`Erro HTTP! status: ${response.status}`);
        return response.json();
    })
    .then(data => {
        alert('Viagem finalizada com sucesso!');
        buscarEntregas();
    })
    .catch(error => console.error('Erro ao finalizar viagem:', error));
}