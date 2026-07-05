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
    document.getElementById('f_numero').value = proximo;
}

// ==========================================
// 2. CONTROLE DE ACESSO (LOGIN / LOGOUT)
// ==========================================
function autenticar(event) {
    event.preventDefault();
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();
    const errorMsg = document.getElementById('login-error');

    if (user === "admin" && pass === "1234") {
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

// ==========================================
// 3. GERENCIAMENTO DA LISTA DE SERVIÇOS E PRODUTOS
// ==========================================
const btnAdicionar = document.getElementById('btnAdicionar');
const selectItem = document.getElementById('item-selecionado');
const listaServicos = document.getElementById('listaServicos');

if (btnAdicionar && selectItem) {
    btnAdicionar.addEventListener('click', () => {
        const itemSelecionado = selectItem.value;

        if (!itemSelecionado) {
            alert('Por favor, selecione um serviço ou produto válido.');
            return;
        }

        const itensAtuais = Array.from(listaServicos.querySelectorAll('li')).map(li => li.dataset.value);
        if (itensAtuais.includes(itemSelecionado)) {
            alert('Este item já foi adicionado.');
            return;
        }

        const opcaoSelecionada = selectItem.options[selectItem.selectedIndex];
        const optgroupPai = opcaoSelecionada.parentNode;
        const tipoGrupo = optgroupPai.tagName === 'OPTGROUP' ? optgroupPai.label : '';

        let icone = 'fas fa-wrench';
        if (tipoGrupo.toLowerCase().includes('produto')) {
            icone = 'fas fa-box';
        } else if (tipoGrupo.toLowerCase().includes('serviço')) {
            icone = 'fas fa-wrench';
        }

        const li = document.createElement('li');
        li.dataset.value = itemSelecionado;
        li.innerHTML = `
            <span>
                <i class="${icone}" style="margin-right: 8px; color: #1a365d;"></i>
                ${itemSelecionado}
            </span>
            <button type="button" class="btn-remove-item" style="background:none; border:none; color:#e53e3e; cursor:pointer;" title="Remover">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        li.querySelector('.btn-remove-item').addEventListener('click', () => li.remove());

        listaServicos.appendChild(li);
        selectItem.value = "";
    });
}

// Alteramos a função para receber os dados prontos como argumento
const enviarParaSheetMonkey = (dadosOS, itens) => {

    // Criamos o objeto final que vai virar colunas na sua planilha
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
        Defeito: dadosOS.defeito,
        Laudo: dadosOS.laudo,
        Data: dadosOS.data,
        Itens_Adicionados: itens // Aqui vai a lista de serviços/produtos como texto
    };

    fetch('https://api.sheetmonkey.io/form/YysUFctamTP45zycCGFKA', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar), // Enviamos o objeto completo
    })
        .then(() => console.log('Dados salvos na planilha com sucesso!'))
        .catch(err => console.error('Erro ao salvar na planilha:', err));
}

// ==========================================
// 4. PROCESSAR DADOS E ABRIR TELA DE IMPRESSÃO
// ==========================================
function gerarOS(event) {
    event.preventDefault();

    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const camposObrigatorios = [
        'f_numero', 'f_status', 'f_cliente', 'f_telefone', 
        'f_objeto', 'f_modelo', 'f_serial', 'f_defeito', 'f_laudo'
    ];

    for (const id of camposObrigatorios) {
        const campo = document.getElementById(id);
        if (!campo || campo.value.trim() === '') {
            alert('Por favor, preencha todos os campos do formulário antes de gerar a OS.');
            campo.focus();
            return;
        }
    }

    const dadosOS = {
        numero: document.getElementById('f_numero').value,
        status: document.getElementById('f_status').value,
        cliente: document.getElementById('f_cliente').value,
        documento: document.getElementById('f_documento').value,
        telefone: document.getElementById('f_telefone').value,
        email: document.getElementById('f_email').value,
        objeto: document.getElementById('f_objeto').value,
        modelo: document.getElementById('f_modelo').value,
        serial: document.getElementById('f_serial').value,
        defeito: document.getElementById('f_defeito').value,
        laudo: document.getElementById('f_laudo').value,
        data: new Date().toLocaleDateString('pt-BR')
    };

    // ==========================================================
    // CORREÇÃO: SALVA A OS EXATAMENTE COMO A NOTA PRECISA
    // ==========================================================
    const historicoOS = JSON.parse(localStorage.getItem('historico_ordens_locais')) || {};
    
    // Captura o texto limpo de cada serviço adicionado
    const listaItensFinais = Array.from(itensServico).map(li => {
        return li.innerText.replace(/[\n\r]+/g, ' ').replace('Excluir', '').trim();
    });

    historicoOS[dadosOS.numero] = {
        ...dadosOS,
        itens: listaItensFinais
    };

    localStorage.setItem('historico_ordens_locais', JSON.stringify(historicoOS));
    // ==========================================================

    // Preenche a área de visualização técnica da OS
    document.getElementById('p_numero').textContent = dadosOS.numero;
    document.getElementById('p_status').textContent = dadosOS.status;
    document.getElementById('p_cliente').textContent = dadosOS.cliente;
    document.getElementById('p_documento').textContent = dadosOS.documento;
    document.getElementById('p_telefone').textContent = dadosOS.telefone;
    document.getElementById('p_email').textContent = dadosOS.email;
    document.getElementById('p_objeto').textContent = dadosOS.objeto;
    document.getElementById('p_modelo').textContent = dadosOS.modelo;
    document.getElementById('p_serial').textContent = dadosOS.serial;
    document.getElementById('p_defeito').textContent = dadosOS.defeito;
    document.getElementById('p_laudo').textContent = dadosOS.laudo;
    document.getElementById('p_data').textContent = dadosOS.data;

    const pLista = document.getElementById('p_lista');
    pLista.innerHTML = '';
    itensServico.forEach(li => {
        const txtServico = li.innerText.replace(/[\n\r]+/g, ' ').trim();
        const novoLi = document.createElement('li');
        novoLi.textContent = txtServico;
        pLista.appendChild(novoLi);
    });

    const listaTexto = listaItensFinais.join(', ');
    enviarParaSheetMonkey(dadosOS, listaTexto);

    const printArea = document.getElementById('print-area');
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




/*function gerarOS(event) {
    event.preventDefault();

    // 1. Verifica se há serviços adicionados
    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    // 2. Lista de todos os IDs dos campos do formulário que DEVEM ser preenchidos
    const camposObrigatorios = [
        'f_numero',
        'f_status',
        'f_cliente',
        //'f_documento'
        'f_telefone',
        //'f_email'
        'f_objeto',
        'f_modelo',
        'f_serial',
        'f_defeito',
        'f_laudo'
    ];

    // 3. Verifica se algum campo está vazio
    for (const id of camposObrigatorios) {
        const campo = document.getElementById(id);
        if (!campo || campo.value.trim() === '') {
            alert('Por favor, preencha todos os campos do formulário antes de gerar a OS.');
            campo.focus(); // Coloca o cursor no campo que está faltando
            return; // Para a execução do código aqui
        }
    }

    // Se passou pelas validações, captura os dados com a certeza de que estão preenchidos
    const dadosOS = {
        numero: document.getElementById('f_numero').value,
        status: document.getElementById('f_status').value,
        cliente: document.getElementById('f_cliente').value,
        documento: document.getElementById('f_documento').value,
        telefone: document.getElementById('f_telefone').value,
        email: document.getElementById('f_email').value,
        objeto: document.getElementById('f_objeto').value,
        modelo: document.getElementById('f_modelo').value,
        serial: document.getElementById('f_serial').value,
        defeito: document.getElementById('f_defeito').value,
        laudo: document.getElementById('f_laudo').value,
        data: new Date().toLocaleDateString('pt-BR')
    };

    // Preenche a área de visualização técnica da OS
    document.getElementById('p_numero').textContent = dadosOS.numero;
    document.getElementById('p_status').textContent = dadosOS.status;
    document.getElementById('p_cliente').textContent = dadosOS.cliente;
    document.getElementById('p_documento').textContent = dadosOS.documento;
    document.getElementById('p_telefone').textContent = dadosOS.telefone;
    document.getElementById('p_email').textContent = dadosOS.email;
    document.getElementById('p_objeto').textContent = dadosOS.objeto;
    document.getElementById('p_modelo').textContent = dadosOS.modelo;
    document.getElementById('p_serial').textContent = dadosOS.serial;
    document.getElementById('p_defeito').textContent = dadosOS.defeito;
    document.getElementById('p_laudo').textContent = dadosOS.laudo;
    document.getElementById('p_data').textContent = dadosOS.data;

    const pLista = document.getElementById('p_lista');
    pLista.innerHTML = '';

    itensServico.forEach(li => {
        const txtServico = li.innerText.replace(/[\n\r]+/g, ' ').trim();
        const novoLi = document.createElement('li');
        novoLi.textContent = txtServico;
        pLista.appendChild(novoLi);
    });

    // Captura os itens da lista e junta tudo em um único texto separado por vírgulas
    const listaTexto = Array.from(itensServico)
        .map(li => li.innerText.replace(/[\n\r]+/g, ' ').trim())
        .join(', ');

    // Chame a função de envio passando os dados do formulário e a lista de itens
    enviarParaSheetMonkey(dadosOS, listaTexto);

    const printArea = document.getElementById('print-area');

    // 1. Guarda o título original da aba do sistema para restaurar depois
    const tituloOriginal = document.title;

    // 2. Define o novo título que dará nome ao arquivo PDF gerado pelo navegador
    const clienteLimpo = dadosOS.cliente.replace(/[/\\?%*:|"<>]/g, '-');
    document.title = `OS_${dadosOS.numero}_${clienteLimpo}`;

    // 3. Ativa a exibição da área e insere a classe de impressão no body
    printArea.style.display = 'block';
    document.body.classList.add('modo-impressao-os');

    // 4. Aguarda o navegador processar a renderização do HTML antes de chamar a impressão
    setTimeout(() => {
        window.print();

        // 5. Após fechar a janela de impressão, restaura as configurações originais
        document.title = tituloOriginal;
        document.body.classList.remove('modo-impressao-os');
        printArea.style.display = 'none';

        incrementarNumeroOS();
        limparCamposFormulario();
    }, 250);
}*/

// ==========================================
// 5. LIMPAR FORMULÁRIO
// ==========================================
function limparFormulario() {
    if (confirm('Tem certeza que deseja limpar todo o formulário?')) {
        limparCamposFormulario();
    }
}

function limparCamposFormulario() {
    const numeroAtual = localStorage.getItem('proximo_numero_os');
    document.getElementById('os-form').reset();
    listaServicos.innerHTML = '';
    document.getElementById('f_numero').value = numeroAtual;
}

// ==========================================
// 6. CONFIGURAÇÃO INICIAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    inicializarNumeroOS();
});