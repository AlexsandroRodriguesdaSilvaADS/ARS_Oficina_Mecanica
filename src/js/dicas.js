/*
    Objetivo 1 - quando o usuário clicar no botão de mostrar mais deve abrir os projetos que estão escondidos no html

        Passo 1 - pegar o botão mostrar mais no JS pra poder verificar quando o usuário clicar em cima dele

        Passo 2 - identificar o clique no botão
        
        Passo 3 - adicionar a classe "ativo" nos projetos escondidos

    Objetivo 2 - esconder o botão de mostrar mais
        Passo 1 - pegar o botão e esconder ele
*/

// Objetivo 1 - quando o usuário clicar no botão de mostrar mais deve abrir os projetos que estão escondidos no html

// Passo 1 - pegar o botão mostrar mais no JS pra poder verificar quando o usuário clicar em cima dele
/*const botaoMostrarProjetos = document.querySelector('.btn-mostrar-servicos');
const botaoOcultarProjetos = document.querySelector('.btn-ocultar-servicos');
const projetosInativos = document.querySelectorAll('.servico1:not(.ativo)');

botaoMostrarProjetos.addEventListener('click', () => {
    // Passo 3 - adicionar a classe "ativo" nos projetos escondidos
    mostrarMaisProjetos();

    // Objetivo 2 - esconder o botão de mostrar mais
    // Passo 1 - pegar o botão e esconder ele
    esconderBotao();
});

function esconderBotao() {
    botaoMostrarProjetos.classList.add("remover");
    botaoOcultarProjetos.classList.remove("remover");
}

function mostrarMaisProjetos() {
    projetosInativos.forEach(projetoInativo => {
        projetoInativo.classList.add('ativo');
    });
}

botaoOcultarProjetos.addEventListener('click', () => {
    ocultarProjetos();
    mostrarBotao();
})

function mostrarBotao() {
    botaoMostrarProjetos.classList.remove("remover");
    botaoOcultarProjetos.classList.add("remover");
}

function ocultarProjetos() {
    projetosInativos.forEach(projetoInativo => {
        projetoInativo.classList.remove('ativo');
    });
}*/



// 1. Seleciona todos os links que têm a classe 'meu-link'
const links = document.querySelectorAll('.meu-link');

// 2. Passa por cada um dos links encontrados
links.forEach(link => {
  link.addEventListener('click', function(event) {
    // Previne o comportamento padrão do link (não rolar a página ou recarregar)
    event.preventDefault();
    
    // Pega o valor do atributo 'data-alvo' do link que foi clicado
    const idDoAlvo = this.getAttribute('data-alvo');
    
    // Encontra o elemento correspondente usando esse ID
    const elementoAlvo = document.getElementById(idDoAlvo);
    
    // OPCIONAL: Se você quiser que APENAS UM elemento fique ativo por vez,
    // desative todos os outros antes de ativar o novo (remova as barras se quiser usar):
    document.querySelectorAll('.servico').forEach(el => el.classList.remove('ativo'));
    
    // Adiciona a classe 'ativo' ao elemento correspondente
    // (Você pode mudar 'ativo' para o nome da classe CSS que preferir)
    if (elementoAlvo) {
      elementoAlvo.classList.add('ativo');
    }
  });
});