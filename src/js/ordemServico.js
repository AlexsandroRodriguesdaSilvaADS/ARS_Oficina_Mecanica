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
        "lindovaldo": "12345",
        "midiam": "12345"
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
// 3. GERENCIAMENTO DA LISTA DE SERVIÇOS E PRODUTOS
// ==========================================
const btnAdicionar = document.getElementById('btnAdicionar');
const selectItem = document.getElementById('item-selecionado');
const listaServicos = document.getElementById('listaServicos');

if (btnAdicionar && selectItem && listaServicos) {
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

const enviarParaSheetMonkey = (dadosOS, itens) => {
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
        Itens_Adicionados: itens
    };

    fetch('https://api.sheetmonkey.io/form/YysUFctamTP45zycCGFKA', {
        method: 'post',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosParaEnviar),
    })
    .then(() => console.log('Dados salvos na planilha com sucesso!'))
    .catch(err => console.error('Erro ao salvar na planilha:', err));
}

// ==========================================
// 4. PROCESSAR DADOS E ABRIR TELA DE IMPRESSÃO
// ==========================================
function gerarOS(event) {
    event.preventDefault();

    if (!listaServicos) return;
    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const camposObrigatorios = [
        'f_numero', 'f_status', 'f_cliente', 'f_telefone',
        'f_objeto', 'f_modelo', 'f_serial', 'f_quilometragem', 'f_defeito', 'f_laudo'
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

    const historicoOS = JSON.parse(localStorage.getItem('historico_ordens_locais')) || {};
    const listaItensFinais = Array.from(itensServico).map(li => {
        return li.innerText.replace(/[\n\r]+/g, ' ').replace('Excluir', '').trim();
    });

    historicoOS[dadosOS.numero] = { ...dadosOS, itens: listaItensFinais };
    localStorage.setItem('historico_ordens_locais', JSON.stringify(historicoOS));

    // Atualização dos elementos da tela de impressão com checagem de existência
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
            const txtServico = li.innerText.replace(/[\n\r]+/g, ' ').replace('Excluir', '').trim();
            const novoLi = document.createElement('li');
            novoLi.textContent = txtServico;
            pLista.appendChild(novoLi);
        });
    }

    const listaTexto = listaItensFinais.join(', ');
    enviarParaSheetMonkey(dadosOS, listaTexto);

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
    const form = document.getElementById('os-form');
    if (form) form.reset();
    if (listaServicos) listaServicos.innerHTML = '';
    
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


/*// ==========================================
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
        Quilometragem: dadosOS.quilometragem,
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

    // Importante: certifique-se de que a variável 'listaServicos' existe globalmente, 
    // caso contrário, adicione: const listaServicos = document.getElementById('listaServicos');
    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const camposObrigatorios = [
        'f_numero', 'f_status', 'f_cliente', 'f_telefone',
        'f_objeto', 'f_modelo', 'f_serial', 'f_quilometragem', 'f_defeito', 'f_laudo'
    ];

    for (const id of camposObrigatorios) {
        const campo = document.getElementById(id);

        // 1. Verifica se o campo existe no HTML
        if (!campo) {
            alert(`Erro interno: O campo com ID "${id}" não foi encontrado no sistema.`);
            return;
        }

        // 2. Verifica se está vazio
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

    // Salva no LocalStorage
    const historicoOS = JSON.parse(localStorage.getItem('historico_ordens_locais')) || {};

    const listaItensFinais = Array.from(itensServico).map(li => {
        return li.innerText.replace(/[\n\r]+/g, ' ').replace('Excluir', '').trim();
    });

    historicoOS[dadosOS.numero] = {
        ...dadosOS,
        itens: listaItensFinais
    };

    localStorage.setItem('historico_ordens_locais', JSON.stringify(historicoOS));

    // Preenche a área de visualização técnica da OS (com tratamento seguro para evitar erros)
    if (document.getElementById('p_numero')) document.getElementById('p_numero').textContent = dadosOS.numero;
    if (document.getElementById('p_status')) document.getElementById('p_status').textContent = dadosOS.status;
    if (document.getElementById('p_cliente')) document.getElementById('p_cliente').textContent = dadosOS.cliente;
    if (document.getElementById('p_documento')) document.getElementById('p_documento').textContent = dadosOS.documento;
    if (document.getElementById('p_telefone')) document.getElementById('p_telefone').textContent = dadosOS.telefone;
    if (document.getElementById('p_email')) document.getElementById('p_email').textContent = dadosOS.email;
    if (document.getElementById('p_objeto')) document.getElementById('p_objeto').textContent = dadosOS.objeto;
    if (document.getElementById('p_modelo')) document.getElementById('p_modelo').textContent = dadosOS.modelo;
    if (document.getElementById('p_serial')) document.getElementById('p_serial').textContent = dadosOS.serial;
    if (document.getElementById('p_quilometragem')) document.getElementById('p_quilometragem').textContent = dadosOS.quilometragem;
    if (document.getElementById('p_defeito')) document.getElementById('p_defeito').textContent = dadosOS.defeito;
    if (document.getElementById('p_laudo')) document.getElementById('p_laudo').textContent = dadosOS.laudo;
    if (document.getElementById('p_data')) document.getElementById('p_data').textContent = dadosOS.data;

    // Correção do loop da lista (Limpado e fechado corretamente)
    const pLista = document.getElementById('p_lista');
    if (pLista) {
        pLista.innerHTML = '';
        itensServico.forEach(li => {
            const txtServico = li.innerText.replace(/[\n\r]+/g, ' ').replace('Excluir', '').trim();
            const novoLi = document.createElement('li');
            novoLi.textContent = txtServico;
            pLista.appendChild(novoLi);
        });
    }

    const listaTexto = listaItensFinais.join(', ');
    enviarParaSheetMonkey(dadosOS, listaTexto);

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
});*/