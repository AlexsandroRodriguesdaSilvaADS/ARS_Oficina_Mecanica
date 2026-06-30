// ==========================================
// 1. SISTEMA DE LOGIN E CONTROLE DE TELAS
// ==========================================
function autenticar(event) {
    event.preventDefault();
    
    const usuario = document.getElementById('username').value;
    const senha = document.getElementById('password').value;
    const erroLogin = document.getElementById('login-error');
    
    if (usuario === "admin" && senha === "1234") {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        if (erroLogin) erroLogin.style.display = 'none';
    } else {
        if (erroLogin) erroLogin.style.display = 'block';
    }
}

function logout() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}

document.addEventListener("DOMContentLoaded", () => {
    const mainContent = document.getElementById('main-content');
    const loginScreen = document.getElementById('login-screen');
    
    if (mainContent) mainContent.style.display = 'none';
    if (loginScreen) loginScreen.style.display = 'flex';
    
    const fData = document.getElementById('f_nota_data');
    if (fData) {
        const hoje = new Date().toISOString().split('T')[0];
        fData.value = hoje;
    }

    if (!localStorage.getItem('ultimo_numero_nota')) {
        localStorage.setItem('ultimo_numero_nota', '1000');
    }
    definirProximoNumeroNota();
});

function definirProximoNumeroNota() {
    const fNotaNum = document.getElementById('f_nota_num');
    if (fNotaNum) {
        const ultimoNumero = parseInt(localStorage.getItem('ultimo_numero_nota')) || 1000;
        const proximoNumero = ultimoNumero + 1;
        fNotaNum.value = `#${proximoNumero}`;
    }
}

// ==========================================
// 2. CONTROLE DE FORMA DE PAGAMENTO E DESCONTO
// ==========================================
const formaPagamentoSelect = document.getElementById('formaPagamento');
const descontoInput = document.getElementById('desconto');

if (formaPagamentoSelect && descontoInput) {
    formaPagamentoSelect.addEventListener('change', function() {
        if (this.value === 'pix' || this.value === 'dinheiro') {
            descontoInput.disabled = false;
            descontoInput.value = 5; 
        } else {
            descontoInput.disabled = true;
            descontoInput.value = '';
        }
    });
}

// ==========================================
// 3. GERENCIAMENTO DA LISTA DE SERVIÇOS
// ==========================================
let servicosAdicionados = [];
const btnAdicionar = document.getElementById('btnAdicionar');
const listaServicosUl = document.getElementById('listaServicos');
const totalGeralInput = document.getElementById('totalGeral');

if (btnAdicionar) {
    btnAdicionar.addEventListener('click', () => {
        const servicoSelect = document.getElementById('servico');
        const quantidadeInput = document.getElementById('quantidade');
        const valorInput = document.getElementById('valor');
        
        if (!servicoSelect || !quantidadeInput || !valorInput) return;

        const servicoNome = servicoSelect.value;
        const qtd = parseInt(quantidadeInput.value);
        const valorUnitarioOriginal = parseFloat(valorInput.value);
        
        if (!servicoNome) {
            alert("Por favor, selecione um serviço.");
            return;
        }
        if (isNaN(qtd) || qtd <= 0) {
            alert("Insira uma quantidade válida.");
            return;
        }
        if (isNaN(valorUnitarioOriginal) || valorUnitarioOriginal < 10) {
            alert("O valor unitário mínimo deve ser R$ 10,00.");
            return;
        }

        // Proibir duplicação estrita
        const itemExistente = servicosAdicionados.find(item => item.nome === servicoNome);
        if (itemExistente) {
            alert(`O serviço "${servicoNome}" já foi adicionado à lista. Remova-o antes se desejar alterar os valores.`);
            return; 
        }

        let descontoPorcentagem = 0;
        let valorUnitarioComDesconto = valorUnitarioOriginal;

        if (descontoInput && !descontoInput.disabled && descontoInput.value) {
            descontoPorcentagem = parseFloat(descontoInput.value);
            if (descontoPorcentagem < 5 || descontoPorcentagem > 10) {
                alert("O desconto permitido deve ser entre 5% e 10%.");
                return;
            }
            valorUnitarioComDesconto = valorUnitarioOriginal * (1 - (descontoPorcentagem / 100));
        }

        const subtotalFinal = qtd * valorUnitarioComDesconto;

        const novoServico = {
            id: Date.now(),
            nome: servicoNome,
            qtd: qtd,
            valorOriginal: valorUnitarioOriginal,
            valorComDesconto: valorUnitarioComDesconto,
            desconto: descontoPorcentagem,
            total: subtotalFinal
        };

        servicosAdicionados.push(novoServico);
        atualizarInterfaceServicos();

        servicoSelect.value = '';
        quantidadeInput.value = '1';
        valorInput.value = '';
    });
}

function removerServico(id) {
    servicosAdicionados = servicosAdicionados.filter(item => item.id !== id);
    atualizarInterfaceServicos();
}

function atualizarInterfaceServicos() {
    if (!listaServicosUl || !totalGeralInput) return;
    
    listaServicosUl.innerHTML = '';
    let somaTotal = 0;

    servicosAdicionados.forEach(item => {
        somaTotal += item.total;
        
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.alignItems = 'center';
        li.style.marginBottom = '8px';
        li.style.padding = '6px';
        li.style.borderBottom = '1px dashed #ddd';
        
        let detalheValor = `Un: R$ ${item.valorComDesconto.toFixed(2)}`;
        if (item.desconto > 0) {
            detalheValor = `Un: R$ ${item.valorComDesconto.toFixed(2)} (com ${item.desconto}% desc. de R$ ${item.valorOriginal.toFixed(2)})`;
        }

        const infoTexto = `${item.nome} (x${item.qtd}) - ${detalheValor} | Total: R$ ${item.total.toFixed(2)}`;
        
        li.innerHTML = `
            <span>${infoTexto}</span>
            <button type="button" class="btn-remover" onclick="removerServico(${item.id})" style="background:#dc3545; color:white; border:none; padding: 4px 8px; cursor:pointer; border-radius:3px;">
                <i class="fas fa-trash"></i>
            </button>
        `;
        listaServicosUl.appendChild(li);
    });

    totalGeralInput.value = `R$ ${somaTotal.toFixed(2).replace('.', ',')}`;
}

// ==========================================
// 4. IMPRESSÃO E ATUALIZAÇÃO DA ÁREA DE IMPRESSÃO
// ==========================================
function dispararImpressaoDupla() {
    // Validação inicial
    const nomeCliente = document.getElementById('f_cliente_nome')?.value;
    const telCliente = document.getElementById('f_cliente_tel')?.value;
    const modVeiculo = document.getElementById('f_veiculo_mod')?.value;
    const placaVeiculo = document.getElementById('f_veiculo_placa')?.value;
    const kmVeiculo = document.getElementById('f_kilometragem')?.value;

    if (!nomeCliente || !telCliente || !modVeiculo || !placaVeiculo || !kmVeiculo) {
        alert("Por favor, preencha todos os campos obrigatórios (*) antes de imprimir.");
        return;
    }

    if (servicosAdicionados.length === 0) {
        alert("Adicione pelo menos um serviço à lista antes de imprimir.");
        return;
    }

    const numeroNotaStr = document.getElementById('f_nota_num')?.value || "#1001";
    const dataNotaStr = document.getElementById('f_nota_data')?.value ? document.getElementById('f_nota_data').value.split('-').reverse().join('/') : "";

    // =========================================================
    // BLOCO 1: ATUALIZA A NOTA DE SERVIÇO PRINCIPAL (Protegido)
    // =========================================================
    if (document.getElementById('p_numero')) document.getElementById('p_numero').innerText = numeroNotaStr;
    if (document.getElementById('p_data')) document.getElementById('p_data').innerText = dataNotaStr;
    if (document.getElementById('p_cliente')) document.getElementById('p_cliente').innerText = nomeCliente;
    if (document.getElementById('p_documento')) document.getElementById('p_documento').innerText = document.getElementById('f_cliente_id')?.value || 'Não Informado';
    if (document.getElementById('p_telefone')) document.getElementById('p_telefone').innerText = telCliente;
    if (document.getElementById('p_email')) document.getElementById('p_email').innerText = 'autonomosslm@gmail.com';

    if (document.getElementById('p_objeto')) document.getElementById('p_objeto').innerText = 'Automóvel';
    if (document.getElementById('p_modelo')) document.getElementById('p_modelo').innerText = modVeiculo;
    if (document.getElementById('p_serial')) document.getElementById('p_serial').innerText = placaVeiculo.toUpperCase();
    
    if (document.getElementById('p_status') && formaPagamentoSelect) {
        document.getElementById('p_status').innerText = 'Concluído / Pago via ' + formaPagamentoSelect.options[formaPagamentoSelect.selectedIndex].text;
    }

    if (document.getElementById('p_defeito')) document.getElementById('p_defeito').innerText = 'Manutenção / Reparo preventivo ou corretivo veicular.';
    if (document.getElementById('p_laudo')) document.getElementById('p_laudo').innerText = 'Substituição e ajustes dos componentes especificados com testes dinâmicos de rodagem concluídos.';

    // Lista dinâmica de serviços
    const pLista = document.getElementById('p_lista');
    if (pLista) {
        pLista.innerHTML = '';
        servicosAdicionados.forEach(item => {
            const liItem = document.createElement('li');
            liItem.style.listStyle = 'none';
            liItem.style.margin = '5px 0';
            liItem.style.fontSize = '13px';
            liItem.innerText = `- ${item.nome} | Qtd: ${item.qtd} | Vlr. Unit: R$ ${item.valorComDesconto.toFixed(2)} ${item.desconto > 0 ? `(Desc. aplicado: ${item.desconto}%)` : ''} -> Subtotal: R$ ${item.total.toFixed(2)}`;
            pLista.appendChild(liItem);
        });

        if (totalGeralInput) {
            const totalLi = document.createElement('li');
            totalLi.style.listStyle = 'none';
            totalLi.style.marginTop = '15px';
            totalLi.style.fontWeight = 'bold';
            totalLi.style.fontSize = '16px';
            totalLi.style.textAlign = 'right';
            totalLi.innerText = `VALOR TOTAL DA NOTA: ${totalGeralInput.value}`;
            pLista.appendChild(totalLi);
        }
    }

    // =========================================================
    // BLOCO 2: CLONA PARA O TERMO DE GARANTIA (Protegido)
    // =========================================================
    if (document.getElementById('p_garantia_numero')) document.getElementById('p_garantia_numero').innerText = numeroNotaStr;
    if (document.getElementById('p_garantia_data')) document.getElementById('p_garantia_data').innerText = dataNotaStr;
    if (document.getElementById('p_garantia_cliente')) document.getElementById('p_garantia_cliente').innerText = nomeCliente;
    if (document.getElementById('p_garantia_telefone')) document.getElementById('p_garantia_telefone').innerText = telCliente;
    if (document.getElementById('p_garantia_veiculo')) document.getElementById('p_garantia_veiculo').innerText = modVeiculo;
    if (document.getElementById('p_garantia_placa')) document.getElementById('p_garantia_placa').innerText = placaVeiculo.toUpperCase();
    if (document.getElementById('p_garantia_km')) document.getElementById('p_garantia_km').innerText = kmVeiculo;

    // Salva o número atualizado sequencial no LocalStorage
    const numeroAtualOriginal = numeroNotaStr.replace('#', '');
    localStorage.setItem('ultimo_numero_nota', numeroAtualOriginal);

    // Dispara a impressão
    window.print();

    // Gera o próximo número para a tela
    definirProximoNumeroNota();
}

// ==========================================
// 5. LIMPEZA TOTAL DO FORMULÁRIO
// ==========================================
const btnLimpar = document.getElementById('btnLimpar');
if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja limpar todo o formulário?")) {
            if (document.getElementById('f_cliente_nome')) document.getElementById('f_cliente_nome').value = '';
            if (document.getElementById('f_cliente_tel')) document.getElementById('f_cliente_tel').value = '';
            if (document.getElementById('f_cliente_id')) document.getElementById('f_cliente_id').value = '';
            if (document.getElementById('f_veiculo_mod')) document.getElementById('f_veiculo_mod').value = '';
            if (document.getElementById('f_veiculo_placa')) document.getElementById('f_veiculo_placa').value = '';
            if (document.getElementById('f_kilometragem')) document.getElementById('f_kilometragem').value = '';
            
            if (document.getElementById('servico')) document.getElementById('servico').value = '';
            if (document.getElementById('quantidade')) document.getElementById('quantidade').value = '1';
            if (document.getElementById('valor')) document.getElementById('valor').value = '';
            if (document.getElementById('desconto')) document.getElementById('desconto').value = '';
            if (document.getElementById('desconto')) document.getElementById('desconto').disabled = true;
            if (document.getElementById('formaPagamento')) document.getElementById('formaPagamento').value = 'cartao';
            
            servicosAdicionados = [];
            atualizarInterfaceServicos();
            definirProximoNumeroNota();
        }
    });
}