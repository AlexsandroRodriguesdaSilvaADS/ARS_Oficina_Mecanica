/*let somaTotal = 0;

// Referências dos Elementos
const selectServico = document.getElementById('servico');
const inputValor = document.getElementById('valor');
const listaServicos = document.getElementById('listaServicos');
const inputTotalGeral = document.getElementById('totalGeral');
const btnAdicionar = document.getElementById('btnAdicionar');

window.onload = function () {
    if (sessionStorage.getItem('usuario_autenticado') === 'true') {
        exibirPainel();
    }
    carregarNumeroOS();
};

// AUTENTICAÇÃO
function autenticar(event) {
    event.preventDefault();
    const usuarioCorreto = "admin";
    const senhaCorreta = "047874";

    const usuarioDigitado = document.getElementById('username').value;
    const senhaDigitada = document.getElementById('password').value;
    const erroMensagem = document.getElementById('login-error');

    if (usuarioDigitado === usuarioCorreto && senhaDigitada === senhaCorreta) {
        sessionStorage.setItem('usuario_autenticado', 'true');
        exibirPainel();
        if (erroMensagem) erroMensagem.style.display = 'none';
    } else {
        if (erroMensagem) erroMensagem.style.display = 'block';
        document.getElementById('password').value = '';
    }
}

function exibirPainel() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('main-content').style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('usuario_autenticado');
    window.location.reload();
}

function carregarNumeroOS() {
    let proximoNumero = localStorage.getItem('proxima_os_num');
    if (!proximoNumero) proximoNumero = 1;
    document.getElementById('f_numero').value = proximoNumero;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ADICIONANDO SERVIÇOS E VALORES DINAMICAMENTE
if (btnAdicionar) {
    btnAdicionar.addEventListener('click', () => {
        const nomeServico = selectServico.value;
        const valorServico = parseFloat(inputValor.value);

        if (isNaN(valorServico) || valorServico <= 0) {
            alert("Por favor, insira um valor válido para o serviço.");
            return;
        }

        const novoItem = document.createElement('li');
        novoItem.innerHTML = `<span>${nomeServico}</span> <strong>${formatarMoeda(valorServico)}</strong>`;
        listaServicos.appendChild(novoItem);

        somaTotal += valorServico;
        inputTotalGeral.value = formatarMoeda(somaTotal);

        inputValor.value = '';
        inputValor.focus();
    });
}

function limparFormulario() {
    const numeroAtual = document.getElementById('f_numero').value;
    const form = document.getElementById('os-form');
    if (form) form.reset();

    document.getElementById('f_numero').value = numeroAtual;
    listaServicos.innerHTML = '';
    document.getElementById('totalGeral').value = 'R$ 0,00';
    somaTotal = 0;
}

// GERAR A ORDEM DE SERVIÇO
function gerarOS(event) {
    event.preventDefault();

    // Captura os dados do formulário
    const numeroOS = document.getElementById('f_numero').value;
    const cliente = document.getElementById('f_cliente').value;
    const documento = document.getElementById('f_documento').value || 'Não informado';
    const telefone = document.getElementById('f_telefone').value;
    const email = document.getElementById('f_email').value || 'Não informado';
    const objeto = document.getElementById('f_objeto').value;
    const modelo = document.getElementById('f_modelo').value || 'Não informado';
    const serial = document.getElementById('f_serial').value || 'Não informado';
    const defeito = document.getElementById('f_defeito').value;
    const laudo = document.getElementById('f_laudo').value || 'Em análise técnica.';
    const status = document.getElementById('f_status').value;

    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR') + ' ' + hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    // Preenchendo os campos textuais na área de impressão
    // IMPORTANTE: Certifique-se de que estes elementos estão DENTRO do container 'print-area'
    if(document.getElementById('p_numero')) document.getElementById('p_numero').innerText = numeroOS;
    if(document.getElementById('p_data')) document.getElementById('p_data').innerText = dataFormatada;
    if(document.getElementById('p_cliente')) document.getElementById('p_cliente').innerText = cliente;
    if(document.getElementById('p_documento')) document.getElementById('p_documento').innerText = documento;
    if(document.getElementById('p_telefone')) document.getElementById('p_telefone').innerText = telefone;
    if(document.getElementById('p_email')) document.getElementById('p_email').innerText = email;
    if(document.getElementById('p_objeto')) document.getElementById('p_objeto').innerText = objeto;
    if(document.getElementById('p_modelo')) document.getElementById('p_modelo').innerText = modelo;
    if(document.getElementById('p_serial')) document.getElementById('p_serial').innerText = serial;
    if(document.getElementById('p_status')) document.getElementById('p_status').innerText = status;
    if(document.getElementById('p_defeito')) document.getElementById('p_defeito').innerText = defeito;
    if(document.getElementById('p_laudo')) document.getElementById('p_laudo').innerText = laudo;
    if(document.getElementById('p_valor')) document.getElementById('p_valor').innerText = inputTotalGeral.value;

    // COPIA AS LIs DA TELA PARA A ÁREA DE IMPRESSÃO
    const printLista = document.getElementById('p_lista');
    if (printLista) {
        printLista.innerHTML = ''; 
        const itensAdicionados = listaServicos.querySelectorAll('li');
        itensAdicionados.forEach(item => {
            const liClonada = document.createElement('li');
            liClonada.style.display = "flex";
            liClonada.style.justifyContent = "space-between";
            liClonada.style.borderBottom = "1px dashed #ccc";
            liClonada.style.padding = "4px 0";
            liClonada.innerHTML = item.innerHTML;
            printLista.appendChild(liClonada);
        });
    }

    // ATUALIZA O PRÓXIMO NÚMERO DA OS NO LOCALSTORAGE
    const proximoNum = parseInt(numeroOS) + 1;
    localStorage.setItem('proxima_os_num', proximoNum);

    window.print();
}*/


// CÓDIGO OTIMIZADO
let somaTotal = 0;

// Centralização das referências do DOM para evitar buscas repetidas
const El = {
    selectServico: document.getElementById('servico'),
    inputValor: document.getElementById('valor'),
    listaServicos: document.getElementById('listaServicos'),
    inputTotalGeral: document.getElementById('totalGeral'),
    btnAdicionar: document.getElementById('btnAdicionar'),
    loginScreen: document.getElementById('login-screen'),
    mainContent: document.getElementById('main-content'),
    loginError: document.getElementById('login-error'),
    password: document.getElementById('password'),
    username: document.getElementById('username'),
    fNumero: document.getElementById('f_numero'),
    osForm: document.getElementById('os-form'),
    printLista: document.getElementById('p_lista'),
    printValor: document.getElementById('p_valor')
};

// INICIALIZAÇÃO
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('usuario_autenticado') === 'true') {
        exibirPainel();
    }
    carregarNumeroOS();
    configurarEventos();
});

// EVENTOS
function configurarEventos() {
    if (El.btnAdicionar) {
        El.btnAdicionar.addEventListener('click', adicionarServico);
    }
}

// AUTENTICAÇÃO
function autenticar(event) {
    event.preventDefault();
    const USUARIO_CORRETO = "admin";
    const SENHA_CORRETA = "047874";

    if (El.username.value === USUARIO_CORRETO && El.password.value === SENHA_CORRETA) {
        sessionStorage.setItem('usuario_autenticado', 'true');
        exibirPainel();
        if (El.loginError) El.loginError.style.display = 'none';
    } else {
        if (El.loginError) El.loginError.style.display = 'block';
        El.password.value = '';
    }
}

function exibirPainel() {
    if (El.loginScreen) El.loginScreen.style.display = 'none';
    if (El.mainContent) El.mainContent.style.display = 'block';
}

function logout() {
    sessionStorage.removeItem('usuario_autenticado');
    window.location.reload();
}

function carregarNumeroOS() {
    const proximoNumero = localStorage.getItem('proxima_os_num') || 1;
    if (El.fNumero) El.fNumero.value = proximoNumero;
}

function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// ADICIONANDO SERVIÇOS E VALORES
function adicionarServico() {
    const nomeServico = El.selectServico.value;
    const valorServico = parseFloat(El.inputValor.value);

    if (isNaN(valorServico) || valorServico <= 0) {
        alert("Por favor, insira um valor válido para o serviço.");
        return;
    }

    const novoItem = document.createElement('li');
    novoItem.innerHTML = `<span>${nomeServico}</span> <strong>${formatarMoeda(valorServico)}</strong>`;
    El.listaServicos.appendChild(novoItem);

    somaTotal += valorServico;
    El.inputTotalGeral.value = formatarMoeda(somaTotal);

    El.inputValor.value = '';
    El.inputValor.focus();
}

function limparFormulario() {
    const numeroAtual = El.fNumero ? El.fNumero.value : 1;
    if (El.osForm) El.osForm.reset();

    if (El.fNumero) El.fNumero.value = numeroAtual;
    El.listaServicos.innerHTML = '';
    El.inputTotalGeral.value = 'R$ 0,00';
    somaTotal = 0;
}

// GERAR A ORDEM DE SERVIÇO E ABRIR IMPRESSÃO
function gerarOS(event) {
    event.preventDefault();

    const numeroOS = El.fNumero.value;
    const cliente = document.getElementById('f_cliente').value;

    const hoje = new Date();
    const dataFormatada = `${hoje.toLocaleDateString('pt-BR')} ${hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    // Mapeamento dinâmico: [ID do Campo de Impressão, Valor capturado do Formulário]
    const mapeamentoCampos = [
        ['p_numero', numeroOS],
        ['p_data', dataFormatada],
        ['p_cliente', cliente],
        ['p_documento', document.getElementById('f_documento').value || 'Não informado'],
        ['p_telefone', document.getElementById('f_telefone').value],
        ['p_email', document.getElementById('f_email').value || 'Não informado'],
        ['p_objeto', document.getElementById('f_objeto').value],
        ['p_modelo', document.getElementById('f_modelo').value || 'Não informado'],
        ['p_serial', document.getElementById('f_serial').value || 'Não informado'],
        ['p_status', document.getElementById('f_status').value],
        ['p_defeito', document.getElementById('f_defeito').value],
        ['p_laudo', document.getElementById('f_laudo').value || 'Em análise técnica.']
    ];

    // Loop que preenche todos os campos textuais de forma limpa
    mapeamentoCampos.forEach(([idPrint, valor]) => {
        const elemento = document.getElementById(idPrint);
        if (elemento) elemento.innerText = valor;
    });

    if (El.printValor) {
        El.printValor.innerText = El.inputTotalGeral ? El.inputTotalGeral.value : 'R$ 0,00';
    }

    // COPIA AS LIs DA TELA PARA A ÁREA DE IMPRESSÃO
    if (El.printLista && El.listaServicos) {
        El.printLista.innerHTML = '';
        El.listaServicos.querySelectorAll('li').forEach(item => {
            const liClonada = document.createElement('li');
            Object.assign(liClonada.style, {
                display: "flex",
                justifyContent: "space-between",
                borderBottom: "1px dashed #ccc",
                padding: "4px 0"
            });
            liClonada.innerHTML = item.innerHTML;
            El.printLista.appendChild(liClonada);
        });
    }

    // Gerencia o Título para nomear o PDF corretamente
    const tituloOriginal = document.title;
    const clienteLimpo = cliente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_");
    
    document.title = `OS_${numeroOS}_${clienteLimpo}`;
    window.print();
    document.title = tituloOriginal;

    // Atualiza numeração local e reseta formulário
    localStorage.setItem('proxima_os_num', parseInt(numeroOS) + 1);
    limparFormulario();
    carregarNumeroOS();
}
