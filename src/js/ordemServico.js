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

    const dadosOS = {
        numero: document.getElementById('f_numero').value,
        status: document.getElementById('f_status').value,
        cliente: document.getElementById('f_cliente').value,
        documento: document.getElementById('f_documento').value || 'NÃO INFORMADO',
        telefone: document.getElementById('f_telefone').value,
        email: document.getElementById('f_email').value || 'NÃO INFORMADO',
        objeto: document.getElementById('f_objeto').value,
        modelo: document.getElementById('f_modelo').value,
        serial: document.getElementById('f_serial').value,
        defeito: document.getElementById('f_defeito').value,
        laudo: document.getElementById('f_laudo').value || 'EM ANÁLISE, INCONCLUSIVO',
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
    // Remove caracteres especiais do nome do cliente para evitar problemas no arquivo
    const clienteLimpo = dadosOS.cliente.replace(/[/\\?%*:|"<>]/g, '-');
    document.title = `OS_${dadosOS.numero}_${clienteLimpo}`;

    // 3. Ativa a exibição da área e insere a classe de impressão no body
    printArea.style.display = 'block';
    document.body.classList.add('modo-impressao-os');

    // 4. Aguarda o navegador processar a renderização do HTML antes de chamar a impressão
    setTimeout(() => {
        window.print();

        // 5. Após fechar a janela de impressão, restaura as configurações originais
        document.title = tituloOriginal; // Restaura o título da aba
        document.body.classList.remove('modo-impressao-os');
        printArea.style.display = 'none';

        incrementarNumeroOS();
        limparCamposFormulario();
    }, 250);
}

/*function gerarOS(event) {
    event.preventDefault();

    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const dadosOS = {
        numero: document.getElementById('f_numero').value,
        status: document.getElementById('f_status').value,
        cliente: document.getElementById('f_cliente').value,
        documento: document.getElementById('f_documento').value || 'NÃO INFORMADO',
        telefone: document.getElementById('f_telefone').value,
        email: document.getElementById('f_email').value || 'NÃO INFORMADO',
        objeto: document.getElementById('f_objeto').value,
        modelo: document.getElementById('f_modelo').value,
        serial: document.getElementById('f_serial').value,
        defeito: document.getElementById('f_defeito').value,
        laudo: document.getElementById('f_laudo').value || 'EM ANÁLISE, INCONCLUSIVO',
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
        const txtServico = li.innerText.trim();
        const novoLi = document.createElement('li');
        novoLi.textContent = txtServico;
        pLista.appendChild(novoLi);
    });

    const printArea = document.getElementById('print-area');

    // 1. Torna a área da OS visível para a captura do navegador
    printArea.style.display = 'block';

    // 2. Adiciona a classe de controle no body para o CSS ocultar o resto do sistema
    document.body.classList.add('modo-impressao-os');

    // 3. Abre a janela nativa de impressão imediatamente
    window.print();

    // 4. Remove a classe de controle e oculta o print-area após fechar a janela de impressão
    document.body.classList.remove('modo-impressao-os');
    printArea.style.display = 'none';

    // 5. Finaliza incrementando o número da OS e limpando a interface
    incrementarNumeroOS();
    limparCamposFormulario();
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
const selectItem = document.getElementById('item-selecionado'); // Atualizado para o novo ID
const listaServicos = document.getElementById('listaServicos');

if (btnAdicionar && selectItem) {
    btnAdicionar.addEventListener('click', () => {
        const itemSelecionado = selectItem.value;

        if (!itemSelecionado) {
            alert('Por favor, selecione um serviço ou produto válido.');
            return;
        }

        // Evita duplicados na lista
        const itensAtuais = Array.from(listaServicos.querySelectorAll('li')).map(li => li.dataset.value);
        if (itensAtuais.includes(itemSelecionado)) {
            alert('Este item já foi adicionado.');
            return;
        }

        // Descobre se é Serviço ou Produto olhando o rótulo (label) do optgroup pai
        const opcaoSelecionada = selectItem.options[selectItem.selectedIndex];
        const optgroupPai = opcaoSelecionada.parentNode;
        const tipoGrupo = optgroupPai.tagName === 'OPTGROUP' ? optgroupPai.label : '';

        // Define o ícone com base no grupo (Chave para Serviços, Caixa para Produtos)
        let icone = 'fas fa-wrench'; // Padrão caso algo falhe
        if (tipoGrupo.toLowerCase().includes('produto')) {
            icone = 'fas fa-box'; // Ícone de produto/caixa do FontAwesome
        } else if (tipoGrupo.toLowerCase().includes('serviço')) {
            icone = 'fas fa-wrench'; // Ícone de ferramenta/serviço
        }

        // Cria o elemento na lista
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

        // Evento para remover o item da lista
        li.querySelector('.btn-remove-item').addEventListener('click', () => li.remove());
        
        listaServicos.appendChild(li);
        selectItem.value = ""; // Reseta o select
    });
}

// ==========================================
// 4. PROCESSAR DADOS, IMPRIMIR E SALVAR NO DRIVE
// ==========================================
function gerarOS(event) {
    event.preventDefault();

    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const dadosOS = {
        numero: document.getElementById('f_numero').value,
        status: document.getElementById('f_status').value,
        cliente: document.getElementById('f_cliente').value,
        documento: document.getElementById('f_documento').value || 'NÃO INFORMADO',
        telefone: document.getElementById('f_telefone').value,
        email: document.getElementById('f_email').value || 'NÃO INFORMADO',
        objeto: document.getElementById('f_objeto').value,
        modelo: document.getElementById('f_modelo').value,
        serial: document.getElementById('f_serial').value,
        defeito: document.getElementById('f_defeito').value,
        laudo: document.getElementById('f_laudo').value || 'EM ANÁLISE, INCONCLUSIVO',
        data: new Date().toLocaleDateString('pt-BR')
    };

    // Preenche a área oculta de impressão técnica
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
        const txtServico = li.innerText.trim();
        const novoLi = document.createElement('li');
        novoLi.textContent = txtServico;
        pLista.appendChild(novoLi);
    });

    const printArea = document.getElementById('print-area');

    // Configurações do html2pdf para gerar um arquivo otimizado
    const opt = {
        margin: 10,
        filename: 'documento.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, // O scrollY: 0 evita cortes se a página tiver rolagem
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Temporariamente exibe a área oculta para que o html2pdf consiga lê-la perfeitamente
    printArea.style.display = 'block';

    // 1. Executa a conversão para PDF e extrai o Blob binário
    html2pdf().set(opt).from(printArea).toPdf().output('blob').then(function (pdfBlob) {

        // Nome limpo para o arquivo no Drive
        const nomeArquivo = `OS_${dadosOS.numero}_${dadosOS.cliente}.pdf`;

        // Chamada assíncrona em segundo plano para enviar o documento para a nuvem
        enviarParaGoogleDrive(pdfBlob, nomeArquivo);

        // 2. Dispara a janela de impressão nativa IMEDIATAMENTE após a criação do blob
        window.print();

        // Oculta novamente a área técnica após terminar os procedimentos
        printArea.style.display = 'none';

        // 3. Finaliza incrementando e limpando a interface
        incrementarNumeroOS();
        limparCamposFormulario();

    })
        .catch(err => {
            console.error("Erro no fluxo do PDF:", err);
            printArea.style.display = 'none';
            alert("Ocorreu uma falha ao processar o PDF.");
        });
}

// ==========================================
// 5. SUBMISSÃO DO ARQUIVO BINÁRIO AO GOOGLE DRIVE
// ==========================================
function enviarParaGoogleDrive(blob, nomeArquivo) {

    window.open(URL.createObjectURL(blob), '_blank');

    // Sua URL do Google Apps Script (Web App)
    const urlScript = 'https://script.google.com/macros/s/AKfycbzb162xEz_prwP44uCnJlDL5ZdI4nlnlI2d6x4ieIHzwLx28mJvJN55YuI_tjVUW8jY/exec';

    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        // Extrai apenas a string base64 pura (removendo o cabeçalho data:application/pdf;base64,)
        const base64data = reader.result.split(',')[1];

        // Monta o objeto que o Apps Script espera receber
        const payload = {
            arquivoBase64: base64data,
            nome: nomeArquivo,
            mimeType: 'application/pdf'
        };

        // Faz o envio usando POST e JSON estruturado
        fetch(urlScript, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Evita requisições preflight (OPTIONS) complexas
            },
            body: JSON.stringify(payload)
        })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('Documento gravado com sucesso no Google Drive! ID do arquivo: ' + data.fileId);
                } else {
                    console.error('Falha interna no Drive:', data.message);
                }
            })
            .catch(error => console.error('Erro de rede na API da Nuvem:', error));
    };
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
    document.getElementById('os-form').reset();
    listaServicos.innerHTML = '';
    document.getElementById('f_numero').value = numeroAtual;
}

// ==========================================
// 7. CONFIGURAÇÃO INICIAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    inicializarNumeroOS();
});*/