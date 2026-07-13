
const script_do_google = 'https://script.google.com/macros/s/AKfycbxc0Pccqz4l0vbsF6xH57fGlq4MBah1L3H4TFhZaP7gYwjVyHsT1tRypLBcNPEJOO_7/exec';
const dados_do_formulario = document.forms['os-form'];

dados_do_formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    
    fetch(script_do_google, { 
        method: 'POST', 
        body: new FormData(dados_do_formulario) 
    })
    .then(response => {
        alert('Dados enviados com sucesso!'); 
        dados_do_formulario.reset();
    })
    .catch(error => {
        console.error('Erro no envio dos dados', error);
    });
});