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
            var iframe = document.getElementById('iframeMapa');
            var mapaContainer = document.getElementById('mapaContainer');
            
            if (iframe && mapaContainer) {
                iframe.src = '/mapa/:codigo_ativo/:data_hora_inicio/:data_hora_final?'; // Caminho do seu mapa
                mapaContainer.style.display = 'block'; // Mostra o container do mapa
            }
        };
    }

    var btnRegistro = document.getElementById('btnRegistro');
    if (btnRegistro) {
        btnRegistro.onclick = function () {
            window.location.href = '/registrar';
        };
    }

    // Função para buscar viagens com base nos filtros e exibir os cards
    var botaoBuscar = document.getElementById('botaoBuscar');
    if (botaoBuscar) {
        botaoBuscar.addEventListener('click', buscarViagens);
    }
});

function criarBotaoMapa(viagem) {
    var botaoMapa = document.createElement('button');
    botaoMapa.className = 'btn btn-primary';
    botaoMapa.textContent = 'Abrir Mapa';
    botaoMapa.onclick = function () {
        // Função para formatar a data e hora
        function formatarDataHora(dataHora) {
            if (!dataHora) return 'Indisponível';
            var data = new Date(dataHora);
            return data.toLocaleString(); // Formata a data e hora conforme local
        }

        // Define os detalhes da viagem no cabeçalho do modal
        document.getElementById('mapModalTitle').textContent = `Viagem: ${viagem.id_viagem}, De ${viagem.local_saida} Para ${viagem.destino}`;

        // Formata as datas e inclui no subtítulo
        var dataHoraInicio = formatarDataHora(viagem.data_hora_inicio);
        var dataHoraFinal = viagem.data_hora_final ? formatarDataHora(viagem.data_hora_final) : 'Indisponível';
        document.getElementById('mapModalSubTitle').textContent = `Código do Ativo: ${viagem.codigo_ativo}, Início: ${dataHoraInicio}, Final: ${dataHoraFinal}`;

        // Configura a URL do iframe
        var iframe = document.getElementById('mapIframe');
        iframe.src = `/mapa/${viagem.id_viagem}/${viagem.codigo_ativo}/${viagem.data_hora_inicio}/${viagem.data_hora_final || ''}`;

        // Exibe o modal
        var modal = document.getElementById('mapModal');
        modal.style.display = "block";
    };

    return botaoMapa;
}

function buscarViagens() {
    var startCityElem = document.getElementById('startCity');
    var endCityElem = document.getElementById('endCity');
    var assetCodeElem = document.getElementById('assetCodeInput');
    var resultadosDiv = document.getElementById('resultadosViagem');
    var statusViagemElem = document.getElementById('statusViagem');

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
    if (statusViagemElem && statusViagemElem.value) {
        params.append('viagemFinalizada', statusViagemElem.value);
        console.log('Status da viagem:', statusViagemElem.value === "1" ? "Finalizada" : "Não finalizada");
    } else {
        console.log('Status da viagem: Não definido');
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

            var botaoMapa = document.createElement('button');
            botaoMapa.className = 'btn btn-primary';
            botaoMapa.textContent = 'Abrir Mapa';
            botaoMapa.onclick = function () {
                window.location.href = `/mapa/${viagem.id_viagem}/${viagem.codigo_ativo}/${viagem.data_hora_inicio}/${viagem.data_hora_final || ''}`;
            };

            // Função para formatar a data e hora
            function formatarDataHora(dataHora) {
                if (!dataHora) return 'Indisponível';
                var data = new Date(dataHora);
                return data.toLocaleString(); // Formata a data e hora conforme local
            }

            var dataHoraInicio = formatarDataHora(viagem.data_hora_inicio);
            var dataHoraFinal = viagem.data_hora_final ? formatarDataHora(viagem.data_hora_final) : 'null';

            card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">Viagem: ${viagem.id_viagem}</h5>
                <p>De: ${viagem.local_saida} Para: ${viagem.destino}</p>
                <p>Código do Ativo: ${viagem.codigo_ativo}</p>
                <p>Iniciada em: ${dataHoraInicio}</p>
                <p>Finalizada em: ${dataHoraFinal}</p>
            </div>
            `;
    
            // Adiciona o botão de mapa ao card
            var botaoMapa = criarBotaoMapa(viagem);
            card.querySelector('.card-body').appendChild(botaoMapa);
    
            resultadosDiv.appendChild(card);
        });
    })
    .catch(error => {
        console.error('Erro ao buscar viagens:', error);
        resultadosDiv.innerHTML = '<p>Ocorreu um erro ao buscar as viagens.</p>';
    });
}


function buscarEntregas() {
    var startCityElem = document.getElementById('startCity');
    var endCityElem = document.getElementById('endCity');
    var assetCodeElem = document.getElementById('assetCodeInput');
    var resultadosDiv = document.getElementById('resultadosEntrega');

    var params = new URLSearchParams();
    
    if (startCityElem && startCityElem.value) {
        params.append('local_saida', startCityElem.value);
    }
    if (endCityElem && endCityElem.value) {
        params.append('destino', endCityElem.value);
    }
    if (assetCodeElem && assetCodeElem.value) {
        params.append('codigo_ativo', assetCodeElem.value);
    }

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
            <button class="btn btn-danger" onclick="finalizarViagem(${viagem.id_viagem}, '${viagem.codigo_ativo}')">Finalizar Viagem</button>
        </div>
    `;
    return card;
}

function finalizarViagem(idViagem, codigoAtivo) {
    // Primeira parte: Fazer a requisição para finalizar a viagem
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
            buscarEntregas(); // Atualiza a lista de entregas após finalizar a viagem

            // Segunda parte: Conectar ao broker MQTT e enviar a mensagem "GPS-OFF"
            const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');

            client.on('connect', function () {
                console.log('Conectado ao broker MQTT para finalizar a viagem', idViagem);
        
                // Altere a mensagem para incluir o código ativo
                const mensagem = codigoAtivo + ',GPS-OFF';
                client.publish('INTELI-RNP-M4T08-GP5', mensagem, function () {
                    console.log('Mensagem enviada:', mensagem);
                    client.end(); // Encerra a conexão após enviar a mensagem
                });
            });

            client.on('error', function (error) {
                console.log('Erro ao conectar ao broker MQTT:', error);
            });
        })
        .catch(error => {
            console.error('Erro ao finalizar viagem:', error);
        });
}
