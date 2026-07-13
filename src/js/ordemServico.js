// ==========================================
// 1. CONTROLADOR DO NÚMERO SEQUENCIAL (OS)
// ==========================================
function inicializarNumeroOS() {
    const fNumero = document.getElementById('f_numero');
    if (!fNumero) return;

    if (!localStorage.getItem('proximo_numero_os')) {
        localStorage.setItem('proximo_numero_os', '2601');
    }

    fNumero.value = localStorage.getItem('proximo_numero_os');
    fNumero.readOnly = true;
}

function incrementarNumeroOS() {
    let atual = parseInt(localStorage.getItem('proximo_numero_os'), 10) || 1001;
    let proximo = atual + 1;
    localStorage.setItem('proximo_numero_os', proximo.toString());

    const fNumero = document.getElementById('f_numero');
    if (fNumero) fNumero.value = proximo;
}

// ==========================================
// 2. CONTROLE DE ACESSO (LOGIN / LOGOUT)
// ==========================================
let usuarioLogado = "";

function autenticar(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim().toLowerCase();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('login-error');

    const usuariosPermitidos = {
        "alex": "047874",
        "lindovaldo": "123456",
        "midiam": "123456"
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
        if (errorMsg) errorMsg.style.display = 'none';
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';

        inicializarNumeroOS();
        event.target.reset();
    } else {
        if (errorMsg) errorMsg.style.display = 'block';
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

// ==========================================
// 2. CONTROLE DE FORMA DE PAGAMENTO E DESCONTO
// ==========================================
const formaPagamentoSelect = document.getElementById('formaPagamento');
const descontoInput = document.getElementById('desconto');

if (formaPagamentoSelect && descontoInput) {
    formaPagamentoSelect.addEventListener('change', function () {
        // Habilita desconto de 5% a 10% apenas para Pix ou Dinheiro
        if (this.value === 'pix' || this.value === 'dinheiro') {
            descontoInput.disabled = false;
            descontoInput.value = 5; // Desconto padrão sugerido inicial
        } else {
            descontoInput.disabled = true;
            descontoInput.value = '';
        }
    });
}

// ==========================================
// 3. GERENCIAMENTO DA LISTA DE SERVIÇOS
// ==========================================
let servicosAdicionados = []; // O array que guarda os itens adicionados
const btnAdicionar = document.getElementById('btnAdicionar');
const selectItem = document.getElementById('item-selecionado');
const listaServicosUl = document.getElementById('listaServicos');
const totalGeralInput = document.getElementById('totalGeral');

if (btnAdicionar && selectItem) {
    btnAdicionar.addEventListener('click', () => {
        const itemSelecionado = selectItem.value;
        const quantidadeInput = document.getElementById('quantidade');
        const valorInput = document.getElementById('valor');
        const ladoSelect = document.getElementById('ladoSelecionado');
        const ladoValor = ladoSelect ? ladoSelect.value : '';

        // 1. Validações básicas de preenchimento
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

        // Formatação do Nome: Se houver lado selecionado, adiciona ao texto do item
        // Exemplo: "Amortecedor dianteiro (LD)" ou "Pastilhas de freios (LD / LE)"
        const nomeCompletoItem = ladoValor ? `${itemSelecionado} (${ladoValor})` : itemSelecionado;

        // 2. Evita duplicados idênticos na lista (Varre pelo nome completo + lado montado)
        const itemExistente = servicosAdicionados.find(item => item.nome === itemSelecionado); //nomeCompletoItem
        if (itemExistente) {
            alert(`O item "${itemSelecionado}" já foi adicionado à lista.`);
            return;
        }

        // 3. Identifica se é Serviço ou Produto/Peça pelo optgroup para definir o ícone
        const opcaoSelecionada = selectItem.options[selectItem.selectedIndex];
        const optgroupPai = opcaoSelecionada.parentNode;
        const tipoGrupo = optgroupPai.tagName === 'OPTGROUP' ? optgroupPai.label.toLowerCase() : '';

        let icone = 'fas fa-wrench'; // Ícone padrão para Serviços
        if (tipoGrupo.includes('produto') || tipoGrupo.includes('peça')) {
            icone = 'fas fa-box'; // Ícone para Produtos / Peças
        }

        // 4. Tratamento e cálculo do Desconto (Caso o campo esteja ativo)
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

        // 5. Estrutura do objeto salva no array global
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
            // Puxa o usuário ativo se houver controle de login no seu app
            usuario: (typeof usuarioLogado !== 'undefined' ? usuarioLogado : null) || sessionStorage.getItem('usuario_ativo') || "NÃO IDENTIFICADO"
        };

        servicosAdicionados.push(novoServico);

        // 6. Chama a função que renderiza as `<li>` na tela
        /*if (typeof atualizarInterfaceServicos === 'function') {
            atualizarInterfaceServicos();
        } else {
            console.error("A função atualizarInterfaceServicos() não foi implementada ainda.");
        }*/
        atualizarInterfaceServicos();

        // 7. Reseta os campos do formulário para o próximo item
        selectItem.value = '';
        if (ladoSelect) ladoSelect.value = '';
        quantidadeInput.value = '1';
        if (valorInput) valorInput.value = '';
    });
}

// ==========================================
// 4. RENDERIZAÇÃO DA INTERFACE (CRIAR AS LI)
// ==========================================
function atualizarInterfaceServicos() {
    // 1. Limpa a lista atual para não duplicar visualmente
    listaServicosUl.innerHTML = '';

    let totalAcumuladoOS = 0;

    // 2. Se não houver itens, mostra uma mensagem amigável ou deixa vazia
    if (servicosAdicionados.length === 0) {
        listaServicosUl.innerHTML = '<li class="lista-vazia">Nenhum serviço ou produto adicionado.</li>';
        if (totalGeralInput) totalGeralInput.value = 'R$ 0,00';

        // Atualiza também a label de total geral caso use ela em algum lugar da tela
        const labelTotalOS = document.getElementById('valor-total-os');
        if (labelTotalOS) labelTotalOS.innerText = 'R$ 0,00';
        return;
    }

    // 3. Percorre o array e cria o HTML de cada item dinamicamente
    servicosAdicionados.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'item-servico-adicionado'; // Você pode estilizar essa classe no seu CSS

        // Acumula o valor para o total geral
        totalAcumuladoOS += item.total;

        // Monta o conteúdo interno da LI usando os dados do objeto
        li.innerHTML = `
            <div class="item-info">
                <i class="${item.icone}"></i> 
                <strong>${item.nome}</strong>
                <span class="item-detalhes">
                    (${item.qtd}x - R$ ${item.valorComDesconto.toFixed(2)})
                    ${item.desconto > 0 ? `<small class="txt-desconto">-${item.desconto}%</small>` : ''}
                </span>
            </div>
            <div class="item-valores">
                <span class="item-subtotal">R$ ${item.total.toFixed(2)}</span>
                <button type="button" class="btn-remover-item" data-id="${item.id}" title="Remover item">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        // Adiciona a LI recém-criada dentro da sua UL do HTML
        listaServicosUl.appendChild(li);
    });

    // 4. Atualiza os campos de preço total na tela
    const totalFormatado = `R$ ${totalAcumuladoOS.toFixed(2).replace('.', ',')}`;

    if (totalGeralInput) {
        totalGeralInput.value = totalFormatado;
    }

    // Alimenta também a tag onde a função da planilha busca o total geral
    const labelTotalOS = document.getElementById('valor-total-os');
    if (labelTotalOS) {
        labelTotalOS.innerText = totalFormatado;
    }

    // 5. Ativa os eventos de clique dos botões "Remover" de cada LI criada
    configurarBotoesRemover();
}

// Funçao auxiliar para fazer o botão de lixeira (remover) funcionar
function configurarBotoesRemover() {
    const botoesRemover = listaServicosUl.querySelectorAll('.btn-remover-item');

    botoesRemover.forEach(botao => {
        botao.addEventListener('click', function () {
            const idParaRemover = parseInt(this.getAttribute('data-id'));

            // Filtra o array removendo o item que possui o ID clicado
            servicosAdicionados = servicosAdicionados.filter(item => item.id !== idParaRemover);

            // Recarrega as LI's na tela com o array atualizado
            atualizarInterfaceServicos();
        });
    });
}

// ==========================================
// 5. PROCESSAR DADOS E ABRIR TELA DE IMPRESSÃO
// ==========================================
function gerarOS(event) {
    // Evita erro caso a função seja chamada sem o parâmetro event no HTML
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }

    // CORREÇÃO: Usa 'listaServicosUl' que foi a variável declarada globalmente no seu código
    if (!listaServicosUl) {
        alert('Erro interno: O elemento da lista de serviços não foi mapeado corretamente.');
        return;
    }
    
    const itensServico = listaServicosUl.querySelectorAll('li');
    
    // Verifica se a lista está vazia ou contém apenas o aviso de lista vazia
    if (itensServico.length === 0 || (itensServico.length === 1 && itensServico[0].classList.contains('lista-vazia'))) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const camposObrigatorios = [
        'f_numero', 'f_status', 'f_cliente', 'f_telefone',
        'f_objeto', 'f_modelo', 'f_serial', 'f_quilometragem', 'f_defeito', 'f_laudo',
    ];

    for (const id of camposObrigatorios) {
        const campo = document.getElementById(id);
        if (!campo) {
            alert(`Erro interno: O campo com ID "${id}" não foi encontrado no sistema.`);
            return;
        }
        if (campo.value.trim() === '') {
            alert('Por favor, preencha todos os campos do formulário antes de gerar a OS.');
            campo.focus();
            return;
        }
    }

    const dadosOS = {
        numero: document.getElementById('f_numero').value,
        status: document.getElementById('f_status').value,
        cliente: document.getElementById('f_cliente').value,
        documento: document.getElementById('f_documento')?.value || 'NÃO INFORMADO',
        telefone: document.getElementById('f_telefone').value,
        email: document.getElementById('f_email')?.value || 'NÃO INFORMADO',
        objeto: document.getElementById('f_objeto').value,
        modelo: document.getElementById('f_modelo').value,
        serial: document.getElementById('f_serial').value,
        quilometragem: document.getElementById('f_quilometragem').value,
        defeito: document.getElementById('f_defeito').value,
        laudo: document.getElementById('f_laudo').value,
        data: new Date().toLocaleDateString('pt-BR')
    };

    // Salva no histórico local do navegador
    const historicoOS = JSON.parse(localStorage.getItem('historico_ordens_locais')) || {};
    
    // Formata os textos para o histórico local
    const listaItensFinais = Array.from(itensServico).map(li => {
        return li.innerText.replace(/[\n\r]+/g, ' ').replace('Remover item', '').replace('Excluir', '').trim();
    });

    historicoOS[dadosOS.numero] = { ...dadosOS, itens: listaItensFinais };
    localStorage.setItem('historico_ordens_locais', JSON.stringify(historicoOS));

    // Preenche os elementos visuais da tela de impressão
    const preencherTexto = (id, texto) => {
        const el = document.getElementById(id);
        if (el) el.textContent = texto;
    };

    preencherTexto('p_numero', dadosOS.numero);
    preencherTexto('p_status', dadosOS.status);
    preencherTexto('p_cliente', dadosOS.cliente);
    preencherTexto('p_documento', dadosOS.documento);
    preencherTexto('p_telefone', dadosOS.telefone);
    preencherTexto('p_email', dadosOS.email);
    preencherTexto('p_objeto', dadosOS.objeto);
    preencherTexto('p_modelo', dadosOS.modelo);
    preencherTexto('p_serial', dadosOS.serial);
    preencherTexto('p_quilometragem', dadosOS.quilometragem);
    preencherTexto('p_defeito', dadosOS.defeito);
    preencherTexto('p_laudo', dadosOS.laudo);
    preencherTexto('p_data', dadosOS.data);

    const pLista = document.getElementById('p_lista');
    if (pLista) {
        pLista.innerHTML = '';
        itensServico.forEach(li => {
            const txtServico = li.innerText.replace(/[\n\r]+/g, ' ').replace('Remover item', '').replace('Excluir', '').trim();
            const novoLi = document.createElement('li');
            novoLi.textContent = txtServico;
            pLista.appendChild(novoLi);
        });
    }

    // CORREÇÃO: Envia o array estruturado original (servicosAdicionados) em vez de apenas texto convertido
    enviarParaSheetMonkey(dadosOS, servicosAdicionados);

    const printArea = document.getElementById('print-area');
    if (!printArea) {
        alert('Erro: O elemento com ID "print-area" não foi encontrado no HTML.');
        return;
    }

    const tituloOriginal = document.title;
    const clienteLimpo = dadosOS.cliente.replace(/[/\\?%*:|"<>]/g, '-');
    document.title = `OS_${dadosOS.numero}_${clienteLimpo}`;

    printArea.style.display = 'block';
    document.body.classList.add('modo-impressao-os');

    setTimeout(() => {
        window.print();
        document.title = tituloOriginal;
        document.body.classList.remove('modo-impressao-os');
        printArea.style.display = 'none';
        incrementarNumeroOS();
        limparCamposFormulario();
    }, 250);
}

// CORREÇÃO: Função do Sheet Monkey reativada e sincronizada com o seu array global
function enviarParaSheetMonkey(dadosOS, itens) {
    const textoTotal = document.getElementById('valor-total-os')?.innerText || 'R$ 0,00';

    const itensFormatadosTexto = Array.isArray(itens) && itens.length > 0
        ? itens.map((item, index) => {
            const detalheLado = item.lado ? ` | Lado: ${item.lado}` : '';
            const detalheDesconto = item.desconto > 0 ? ` | Desc: ${item.desconto}%` : '';
            const detalheUsuario = item.usuario ? ` | Por: ${item.usuario}` : '';

            return `${index + 1}. [${item.qtd}x] ${item.nome}${detalheLado} (Unit: R$ ${parseFloat(item.valorOriginal).toFixed(2)}${detalheDesconto}) -> Subtotal: R$ ${parseFloat(item.total).toFixed(2)}${detalheUsuario}`;
        }).join('\n')
        : 'Nenhum item ou serviço adicionado.';

    const dadosParaEnviar = {
        Numero_OS: dadosOS.numero,
        Status: dadosOS.status,
        Cliente: dadosOS.cliente,
        Documento: dadosOS.documento,
        Telefone: dadosOS.telefone,
        Email: dadosOS.email,
        Veiculo: dadosOS.objeto,
        Modelo: dadosOS.modelo,
        Placa: dadosOS.serial,
        Quilometragem: dadosOS.quilometragem,
        Defeito: dadosOS.defeito,
        Laudo: dadosOS.laudo,
        Data: dadosOS.data,
        Itens_Adicionados: itensFormatadosTexto, 
        Valor_Total: textoTotal
    };

    fetch('https://api.sheetmonkey.io/form/YysUFctamTP45zycCGFKA', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
    })
    .then(response => {
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
        console.log('Dados salvos na planilha com sucesso!');
    })
    .catch(err => console.error('Erro ao salvar na planilha:', err));
}

// ==========================================
// 6. LIMPAR FORMULÁRIO
// ==========================================
function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todo o formulário?')) {
        limparCamposFormulario();
    }
}

function limparCamposFormulario() {
    const numeroAtual = localStorage.getItem('proximo_numero_os');
    const form = document.getElementById('os-form');
    if (form) form.reset();
    
    // CORREÇÃO: Alterado de listaServicos para listaServicosUl para manter coerência
    if (listaServicosUl) {
        listaServicosUl.innerHTML = '';
    }

    // CORREÇÃO: Esvazia também o array de controle para a próxima OS vir vazia
    servicosAdicionados = [];

    // Zera o texto do totalizador ao limpar tudo
    const elementoTotal = document.getElementById('valor-total-os');
    if (elementoTotal) elementoTotal.innerHTML = 'Total Geral: R$ 0,00';

    const fNumero = document.getElementById('f_numero');
    if (fNumero) fNumero.value = numeroAtual;
}

// ==========================================
// 6. CONFIGURAÇÃO INICIAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const loginScreen = document.getElementById('login-screen');
    const mainContent = document.getElementById('main-content');

    if (loginScreen) loginScreen.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
    inicializarNumeroOS();

    // Recarrega o nome do usuário na tela caso a página seja atualizada
    const usuarioSalvo = sessionStorage.getItem('usuario_ativo');
    const elementoNome = document.getElementById('nome-usuario-logado');
    if (usuarioSalvo && elementoNome) {
        elementoNome.innerText = usuarioSalvo;
    }
});


const script_do_google = 'https://script.google.com/macros/s/AKfycby_NMAhlUh5NEU6j6ADXpwkH9aut6j6pHYQm61IyvW9Nsq10aOsuaGZHGln5Le8egrK/exec';
const dados_do_formulario = document.forms['os-form'];

dados_do_formulario.addEventListener('submit', function (e) {
    e.preventDefault();
    
    fetch(script_do_google, { 
        method: 'POST',
        mode: 'no-cors',
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
