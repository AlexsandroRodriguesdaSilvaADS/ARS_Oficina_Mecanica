
let somaTotal = 0;

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

function limparFormulario() {
    const numeroAtual = document.getElementById('f_numero').value;
    const form = document.getElementById('os-form');
    if (form) form.reset();

    document.getElementById('f_numero').value = numeroAtual;
    listaServicos.innerHTML = '';
    document.getElementById('totalGeral').value = 'R$ 0,00';
    somaTotal = 0;
}

function gerarOS(event) {
    event.preventDefault();

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

    // Preenchendo os campos textuais de impressão
    document.getElementById('p_numero').innerText = numeroOS;
    document.getElementById('p_data').innerText = dataFormatada;
    document.getElementById('p_cliente').innerText = cliente;
    document.getElementById('p_documento').innerText = documento;
    document.getElementById('p_telefone').innerText = telefone;
    document.getElementById('p_email').innerText = email;
    document.getElementById('p_objeto').innerText = objeto;
    document.getElementById('p_modelo').innerText = modelo;
    document.getElementById('p_serial').innerText = serial;
    document.getElementById('p_status').innerText = status;
    document.getElementById('p_defeito').innerText = defeito;
    document.getElementById('p_laudo').innerText = laudo;
    document.getElementById('p_valor').innerText = inputTotalGeral.value;

    // COPIA AS LIs DA TELA PARA A ÁREA DE IMPRESSÃO DO PREVIEW
    const printLista = document.getElementById('p_lista');
    printLista.innerHTML = ''; // Limpa impressão anterior

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

    // CHAMADA DA FUNÇÃO DO PDF: Gera o PDF automaticamente junto com a impressão
    /*salvarPDF(numeroOS, cliente);*/

    // Atualizando o localStorage para a próxima OS
    let novoNumero = parseInt(numeroOS) + 1;
    localStorage.setItem('proxima_os_num', novoNumero);

    // Disparar a impressão nativa
    window.print();

    // Atualiza o número no formulário e limpa a tela para a próxima entrada
    document.getElementById('f_numero').value = novoNumero;
    limparFormulario();
}

/*// NOVA FUNÇÃO: Gera e faz o download automático do PDF
    function salvarPDF(numeroOS, cliente) {
        // Seleciona o elemento que contém a área de impressão/preview da sua OS
        // Nota: Altere 'area-impressao' para o ID real da sua div de visualização/impressão (onde ficam os p_numero, p_cliente, etc)
        const elementoOS = document.getElementById('print-area') || document.body;

        // Configurações do arquivo PDF
        const opcoes = {
            margin: 10,
            filename: `OS_${numeroOS}_${cliente.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 }, // Melhora a resolução do texto do PDF
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Executa a biblioteca e baixa o arquivo
        html2pdf().set(opcoes).from(elementoOS).save();
    }*/


/*    let somaTotal = 0;

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

    function limparFormulario() {
        const numeroAtual = document.getElementById('f_numero').value;
        const form = document.getElementById('os-form');
        if (form) form.reset();

        document.getElementById('f_numero').value = numeroAtual;
        listaServicos.innerHTML = '';
        document.getElementById('totalGeral').value = 'R$ 0,00';
        somaTotal = 0;
    }

    function gerarOS(event) {
        event.preventDefault();

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

        // Preenchendo os campos textuais de impressão
        document.getElementById('p_numero').innerText = numeroOS;
        document.getElementById('p_data').innerText = dataFormatada;
        document.getElementById('p_cliente').innerText = cliente;
        document.getElementById('p_documento').innerText = documento;
        document.getElementById('p_telefone').innerText = telefone;
        document.getElementById('p_email').innerText = email;
        document.getElementById('p_objeto').innerText = objeto;
        document.getElementById('p_modelo').innerText = modelo;
        document.getElementById('p_serial').innerText = serial;
        document.getElementById('p_status').innerText = status;
        document.getElementById('p_defeito').innerText = defeito;
        document.getElementById('p_laudo').innerText = laudo;
        document.getElementById('p_valor').innerText = inputTotalGeral.value;

        // COPIA AS LIs DA TELA PARA A ÁREA DE IMPRESSÃO DO PREVIEW
        const printLista = document.getElementById('p_lista');
        printLista.innerHTML = ''; // Limpa impressão anterior

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

        // Atualizando o localStorage para a próxima OS
        let novoNumero = parseInt(numeroOS) + 1;
        localStorage.setItem('proxima_os_num', novoNumero);

        // Disparar a impressão nativa
        window.print();

        // Atualiza o número no formulário e limpa a tela para a próxima entrada
        document.getElementById('f_numero').value = novoNumero;
        limparFormulario();
    }*/
