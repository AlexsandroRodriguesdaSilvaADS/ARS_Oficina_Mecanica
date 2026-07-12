// ==========================================
// 1. SISTEMA DE LOGIN E CONTROLE DE TELAS
// ==========================================
// Variável global para saber quem está operando o sistema neste momento
let usuarioLogado = "";

function autenticar(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim().toLowerCase();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('login-error');

    const usuariosPermitidos = {
        "alex": "047874",
        "lindovaldo": "123456",
        "midiam": "123456",
    };

    if (usuariosPermitidos[user] && usuariosPermitidos[user] === pass) {
        if (errorMsg) errorMsg.style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        const nomeFormatado = user.toUpperCase();

        // 1. Salva na sessão para as funções de serviços usarem
        sessionStorage.setItem('usuario_ativo', nomeFormatado);

        // 2. NOVO: Faz o nome aparecer na tela (HTML) imediatamente
        const elementoNome = document.getElementById('nome-usuario-logado');
        if (elementoNome) {
            elementoNome.innerText = nomeFormatado;
        }

        if (typeof inicializarNumeroOS === 'function') {
            inicializarNumeroOS();
        } else if (typeof definirProximoNumeroNota === 'function') {
            definirProximoNumeroNota();
        }

        if (event.target && typeof event.target.reset === 'function') {
            event.target.reset();
        }
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
    }
}

/*function autenticar(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('login-error');

    if (user === "alex" && pass === "047874") {
        errorMsg.style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        event.target.reset();
    } else {
        errorMsg.style.display = 'block';
    }
}*/

function logout() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';

    // Limpa o usuário ativo ao deslogar
    usuarioLogado = "";
    sessionStorage.removeItem('usuario_ativo');
}

/*function logout() {
    document.getElementById('main-content').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
}*/

// Carrega os dados da OS
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

    const fNotaNum = document.getElementById('f_nota_ref');
    if (fNotaNum) {
        fNotaNum.readOnly = false; // Permite que você apague o número automático e digite o da OS
        fNotaNum.addEventListener('change', puxarDadosDaOS); // Dispara a busca com "enter"
    }
    definirProximoNumeroNota();

    // Recarrega o nome do usuário na tela caso a página seja atualizada
    const usuarioSalvo = sessionStorage.getItem('usuario_ativo');
    const elementoNome = document.getElementById('nome-usuario-logado');
    if (usuarioSalvo && elementoNome) {
        elementoNome.innerText = usuarioSalvo;
    }
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
    formaPagamentoSelect.addEventListener('change', function () {
        if (this.value === 'pix' || this.value === 'dinheiro') {
            descontoInput.disabled = false;
            descontoInput.value = 5; // Desconto padrão sugerido
        } else {
            descontoInput.disabled = true;
            descontoInput.value = '';
        }
    });
}

// ==========================================
// 3. GERENCIAMENTO DA LISTA DE SERVIÇOS
// ==========================================
let servicosAdicionados = []; // O array que a função de impressão precisa ler!
const btnAdicionar = document.getElementById('btnAdicionar');
const selectItem = document.getElementById('item-selecionado');
const listaServicosUl = document.getElementById('listaServicos');
const totalGeralInput = document.getElementById('totalGeral');

if (btnAdicionar && selectItem) {
    btnAdicionar.addEventListener('click', () => {
        const itemSelecionado = selectItem.value;
        const quantidadeInput = document.getElementById('quantidade');
        const valorInput = document.getElementById('valor');

        const ladoSelect = document.getElementById('lado-selecionado');
        const ladoValor = ladoSelect ? ladoSelect.value : '';

        // 1. Valida se o usuário selecionou algo
        if (!itemSelecionado) {
            alert('Por favor, selecione um serviço ou produto válido.');
            return;
        }

        const qtd = parseInt(quantidadeInput.value);
        const valorUnitarioOriginal = parseFloat(valorInput.value);

        if (isNaN(qtd) || qtd <= 0) {
            alert("Insira uma quantidade válida.");
            return;
        }
        if (isNaN(valorUnitarioOriginal) || valorUnitarioOriginal < 10) {
            alert("O valor unitário mínimo deve ser R$ 10,00.");
            return;
        }

        // Modificação no Nome: Se houver um lado selecionado (LD/LE), junta ao nome do item
        // Exemplo: "Troca de Amortecedor" vira "Troca de Amortecedor (LD)"
        const nomeCompletoItem = ladoValor ? `${itemSelecionado} (${ladoValor})` : itemSelecionado;

        // 2. Evita duplicados na lista (Varrendo o array correto)
        const itemExistente = servicosAdicionados.find(item => item.nome === itemSelecionado);
        if (itemExistente) {
            alert(`O item "${itemSelecionado}" já foi adicionado à lista.`);
            return;
        }

        // 3. Descobre qual é o optgroup (Grupo) para definir o ícone
        const opcaoSelecionada = selectItem.options[selectItem.selectedIndex];
        const optgroupPai = opcaoSelecionada.parentNode;
        const tipoGrupo = optgroupPai.tagName === 'OPTGROUP' ? optgroupPai.label.toLowerCase() : '';

        let icone = 'fas fa-wrench'; // Padrão para Serviços
        if (tipoGrupo.includes('produto') || tipoGrupo.includes('peça')) {
            icone = 'fas fa-box'; // Ícone para Produtos
        }

        // 4. Calcula o Desconto se aplicável
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

        // 5. Salva o objeto no array que a Impressão consome
        const novoServico = {
            id: Date.now(),
            nome: nomeCompletoItem,
            lado: ladoValor,
            icone: icone,
            qtd: qtd,
            valorOriginal: valorUnitarioOriginal,
            valorComDesconto: valorUnitarioComDesconto,
            desconto: descontoPorcentagem,
            total: subtotalFinal,

            // NOVO: Vincula o funcionário/usuário logado a este serviço específico
            usuario: usuarioLogado || sessionStorage.getItem('usuario_ativo') || "NÃO IDENTIFICADO"
        };

        /*const novoServico = {
            id: Date.now(),
            nome: nomeCompletoItem,
            lado: ladoValor,
            qtd: qtd,
            valorOriginal: valorUnitarioOriginal,
            valorComDesconto: valorUnitarioComDesconto,
            desconto: descontoPorcentagem,
            total: subtotalFinal
        };*/

        servicosAdicionados.push(novoServico);

        // 6. Atualiza a tela de forma limpa
        atualizarInterfaceServicos();

        // 7. Reseta os seletores para a próxima inserção
        selectItem.value = '';
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
                Excluir
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
    // Validação inicial dos campos obrigatórios
    const nomeCliente = document.getElementById('f_cliente_nome')?.value;
    const telCliente = document.getElementById('f_cliente_tel')?.value;
    const modVeiculo = document.getElementById('f_veiculo_mod')?.value;
    const placaVeiculo = document.getElementById('f_veiculo_placa')?.value;
    const kmVeiculo = document.getElementById('f_veiculo_quilometragem')?.value;

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
    // BLOCO 1: ATUALIZA A NOTA DE SERVIÇO PRINCIPAL
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
    if (document.getElementById('p_quilometragem')) document.getElementById('p_quilometragem').innerText = kmVeiculo;

    if (document.getElementById('p_status') && formaPagamentoSelect) {
        document.getElementById('p_status').innerText = 'Concluído / Pago via ' + formaPagamentoSelect.options[formaPagamentoSelect.selectedIndex].text;
    }

    if (document.getElementById('p_defeito')) document.getElementById('p_defeito').innerText = 'Manutenção / Reparo preventivo ou corretivo veicular.';
    if (document.getElementById('p_laudo')) document.getElementById('p_laudo').innerText = 'Substituição e ajustes dos componentes especificados com testes dinâmicos de rodagem concluídos.';

    // Lista dinâmica de serviços na Nota
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
    // BLOCO 2: CLONA PARA O TERMO DE GARANTIA
    // =========================================================
    if (document.getElementById('p_garantia_numero')) document.getElementById('p_garantia_numero').innerText = numeroNotaStr;
    if (document.getElementById('p_garantia_data')) document.getElementById('p_garantia_data').innerText = dataNotaStr;
    if (document.getElementById('p_garantia_cliente')) document.getElementById('p_garantia_cliente').innerText = nomeCliente;
    if (document.getElementById('p_garantia_telefone')) document.getElementById('p_garantia_telefone').innerText = telCliente;
    if (document.getElementById('p_garantia_veiculo')) document.getElementById('p_garantia_veiculo').innerText = modVeiculo;
    if (document.getElementById('p_garantia_placa')) document.getElementById('p_garantia_placa').innerText = placaVeiculo.toUpperCase();
    if (document.getElementById('p_garantia_km')) document.getElementById('p_garantia_km').innerText = kmVeiculo;

    // Salva o número sequencial no LocalStorage para controle interno
    const numeroAtualOriginal = numeroNotaStr.replace('#', '');
    localStorage.setItem('ultimo_numero_nota', numeroAtualOriginal);





    function enviarParaPlanilha(dadosNota) {
        // COLE AQUI A URL ATUALIZADA DO SEU APPS SCRIPT
        const URL_WEBHOOK = "https://script.google.com/macros/s/AKfycbwt7i6MK_mykNOPSCcHNZXx1kIEU3hcUXnu1Pa-29dADmfWi_bRv_NrsMJP0i-VfaUO/exec";

        fetch(URL_WEBHOOK, {
            method: "POST",
            mode: "no-cors", // Mantém desativado para o navegador não travar a página
            redirect: "follow", // OBRIGATÓRIO para o Apps Script aceitar requisições externas
            headers: {
                "Content-Type": "text/plain;charset=utf-8" // Impede que o navegador faça o bloqueio "Pre-flight"
            },
            body: JSON.stringify(dadosNota)
        })
            .then(() => {
                alert(`Nota #${dadosNota.numero} enviada para a Planilha com sucesso!`);
            })
            .catch(erro => {
                console.error("Erro ao salvar dados:", erro);
                alert("Houve um erro na comunicação.");
            });
    }




    // Dispara a visualização de impressão/salvamento nativa
    window.print();



    // =========================================================
    // ESTRUTURA OS DADOS EM FORMATO DE TABELA/OBJETO PARA A PLANILHA
    // =========================================================

    // Converte a lista de serviços em um texto corrido separado por quebras de linha para caber em uma célula
    let listaItensTexto = servicosAdicionados.map(item => {
        return `${item.nome} (x${item.qtd}) - R$ ${item.total.toFixed(2)}`;
    }).join("\n");

    // Descobre o operador ativo no momento da emissão
    const operadorAtual = sessionStorage.getItem('usuario_ativo') || "NÃO IDENTIFICADO";

    const dadosParaPlanilha = {
        numero: numeroNotaStr.replace('#', ''),
        data: dataNotaStr,
        usuario: operadorAtual,
        cliente: nomeCliente,
        telefone: document.getElementById('f_cliente_tel')?.value || 'Não Informado', // Se preferir salvar o ID do cliente nesta coluna
        veiculo: modVeiculo,
        placa: placaVeiculo.toUpperCase(),
        quilometragem: kmVeiculo,
        formaPagamento: formaPagamentoSelect ? formaPagamentoSelect.options[formaPagamentoSelect.selectedIndex].text : 'Não Informada',
        itens: listaItensTexto,
        total: totalGeralInput ? totalGeralInput.value : 'R$ 0,00'
    };

    // Envia o registro estruturado para o Google Sheets
    enviarParaPlanilha(dadosParaPlanilha);



    // Gera o próximo número automaticamente para a próxima venda
    definirProximoNumeroNota();
}

// ==========================================
// 5. LIMPEZA TOTAL DO FORMULÁRIO
// ==========================================
const btnLimpar = document.getElementById('btnLimpar');
if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
        if (confirm("Tem certeza que deseja limpar todo o formulário?")) {
            if (document.getElementById('f_nota_ref')) document.getElementById('f_nota_ref').value = '';
            if (document.getElementById('f_cliente_nome')) document.getElementById('f_cliente_nome').value = '';
            if (document.getElementById('f_cliente_tel')) document.getElementById('f_cliente_tel').value = '';
            if (document.getElementById('f_cliente_id')) document.getElementById('f_cliente_id').value = '';
            if (document.getElementById('f_veiculo_mod')) document.getElementById('f_veiculo_mod').value = '';
            if (document.getElementById('f_veiculo_placa')) document.getElementById('f_veiculo_placa').value = '';
            if (document.getElementById('f_veiculo_quilometragem')) document.getElementById('f_veiculo_quilometragem').value = '';
            if (document.getElementById('servico')) document.getElementById('servico').value = '';
            if (document.getElementById('lado-selecionado')) document.getElementById('lado-selecionado').value = '';
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

// ==========================================================
// FUNÇÃO PARA BUSCAR A OS E PREENCHER O FORMULÁRIO DE NOTAS
// ==========================================================
function puxarDadosDaOS() {
    const campoNumeroNota = document.getElementById('f_nota_ref');
    if (!campoNumeroNota) return;

    // Remove o '#' caso você digite com ele, deixando apenas os números (ex: 2601)
    const numeroBusca = campoNumeroNota.value.replace('#', '').trim();
    if (!numeroBusca) return;

    const historicoOS = JSON.parse(localStorage.getItem('historico_ordens_locais')) || {};
    const osEncontrada = historicoOS[numeroBusca];

    if (osEncontrada) {
        // Preenche os campos de texto do formulário de Nota de Serviço
        if (document.getElementById('f_cliente_nome')) document.getElementById('f_cliente_nome').value = osEncontrada.cliente || '';
        if (document.getElementById('f_cliente_tel')) document.getElementById('f_cliente_tel').value = osEncontrada.telefone || '';
        if (document.getElementById('f_cliente_id')) document.getElementById('f_cliente_id').value = osEncontrada.documento || '';
        if (document.getElementById('f_veiculo_mod')) document.getElementById('f_veiculo_mod').value = osEncontrada.modelo || '';
        if (document.getElementById('f_veiculo_placa')) document.getElementById('f_veiculo_placa').value = osEncontrada.serial || '';
        if (document.getElementById('f_veiculo_quilometragem')) document.getElementById('f_veiculo_quilometragem').value = osEncontrada.quilometragem || '';


        /*// CORREÇÃO: Aguarda a automação do sistema gerar o ID f_veiculo_quilometragem na tela
        setTimeout(() => {
            const campoKM = document.getElementById('f_veiculo_quilometragem');
            if (campoKM) {
                campoKM.value = osEncontrada.quilometragem || '';
            } else {
                console.error("Mesmo aguardando, o campo f_veiculo_quilometragem não foi achado.");
            }
        }, 150);*/

        // Limpa a lista atual de serviços da nota para colocar os da OS
        servicosAdicionados = [];

        // Trata os itens enviados pela OS para não quebrar os cálculos da nota
        if (osEncontrada.itens && Array.isArray(osEncontrada.itens)) {
            osEncontrada.itens.forEach((nomeItem, index) => {
                let icone = 'fas fa-wrench';
                if (nomeItem.toLowerCase().includes('produto') || nomeItem.toLowerCase().includes('peça')) {
                    icone = 'fas fa-box';
                }

                /*servicosAdicionados.push({
                    id: Date.now() + index,
                    nome: nomeItem,
                    icone: icone,
                    qtd: 1,                 // Define quantidade padrão como 1
                    valorOriginal: 10,      // Define o valor mínimo exigido pelo seu código (R$ 10,00)
                    valorComDesconto: 10,
                    desconto: 0,
                    total: 10               // Evita que o cálculo resulte em NaN
                });*/
            });
        }

        // Atualiza a lista visual na tela de notas e recalcula os totais
        atualizarInterfaceServicos();
    }
}