
//ENVIAR DADOS DO FORMULARIO DE AGENDAMENTO PELO WHATSAPP

document.getElementById('formulario').addEventListener('submit', function (event) {
    event.preventDefault(); // Impede o envio padrão do formulário

    // Coleta dos dados
    var nome = document.getElementById('nome').value;
    var telefone = document.getElementById('contato').value;
    var email = document.getElementById('email').value;
    var data = document.getElementById('dataAgendamento').value;
    var hora = document.getElementById('horaAgendamento').value;
    var mensagem = document.getElementById('mensagem').value;

    // Configuração do WhatsApp
    var numeroWhatsapp = "5581998090037";
    var mensagem = "Olá, meu nome é " + nome + ", o meu contato é " + telefone + ", o meu e-mail é " + email + ", a data e horário escolhidos são " + data + " às " + hora + " e os problemas relatados são: " + mensagem;

    // Criação do link
    var url = "https://wa.me/" + numeroWhatsapp + "?text=" + encodeURIComponent(mensagem);

    // Redireciona
    window.open(url, '_blank');

    // Limpar o formulário
    document.getElementById('formulario').reset();
    localStorage.clear();
});

