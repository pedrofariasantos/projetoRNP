// entrega.js

document.getElementById('buscarViagensBtn').addEventListener('click', function () {
    const startCity = document.getElementById('startCity').value;
    const endCity = document.getElementById('endCity').value;
    const assetCode = document.getElementById('assetCode').value;

    // Enviar os dados para o servidor usando AJAX ou outra forma de requisição
    // Exemplo de AJAX com jQuery:
    $.ajax({
        url: '/buscar_viagens', // Rota de busca de viagens no servidor
        method: 'POST',
        data: {
            startCity: startCity,
            endCity: endCity,
            assetCode: assetCode
        },
        success: function (response) {
            // Manipule a resposta do servidor e exiba as viagens encontradas
            exibirViagensEncontradas(response);
        },
        error: function (error) {
            console.error('Erro ao buscar viagens:', error);
        }
    });
});

// Função para exibir as viagens encontradas
function exibirViagensEncontradas(viagens) {
    const viagensEncontradasDiv = document.getElementById('viagensEncontradas');
    
    // Limpe o conteúdo anterior
    viagensEncontradasDiv.innerHTML = '';

    if (viagens.length === 0) {
        viagensEncontradasDiv.innerHTML = '<p>Nenhuma viagem encontrada.</p>';
    } else {
        // Crie uma tabela ou divs para exibir as informações das viagens
        const tabelaViagens = document.createElement('table');
        tabelaViagens.classList.add('table', 'table-striped');

        // Cabeçalho da tabela
        const cabecalho = tabelaViagens.createTHead();
        const linhaCabecalho = cabecalho.insertRow();
        for (const key in viagens[0]) {
            const th = document.createElement('th');
            th.innerText = key;
            linhaCabecalho.appendChild(th);
        }

        // Linhas da tabela
        const corpoTabela = tabelaViagens.createTBody();
        viagens.forEach((viagem) => {
            const linha = corpoTabela.insertRow();
            for (const key in viagem) {
                const cell = linha.insertCell();
                cell.innerText = viagem[key];
            }
        });

        viagensEncontradasDiv.appendChild(tabelaViagens);
    }
}
