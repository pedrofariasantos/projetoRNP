document.getElementById('btnComecarViagem').onclick = function() {
    window.location.href = '/comecar_viagem';
  };

  document.getElementById('btnEntrega').onclick = function() {
    window.location.href = '/entrega';
  };

  document.getElementById('btnViagens').onclick = function() {
    window.location.href = '/viagem'; 
  };
  //Funções para que ao clicar no botão abra uma nova aba do site

  document.addEventListener('DOMContentLoaded', function() {
    var button = document.getElementById('myButton');
    button.addEventListener('click', function() {
        var newCard = document.createElement('div');
        newCard.className = 'card';
        newCard.style.width = '18rem';
        newCard.innerHTML = `
            <img src="..." class="card-img-top" alt="...">
            <div class="card-body">
                <h5 class="card-title">Card title</h5>
                <p class="card-text">Some quick example text to build on the card title and make up the bulk of the card's content.</p>
                <a href="#" class="btn btn-primary">Go somewhere</a>
            </div>
        `;
        document.body.appendChild(newCard);
    });
});
