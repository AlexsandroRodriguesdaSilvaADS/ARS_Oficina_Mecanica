// ==========================================
// CONFIGURAÇÕES E UTILS
// ==========================================
const Formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const parseNum = val => parseFloat(val) || 0;

// Cache de Elementos do DOM frequentemente acessados
const DOM = {
    fNotaNum: document.getElementById('f_nota_num'),
    fNotaData: document.getElementById('f_nota_data'),
    fClienteNome: document.getElementById('f_cliente_nome'),
    fClienteDoc: document.getElementById('f_cliente_doc'),
    fClienteTel: document.getElementById('f_cliente_tel'),
    fClienteId: document.getElementById('f_cliente_id'),
    fVeiculoMod: document.getElementById('f_veiculo_mod'),
    fVeiculoAno: document.getElementById('f_veiculo_ano'),
    fVeiculoPlaca: document.getElementById('f_veiculo_placa'),
    fNotaLaudo: document.getElementById('f_nota_laudo'),

    username: document.getElementById('username'),
    password: document.getElementById('password'),
    loginError: document.getElementById('login-error'),
    loginScreen: document.getElementById('login-screen'),
    mainContent: document.getElementById('main-content'),

    descontoValor: document.getElementById('desconto-valor'),
    descontoInput: document.getElementById('desconto'), // Campo %
    formaPagamento: document.getElementById('formaPagamento'),

    subtotalServicos: document.getElementById('subtotal-servicos'),
    subtotalPecas: document.getElementById('subtotal-pecas'),
    totalGeral: document.getElementById('total-geral'),
    totalGeralInput: document.getElementById('totalGeral'),

    srvSelect: document.getElementById('servico'),
    qtdInput: document.getElementById('quantidade'),
    valorInput: document.getElementById('valor'),
    btnAdicionar: document.getElementById('btnAdicionar'),
    listaServicosUl: document.getElementById('listaServicos'),
    printTermoGarantia: document.getElementById('print-termo-garantia'),
    btnLimpar: document.getElementById('btnLimpar') 
};

let listaDeServicosAdicionados = [];

// ==========================================
// 1. CONTROLADOR DO NÚMERO SEQUENCIAL (OS / NOTA)
// ==========================================
function inicializarNumeroOS() {
    if (!DOM.fNotaNum) return;
    if (!localStorage.getItem('proximo_numero_os')) {
        localStorage.setItem('proximo_numero_os', '1001');
    }
    DOM.fNotaNum.value = `#${localStorage.getItem('proximo_numero_os')}`;
    DOM.fNotaNum.readOnly = true;
}

function incrementarNumeroOS() {
    const atual = parseInt(localStorage.getItem('proximo_numero_os'), 10) || 1001;
    const proximo = atual + 1;
    localStorage.setItem('proximo_numero_os', proximo);
    if (DOM.fNotaNum) DOM.fNotaNum.value = `#${proximo}`;
}

// ==========================================
// 2. CONTROLE DE ACESSO (LOGIN / LOGOUT)
// ==========================================
function autenticar(event) {
    event.preventDefault();
    const user = DOM.username.value.trim();
    const pass = DOM.password.value.trim();

    if (user === "admin" && pass === "12345") {
        DOM.loginError.style.display = 'none';
        DOM.loginScreen.style.display = 'none';
        DOM.mainContent.style.display = 'block';
        inicializarNumeroOS();
        event.target.reset();
    } else {
        DOM.loginError.style.display = 'block';
    }
}

function logout() {
    DOM.mainContent.style.display = 'none';
    DOM.loginScreen.style.display = 'flex';
}

// ==========================================
// 3. CÁLCULOS E RENDERIZAÇÃO DA TABELA / LISTA
// ==========================================
function atualizarLinha(input) {
    const row = input.closest('.item-row');
    const qtd = parseNum(row.querySelector('.item-qtd').value);
    const uni = parseNum(row.querySelector('.item-uni').value);
    row.querySelector('.item-total').value = (qtd * uni).toFixed(2);
    calcularTotais();
}

function calcularTotais() {
    let totalServicos = 0;
    let totalPecas = 0;

    // 1. Processa itens da tabela estática (caso existam em tela)
    document.querySelectorAll('.item-row').forEach(row => {
        const tipo = row.querySelector('.item-tipo').value;
        const qtd = parseNum(row.querySelector('.item-qtd').value);
        const uni = parseNum(row.querySelector('.item-uni').value);
        const totalItem = qtd * uni;

        row.querySelector('.item-total').value = totalItem.toFixed(2);
        if (tipo === 'SRV') totalServicos += totalItem;
        else totalPecas += totalItem;
    });

    // 2. Processa itens do Array dinâmico (Lista de Serviços)
    const totalArrayServicos = listaDeServicosAdicionados.reduce((acc, s) => acc + s.total, 0);
    totalServicos += totalArrayServicos;

    // 3. Processamento de descontos (Unificado)
    const descFixo = parseNum(DOM.descontoValor?.value);
    let descPercentual = 0;

    if (DOM.descontoInput && !DOM.descontoInput.disabled && DOM.descontoInput.value) {
        descPercentual = Math.min(Math.max(parseNum(DOM.descontoInput.value), 0), 100);
    }

    const subtotalBruto = totalServicos + totalPecas;
    const valorDescontoPercentual = (subtotalBruto * descPercentual) / 100;
    const totalGeral = Math.max(subtotalBruto - descFixo - valorDescontoPercentual, 0);

    // 4. Atualização das saídas do DOM formatadas
    if (DOM.subtotalServicos) DOM.subtotalServicos.value = Formatter.format(totalServicos);
    if (DOM.subtotalPecas) DOM.subtotalPecas.value = Formatter.format(totalPecas);
    if (DOM.totalGeral) DOM.totalGeral.value = Formatter.format(totalGeral);
    if (DOM.totalGeralInput) DOM.totalGeralInput.value = Formatter.format(totalGeral);
}

// ==========================================
// 4. LOGICA DO POP-UP / SELEÇÃO DE SERVIÇOS
// ==========================================
if (DOM.formaPagamento) {
    DOM.formaPagamento.addEventListener('change', function () {
        const isDinheiroOuPix = this.value === 'dinheiro' || this.value === 'pix';
        DOM.descontoInput.disabled = !isDinheiroOuPix;
        if (!isDinheiroOuPix) DOM.descontoInput.value = '';
        calcularTotais();
    });
}

DOM.descontoInput?.addEventListener('input', calcularTotais);

DOM.btnAdicionar?.addEventListener('click', () => {
    const nome = DOM.srvSelect.value;
    const quantidade = parseInt(DOM.qtdInput.value, 10);
    const valorUnitario = parseFloat(DOM.valorInput.value);

    if (!nome || isNaN(quantidade) || quantidade <= 0 || isNaN(valorUnitario) || valorUnitario <= 0) {
        alert('Por favor, preencha todos os campos do serviço corretamente.');
        return;
    }

    listaDeServicosAdicionados.push({
        id: Date.now(),
        nome,
        quantidade,
        valorUnitario,
        total: quantidade * valorUnitario
    });

    renderizarLista();
    DOM.srvSelect.value = '';
    DOM.qtdInput.value = '1';
    DOM.valorInput.value = '';
});

function renderizarLista() {
    if (!DOM.listaServicosUl) return;

    DOM.listaServicosUl.innerHTML = listaDeServicosAdicionados.map(servico => `
        <li>
            <span>
                <strong>${servico.nome}</strong> (x${servico.quantidade}) - 
                Un: ${Formatter.format(servico.valorUnitario)} | 
                Subtotal: <strong>${Formatter.format(servico.total)}</strong>
            </span>
            <button class="btn-remover" onclick="removerServico(${servico.id})">Remover</button>
        </li>
    `).join('');

    calcularTotais();
}

window.removerServico = function (id) {
    listaDeServicosAdicionados = listaDeServicosAdicionados.filter(s => s.id !== id);
    renderizarLista();
};

// [ADICIONADO] FUNÇÃO PARA LIMPAR FORMULÁRIO COMPLETAMENTE
function limparFormulario() {
    if (!confirm('Tem certeza que deseja limpar todo o formulário?')) return;

    // 1. Limpa campos de texto/data/select principais
    const camposParaLimpar = [
        'fClienteNome', 'fClienteDoc', 'fClienteTel', 'fClienteId',
        'fVeiculoMod', 'fVeiculoAno', 'fVeiculoPlaca', 'fNotaLaudo',
        'descontoValor', 'descontoInput', 'formaPagamento', 'srvSelect', 'valorInput'
    ];
    
    camposParaLimpar.forEach(campo => {
        if (DOM[campo]) DOM[campo].value = '';
    });

    // Reset padrão do input de quantidade interna
    if (DOM.qtdInput) DOM.qtdInput.value = '1';

    // 2. Limpa os inputs das linhas da tabela estática (caso existam)
    document.querySelectorAll('.item-row').forEach(row => {
        row.querySelectorAll('input').forEach(input => {
            if (input.classList.contains('item-qtd') || input.classList.contains('item-uni')) {
                input.value = '0';
            } else if (!input.classList.contains('item-tipo')) {
                input.value = '';
            }
        });
    });

    // 3. Reseta o array de serviços dinâmicos e atualiza a tela
    listaDeServicosAdicionados = [];
    renderizarLista(); // Já chama o calcularTotais() internamente

    // 4. Garante que o número da OS não seja perdido/apagado
    inicializarNumeroOS();
}

// ==========================================
// 5. PROCESSAR E DISPARAR IMPRESSÃO DUPLA
// ==========================================
function dispararImpressaoDupla() {
    // 1. Validação de Campos Obrigatórios do Formulário
    if (!DOM.fNotaData?.value) { alert('Por favor, preencha a Data da Nota.'); DOM.fNotaData?.focus(); return; }
    if (!DOM.fClienteNome?.value?.trim()) { alert('Por favor, informe o Nome do Cliente.'); DOM.fClienteNome?.focus(); return; }
    if (!DOM.fClienteTel?.value?.trim()) { alert('Por favor, informe o Telefone do Cliente.'); DOM.fClienteTel?.focus(); return; }
    if (!DOM.fVeiculoMod?.value?.trim()) { alert('Por favor, informe o Modelo do Veículo.'); DOM.fVeiculoMod?.focus(); return; }
    if (!DOM.fVeiculoPlaca?.value?.trim()) { alert('Por favor, informe a Placa do Veículo.'); DOM.fVeiculoPlaca?.focus(); return; }

    calcularTotais();

    const dataOriginal = DOM.fNotaData?.value;
    const dadosOS = {
        numero: DOM.fNotaNum?.value || '#1001',
        data: dataOriginal ? new Date(dataOriginal).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        cliente: DOM.fClienteNome?.value || 'Não informado',
        documento: DOM.fClienteDoc?.value || 'Não informado',
        telefone: DOM.fClienteTel?.value || 'Não informado',
        email: 'Não informado',
        objeto: DOM.fVeiculoMod?.value || 'Não informado',
        modelo: DOM.fVeiculoAno?.value || 'Não informado',
        serial: DOM.fVeiculoPlaca?.value || 'Não informado',
        laudo: DOM.fNotaLaudo?.value || 'Parecer técnico regular conforme manutenção descrita.',
        total: DOM.totalGeral?.value || DOM.totalGeralInput?.value || 'R$ 0,00'
    };

    // Filtra serviços da tabela estática e junta com os do array dinâmico
    let itensHTMLParaTermo = '';
    document.querySelectorAll('.item-row').forEach(row => {
        if (row.querySelector('.item-tipo').value === 'SRV') {
            const desc = row.querySelector('.item-desc').value.trim();
            const qtd = row.querySelector('.item-qtd').value;
            if (desc) itensHTMLParaTermo += `<tr><td style="border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt;">${desc} (Qtd: ${qtd})</td></tr>`;
        }
    });

    listaDeServicosAdicionados.forEach(s => {
        itensHTMLParaTermo += `<tr><td style="border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt;">${s.nome} (Qtd: ${s.quantidade})</td></tr>`;
    });

    if (!itensHTMLParaTermo) {
        itensHTMLParaTermo = `<tr><td style="border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt; color: #718096; font-style: italic;">Mão de obra geral detalhada na folha da Nota de Serviço anexa.</td></tr>`;
    }

    if (DOM.printTermoGarantia) {
        DOM.printTermoGarantia.innerHTML = gerartemplateTermo(dadosOS, itensHTMLParaTermo);
    }

    window.print();
    incrementarNumeroOS();
}

// Template HTML isolado para limpar a função principal
function gerartemplateTermo(dadosOS, itensHTML) {
    return `
        <div class="header" style="border-bottom: 3px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 18px; text-align: center;">
            <h1 style="font-size: 22pt; margin: 0; color: #2b6cb0; text-transform: uppercase; font-weight: bold;">
            Termo de Garantia</h1>

            <p style="font-size: 11pt; color: #4a5568; margin: 4px 0 0 0; font-weight: bold;">
            Referente à Ordem de Serviço Nº ${dadosOS.numero}</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
                <td style="width: 35%; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: #f7fafc;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    OS Documento</span>

                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.numero}</span>
                </td>

                <td style="width: 65%; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: #f7fafc;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Data de Emissão</span>

                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.data}</span>
                </td>
            </tr>
        </table>

        <div style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">
        Dados do Cliente</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 60%;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Nome / Razão Social</span>
                
                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.cliente}</span>
                </td>

                <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 40%;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    CPF / CNPJ</span>
                    
                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.documento}</span>
                </td>
            </tr>

            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 6px 10px;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Telefone de Contato</span>

                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500;" text-transform: uppercase;>${dadosOS.telefone}</span>
                </td>

                <td style="border: 1px solid #e2e8f0; padding: 6px 10px;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    E-mail</span>

                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.email}</span>
                </td>
            </tr>
        </table>

        <div style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">
        Dados do Veículo</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 40%;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Veículo</span>
                    
                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.objeto}</span>
                </td>

                <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 30%;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Modelo</span>
                    
                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.modelo}</span>
                </td>

                <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 30%;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Placa</span>
                    
                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.serial}</span>
                </td>
            </tr>
        </table>

        <div style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">
        Laudo Técnico & Diagnóstico</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 6px 10px;">
                    <span style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Parecer Técnico / Solução Aplicada</span>
                    
                    <span style="font-size: 10.5pt; color: #1a202c; font-weight: 500; text-transform: uppercase;">${dadosOS.laudo}</span>
                </td>
            </tr>
        </table>

        <div style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">
        Serviços Prestados na Garantia - Mão de Obra</div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
            <thead>
                <tr>
                    <th style="background-color: #4a5568; color: #fff; padding: 6px 10px; font-size: 9pt; text-align: left; text-transform: uppercase;">
                    Descrição da Atividade / Item</th>
                </tr>
            </thead>

            <tbody style="text-transform: uppercase;">${itensHTML}</tbody>
        </table>

        <div style="text-align: right; font-size: 11.5pt; font-weight: bold; color: #2b6cb0; margin: 10px 0;">
        Valor Total Coberto: ${dadosOS.total}</div>

        <div style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">
        Condições Gerais de Garantia</div>

        <p style="font-size: 9pt; color: #4a5568; text-align: justify; margin: 0 0 6px 0;">
        1. A garantia cobre estritamente a mão de obra descritas no Parecer Técnico deste documento, válidas pelo prazo legal estabelecido (TRÊS MESES) a partir da data de retirada.</p>

        <p style="font-size: 9pt; color: #4a5568; text-align: justify; margin: 0 0 6px 0;">
        2. Este termo perderá totalmente o efeito caso o objeto apresente avarias decorrentes de flutuações elétricas, entrada de líquidos, lacres rompidos ou modificações por pessoal não autorizado.</p>

        <table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
            <tr>
                <td style="text-align: center; width: 50%; padding: 10px;">
                    <div style="border-top: 1px solid #a0aec0; width: 80%; margin: 0 auto 4px auto;"></div>
                    <span style="font-size: 8.5pt; color: #4a5568;">
                    Responsável Técnico / Empresa</span>
                </td>
                <td style="text-align: center; width: 50%; padding: 10px;">
                    <div style="border-top: 1px solid #a0aec0; width: 80%; margin: 0 auto 4px auto;"></div>
                    <span style="font-size: 8.5pt; color: #4a5568;">
                    Assinatura do Cliente</span>
                </td>
            </tr>
        </table>`;
}

// ==========================================
// 6. INICIALIZAÇÃO
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    if (DOM.mainContent && DOM.mainContent.style.display === 'block') {
        inicializarNumeroOS();
    }

    // [ADICIONADO] Escuta o clique do botão de limpar
    DOM.btnLimpar?.addEventListener('click', limparFormulario);
});



/*function autenticar(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('login-error');

    if (user === "admin" && pass === "12345") {
        errorMsg.style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        inicializarNumeroOS();
        event.target.reset();
    } else {
        errorMsg.style.display = 'block';
    }
}

function logout() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}


function atualizarLinha(input) {
    const row = input.closest('.item-row');
    const qtd = parseFloat(row.querySelector('.item-qtd').value) || 0;
    const uni = parseFloat(row.querySelector('.item-uni').value) || 0;
    const totalInput = row.querySelector('.item-total');

    totalInput.value = (qtd * uni).toFixed(2);
    calcularTotais();
}

function calcularTotais() {
    const rows = document.querySelectorAll('.item-row');
    let totalServicos = 0;
    let totalPecas = 0;

    rows.forEach(row => {
        const tipo = row.querySelector('.item-tipo').value;
        const qtd = parseFloat(row.querySelector('.item-qtd').value) || 0;
        const uni = parseFloat(row.querySelector('.item-uni').value) || 0;
        const totalItem = qtd * uni;

        row.querySelector('.item-total').value = totalItem.toFixed(2);

        if (tipo === 'SRV') {
            totalServicos += totalItem;
        } else {
            totalPecas += totalItem;
        }
    });

    const desconto = parseFloat(document.getElementById('desconto-valor').value) || 0;
    const totalGeral = (totalServicos + totalPecas) - desconto;

    document.getElementById('subtotal-servicos').value = "R$ " + totalServicos.toFixed(2).replace('.', ',');
    document.getElementById('subtotal-pecas').value = "R$ " + totalPecas.toFixed(2).replace('.', ',');
    document.getElementById('total-geral').value = "R$ " + (totalGeral < 0 ? 0 : totalGeral).toFixed(2).replace('.', ',');
}

// FUNÇÃO QUE MONTA O TERMO DE GARANTIA DINAMICAMENTE ANTES DE IMPRIMIR
function dispararImpressaoDupla() {
    // 1. Força o cálculo de segurança dos totais antes de colher os valores
    calcularTotais();

    // 2. Mapeia as variáveis inseridas no formulário de cima
    const dadosOS = {
        numero: document.getElementById('f_nota_ref').value || 'Não informado',
        data: document.getElementById('f_nota_data').value ? new Date(document.getElementById('f_nota_data').value).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        cliente: document.getElementById('f_cliente_nome').value || 'Não informado',
        documento: document.getElementById('f_cliente_doc').value || 'Não informado',
        telefone: document.getElementById('f_cliente_tel').value || 'Não informado',
        email: 'Não informado', // Fallback estrutural do layout
        objeto: document.getElementById('f_veiculo_mod').value || 'Não informado',
        modelo: document.getElementById('f_veiculo_ano').value || 'Não informado',
        serial: document.getElementById('f_veiculo_placa').value || 'Não informado',
        laudo: document.getElementById('f_nota_laudo').value || 'Parecer técnico regular conforme manutenção descrita.',
        total: document.getElementById('total-geral').value
    };

    // 3. Varre as linhas da tabela da Nota procurando apenas o que for Serviço (mão de obra)
    let itensHTMLParaTermo = '';
    const rows = document.querySelectorAll('.item-row');
    let encontrouServico = false;

    rows.forEach(row => {
        const tipo = row.querySelector('.item-tipo').value;
        const desc = row.querySelector('.item-desc').value.trim();
        const qtd = row.querySelector('.item-qtd').value;

        if (tipo === 'SRV' && desc !== '') {
            encontrouServico = true;
            itensHTMLParaTermo += `
                        <tr>
                            <td style="border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt;">${desc} (Qtd: ${qtd})</td>
                        </tr>
                    `;
        }
    });

    // Se nenhuma descrição de serviço válida foi digitada, adiciona linha padrão informativa
    if (!encontrouServico) {
        itensHTMLParaTermo = `
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt; color: #718096; font-style: italic;">Mão de obra geral detalhada na folha da Nota de Serviço anexa.</td>
                    </tr>
                `;
    }

    // 4. Injeta dinamicamente a estrutura exata do Termo de Garantia que você enviou
    const areaTermo = document.getElementById('print-termo-garantia');
    areaTermo.innerHTML = `
                <div class="header" style="border-bottom: 3px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 18px; text-align: center;">
                    <h1 style="font-size: 22pt; margin: 0; color: #2b6cb0; text-transform: uppercase; font-weight: bold;">Termo de Garantia</h1>
                    <p style="font-size: 11pt; color: #4a5568; margin: 4px 0 0 0; font-weight: bold;">Referente à Ordem de Serviço Nº ${dadosOS.numero}</p>
                </div>

                <table class="grid" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                    <tr>
                        <td class="bg-gray" style="width: 35%; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: #f7fafc;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">OS Documento</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">#${dadosOS.numero}</span></td>
                        <td class="bg-gray" style="width: 65%; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: #f7fafc;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Data de Emissão</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.data}</span></td>
                    </tr>
                </table>

                <div class="section-title" style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">Dados do Cliente</div>
                <table class="grid" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 60%;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Nome / Razão Social</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.cliente}</span></td>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 40%;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">CPF / CNPJ</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.documento}</span></td>
                    </tr>
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Telefone de Contato</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.telefone}</span></td>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">E-mail</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.email}</span></td>
                    </tr>
                </table>

                <div class="section-title" style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">Dados do Veículo</div>
                <table class="grid" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 40%;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Veículo</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.objeto}</span></td>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 30%;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Modelo</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.modelo}</span></td>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 30%;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Placa</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.serial}</span></td>
                    </tr>
                </table>

                <div class="section-title" style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">Laudo Técnico & Diagnóstico</div>
                <table class="grid" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                    <tr>
                        <td style="border: 1px solid #e2e8f0; padding: 6px 10px;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Parecer Técnico / Solução Aplicada</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.laudo}</span></td>
                    </tr>
                </table>

                <div class="section-title" style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">Serviços Prestados na Garantia - Mão de Obra</div>
                <table class="table-itens" style="width: 100%; border-collapse: collapse; margin-bottom: 8px;">
                    <thead>
                        <tr>
                            <th style="background-color: #4a5568; color: #fff; padding: 6px 10px; font-size: 9pt; text-align: left; text-transform: uppercase;">Descrição da Atividade / Item</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itensHTMLParaTermo}
                    </tbody>
                </table>

                <div class="total-box" style="text-align: right; font-size: 11.5pt; font-weight: bold; color: #2b6cb0; margin: 10px 0;">
                    Valor Total Coberto: ${dadosOS.total}
                </div>

                <div class="section-title" style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">Condições Gerais de Garantia</div>
                <p class="text-condicoes" style="font-size: 9pt; color: #4a5568; text-align: justify; margin: 0 0 6px 0;">1. A garantia cobre estritamente a mão de obra descritas no Parecer Técnico deste documento, válidas pelo prazo legal estabelecido (TRÊS MESES) a partir da data de retirada.</p>
                <p class="text-condicoes" style="font-size: 9pt; color: #4a5568; text-align: justify; margin: 0 0 6px 0;">2. Este termo perderá totalmente o efeito caso o objeto apresente avarias decorrentes de flutuações elétricas, entrada de líquidos, lacres rompidos ou modificações por pessoal não autorizado.</p>

                <table class="signatures" style="width: 100%; margin-top: 40px; border-collapse: collapse;">
                    <tr>
                        <td style="border: none; text-align: center; width: 50%; padding: 10px;">
                            <div class="line" style="border-top: 1px solid #a0aec0; width: 80%; margin: 0 auto 4px auto;"></div>
                            <span class="line-lbl" style="font-size: 8.5pt; color: #4a5568;">Responsável Técnico / Empresa</span>
                        </td>
                        <td style="border: none; text-align: center; width: 50%; padding: 10px;">
                            <div class="line" style="border-top: 1px solid #a0aec0; width: 80%; margin: 0 auto 4px auto;"></div>
                            <span class="line-lbl" style="font-size: 8.5pt; color: #4a5568;">Assinatura do Cliente</span>
                        </td>
                    </tr>
                </table>
            `;

    // 5. Aciona o gerenciador nativo de impressão
    window.print();
}*/