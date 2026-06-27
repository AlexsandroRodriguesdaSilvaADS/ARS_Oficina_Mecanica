
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

function gerarOS(event) {
    event.preventDefault();

    const numeroOS = El.fNumero.value;
    const cliente = document.getElementById('f_cliente').value;

    const hoje = new Date();
    const dataFormatada = `${hoje.toLocaleDateString('pt-BR')} ${hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    // Objeto centralizado com os dados para reutilização em ambos os documentos
    const dadosOS = {
        numero: numeroOS,
        data: dataFormatada,
        cliente: cliente,
        documento: document.getElementById('f_documento').value || 'Não informado',
        telefone: document.getElementById('f_telefone').value || 'Não informado',
        email: document.getElementById('f_email').value || 'Não informado',
        objeto: document.getElementById('f_objeto').value || 'Não informado',
        modelo: document.getElementById('f_modelo').value || 'Não informado',
        serial: document.getElementById('f_serial').value || 'Não informado',
        status: document.getElementById('f_status').value || 'Não informado',
        defeito: document.getElementById('f_defeito').value || 'Não informado',
        laudo: document.getElementById('f_laudo').value || 'Em análise técnica.',
        total: El.inputTotalGeral ? El.inputTotalGeral.value : 'R$ 0,00'
    };

    // Mapeamento dinâmico para a Área de Impressão da OS na Tela
    const mapeamentoCampos = [
        ['p_numero', dadosOS.numero],
        ['p_data', dadosOS.data],
        ['p_cliente', dadosOS.cliente],
        ['p_documento', dadosOS.documento],
        ['p_telefone', dadosOS.telefone],
        ['p_email', dadosOS.email],
        ['p_objeto', dadosOS.objeto],
        ['p_modelo', dadosOS.modelo],
        ['p_serial', dadosOS.serial],
        ['p_status', dadosOS.status],
        ['p_defeito', dadosOS.defeito],
        ['p_laudo', dadosOS.laudo]
    ];

    // Loop que preenche a div de impressão da OS
    mapeamentoCampos.forEach(([idPrint, valor]) => {
        const elemento = document.getElementById(idPrint);
        if (elemento) elemento.innerText = valor;
    });

    if (El.printValor) {
        El.printValor.innerText = dadosOS.total;
    }

    // COPIA AS LIs DA TELA PARA A ÁREA DE IMPREESSÃO DA OS E FORMATA PARA O TERMO
    let itensHTMLParaTermo = '';
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

            // Constrói as linhas textuais dos serviços que irão para o PDF do Termo
            itensHTMLParaTermo += `
                <tr>
                    <td style="padding: 7px 10px; border-bottom: 1px dashed #cbd5e0; font-size: 10pt;">${item.innerText || item.textContent}</td>
                </tr>`;
        });
    }

    if (!itensHTMLParaTermo) {
        itensHTMLParaTermo = `<tr><td style="padding: 7px 10px; border-bottom: 1px dashed #cbd5e0; color: #777; font-size: 10pt;">Nenhum serviço ou peça listada.</td></tr>`;
    }

    // =========================================================================
    // 1º PASSO: DISPARAR IMPRESSÃO DA ORDEM DE SERVIÇO ORIGINAL
    // =========================================================================
    const tituloOriginal = document.title;
    const clienteLimpo = dadosOS.cliente.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9]/g, "_");

    document.title = `OS_${dadosOS.numero}_${clienteLimpo}`;
    window.print(); // Executa a impressão da OS configurada na página
    document.title = tituloOriginal;

    // =========================================================================
    // 2º PASSO: GERAR E DISPARAR O PDF DO TERMO DE GARANTIA
    // =========================================================================
    const nomeArquivoTermo = `Termo_de_Garantia_OS_${dadosOS.numero}_${clienteLimpo}`;
    /*const janelaTermo = window.open('', '_blank');*/


    // 1. Abre a nova janela em branco
    const janelaTermo = window.open("", "_blank");

    if (janelaTermo) {
        // 2. Define o título da página
        janelaTermo.document.title = nomeArquivoTermo;

        // 3. Insere a estrutura base com os estilos
        janelaTermo.document.documentElement.innerHTML = `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <style>
                @page { size: A4; margin: 18mm 15mm; }
                *, *::before, *::after { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #2d3748; line-height: 1.4; }
                .header { border-bottom: 3px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 18px; text-align: center; }
                .header h1 { font-size: 22pt; margin: 0; color: #2b6cb0; text-transform: uppercase; font-weight: bold; }
                .header p { font-size: 11pt; color: #4a5568; margin: 4px 0 0 0; font-weight: bold; }
                .grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                .grid td { border: 1px solid #e2e8f0; padding: 6px 10px; vertical-align: top; }
                .bg-gray { background-color: #f7fafc; }
                .label { font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px; }
                .value { font-size: 10.5pt; color: #1a202c; font-weight: 500; }
                .section-title { font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase; }
                .table-itens { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                .table-itens th { background-color: #4a5568; color: #fff; padding: 6px 10px; font-size: 9pt; text-align: left; text-transform: uppercase; }
                .total-box { text-align: right; font-size: 11.5pt; font-weight: bold; color: #2b6cb0; margin: 10px 0; }
                .text-condicoes { font-size: 9pt; color: #4a5568; text-align: justify; margin: 0 0 6px 0; }
                .signatures { width: 100%; margin-top: 40px; border-collapse: collapse; }
                .signatures td { border: none; text-align: center; width: 50%; padding: 10px; }
                .line { border-top: 1px solid #a0aec0; width: 80%; margin: 0 auto 4px auto; }
                .line-lbl { font-size: 8.5pt; color: #4a5568; }
            </style>
        </head>
        <body></body>
        </html>
    `;

        // 4. Insere o conteúdo dinâmico dentro do Body
        janelaTermo.document.body.innerHTML = `
        <div class="header">
            <h1>Termo de Garantia</h1>
            <p>Referente à Ordem de Serviço Nº ${dadosOS.numero}</p>
        </div>

        <table class="grid">
            <tr>
                <td class="bg-gray" style="width: 35%;"><span class="label">OS Documento</span><span class="value">#${dadosOS.numero}</span></td>
                <td class="bg-gray" style="width: 65%;"><span class="label">Data de Emissão</span><span class="value">${dadosOS.data}</span></td>
            </tr>
        </table>

        <div class="section-title">Dados do Cliente</div>
        <table class="grid">
            <tr>
                <td style="width: 60%;"><span class="label">Nome / Razão Social</span><span class="value">${dadosOS.cliente}</span></td>
                <td style="width: 40%;"><span class="label">CPF / CNPJ</span><span class="value">${dadosOS.documento}</span></td>
            </tr>
            <tr>
                <td><span class="label">Telefone de Contato</span><span class="value">${dadosOS.telefone}</span></td>
                <td><span class="label">E-mail</span><span class="value">${dadosOS.email}</span></td>
            </tr>
        </table>

        <div class="section-title">Dados do Veículo</div>
        <table class="grid">
            <tr>
                <td style="width: 40%;"><span class="label">Veículo</span><span class="value">${dadosOS.objeto}</span></td>
                <td style="width: 30%;"><span class="label">Modelo</span><span class="value">${dadosOS.modelo}</span></td>
                <td style="width: 30%;"><span class="label">Placa</span><span class="value">${dadosOS.serial}</span></td>
            </tr>
        </table>

        <div class="section-title">Laudo Técnico & Diagnóstico</div>
        <table class="grid">
            <tr>
                <td><span class="label">Parecer Técnico / Solução Aplicada</span><span class="value">${dadosOS.laudo}</span></td>
            </tr>
        </table>

        <div class="section-title">Serviços Prestados na Garantia - Mão de Obra</div>
        <table class="table-itens">
            <thead>
                <tr><th>Descrição da Atividade / Item</th></tr>
            </thead>
            <tbody>
                ${itensHTMLParaTermo}
            </tbody>
        </table>

        <div class="total-box">
            Valor Total Coberto: ${dadosOS.total}
        </div>

        <div class="section-title">Condições Gerais de Garantia</div>
        <p class="text-condicoes">1. A garantia cobre estritamente a mão de obra descritas no Parecer Técnico deste documento, válidas pelo prazo legal estabelecido (TRÊS MESES) a partir da data de retirada.</p>
        <p class="text-condicoes">2. Este termo perderá totalmente o efeito caso o objeto apresente avarias decorrentes de flutuações elétricas, entrada de líquidos, lacres rompidos ou modificações por pessoal não autorizado.</p>

        <table class="signatures">
            <tr>
                <td>
                    <div class="line"></div>
                    <span class="line-lbl">Responsável Técnico / Empresa</span>
                </td>
                <td>
                    <div class="line"></div>
                    <span class="line-lbl">Assinatura do Cliente</span>
                </td>
            </tr>
        </table>
    `;

        // 5. Executa a impressão de forma segura após o carregamento completo
        janelaTermo.focus();
        janelaTermo.print();
        setTimeout(() => { janelaTermo.close(); }, 100);
    }


    /*janelaTermo.document.write(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <title>${nomeArquivoTermo}</title>
            <style>
                @page { size: A4; margin: 18mm 15mm; }
                *, *::before, *::after { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #2d3748; line-height: 1.4; }
                .header { border-bottom: 3px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 18px; text-align: center; }
                .header h1 { font-size: 22pt; margin: 0; color: #2b6cb0; text-transform: uppercase; font-weight: bold; }
                .header p { font-size: 11pt; color: #4a5568; margin: 4px 0 0 0; font-weight: bold; }
                .grid { width: 100%; border-collapse: collapse; margin-bottom: 12px; }
                .grid td { border: 1px solid #e2e8f0; padding: 6px 10px; vertical-align: top; }
                .bg-gray { background-color: #f7fafc; }
                .label { font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px; }
                .value { font-size: 10.5pt; color: #1a202c; font-weight: 500; }
                .section-title { font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase; }
                .table-itens { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
                .table-itens th { background-color: #4a5568; color: #fff; padding: 6px 10px; font-size: 9pt; text-align: left; text-transform: uppercase; }
                .total-box { text-align: right; font-size: 11.5pt; font-weight: bold; color: #2b6cb0; margin: 10px 0; }
                .text-condicoes { font-size: 9pt; color: #4a5568; text-align: justify; margin: 0 0 6px 0; }
                .signatures { width: 100%; margin-top: 40px; border-collapse: collapse; }
                .signatures td { border: none; text-align: center; width: 50%; padding: 10px; }
                .line { border-top: 1px solid #a0aec0; width: 80%; margin: 0 auto 4px auto; }
                .line-lbl { font-size: 8.5pt; color: #4a5568; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Termo de Garantia</h1>
                <p>Referente à Ordem de Serviço Nº ${dadosOS.numero}</p>
            </div>

            <table class="grid">
                <tr>
                    <td class="bg-gray" style="width: 35%;"><span class="label">OS Documento</span><span class="value">#${dadosOS.numero}</span></td>
                    <td class="bg-gray" style="width: 65%;"><span class="label">Data de Emissão</span><span class="value">${dadosOS.data}</span></td>
                </tr>
            </table>

            <div class="section-title">Dados do Cliente</div>
            <table class="grid">
                <tr>
                    <td style="width: 60%;"><span class="label">Nome / Razão Social</span><span class="value">${dadosOS.cliente}</span></td>
                    <td style="width: 40%;"><span class="label">CPF / CNPJ</span><span class="value">${dadosOS.documento}</span></td>
                </tr>
                <tr>
                    <td><span class="label">Telefone de Contato</span><span class="value">${dadosOS.telefone}</span></td>
                    <td><span class="label">E-mail</span><span class="value">${dadosOS.email}</span></td>
                </tr>
            </table>

            <div class="section-title">Dados do Equipamento / Objeto</div>
            <table class="grid">
                <tr>
                    <td style="width: 40%;"><span class="label">Equipamento</span><span class="value">${dadosOS.objeto}</span></td>
                    <td style="width: 30%;"><span class="label">Modelo</span><span class="value">${dadosOS.modelo}</span></td>
                    <td style="width: 30%;"><span class="label">Nº de Série / Serial</span><span class="value">${dadosOS.serial}</span></td>
                </tr>
            </table>

            <div class="section-title">Laudo Técnico & Diagnóstico</div>
            <table class="grid">
                <tr>
                    <td class="bg-gray"><span class="label">Situação Final</span><span class="value">${dadosOS.status}</span></td>
                </tr>
                <tr>
                    <td><span class="label">Defeito Relatado</span><span class="value">${dadosOS.defeito}</span></td>
                </tr>
                <tr>
                    <td><span class="label">Parecer Técnico / Solução Aplicada</span><span class="value">${dadosOS.laudo}</span></td>
                </tr>
            </table>

            <div class="section-title">Serviços Prestados & Peças Inclusas na Garantia</div>
            <table class="table-itens">
                <thead>
                    <tr>
                        <th>Descrição da Atividade / Item</th>
                    </tr>
                </thead>
                <tbody>
                    ${itensHTMLParaTermo}
                </tbody>
            </table>

            <div class="total-box">
                Valor Total Coberto: ${dadosOS.total}
            </div>

            <div class="section-title">Condições Gerais de Garantia</div>
            <p class="text-condicoes">1. A garantia cobre estritamente as peças substituídas e a mão de obra descritas no Parecer Técnico deste documento, válidas pelo prazo legal estabelecido a partir da data de retirada.</p>
            <p class="text-condicoes">2. Este termo perderá totalmente o efeito caso o objeto apresente avarias decorrentes de quedas, flutuações elétricas, entrada de líquidos, lacres rompidos ou modificações por pessoal não autorizado.</p>

            <table class="signatures">
                <tr>
                    <td>
                        <div class="line"></div>
                        <span class="line-lbl">Responsável Técnico / Empresa</span>
                    </td>
                    <td>
                        <div class="line"></div>
                        <span class="line-lbl">Assinatura do Cliente</span>
                    </td>
                </tr>
            </table>
            
            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() { window.close(); }, 300);
                };
            </script>
        </body>
        </html>
    `);
    janelaTermo.document.close();*/


    // =========================================================================
    // 3º PASSO: ATUALIZAÇÃO DOS DADOS LOCAIS E LIMPEZA (SÓ NO FINAL)
    // =========================================================================
    localStorage.setItem('proxima_os_num', parseInt(numeroOS) + 1);
    limparFormulario();
    carregarNumeroOS();
}
