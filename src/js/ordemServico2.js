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

// ==========================================
// 3. GERENCIAMENTO DA LISTA DE SERVIÇOS
// ==========================================
const btnAdicionar = document.getElementById('btnAdicionar');
const selectServico = document.getElementById('servico');
const listaServicos = document.getElementById('listaServicos');

if (btnAdicionar) {
    btnAdicionar.addEventListener('click', () => {
        const servicoSelecionado = selectServico.value;

        if (!servicoSelecionado) {
            alert('Por favor, selecione um serviço válido.');
            return;
        }

        const itensAtuais = Array.from(listaServicos.querySelectorAll('li')).map(li => li.dataset.value);
        if (itensAtuais.includes(servicoSelecionado)) {
            alert('Este serviço já foi adicionado.');
            return;
        }

        const li = document.createElement('li');
        li.dataset.value = servicoSelecionado;
        li.innerHTML = `
            <span><i class="fas fa-wrench" style="margin-right: 8px; color: #1a365d;"></i>
            ${servicoSelecionado}
            </span>
            <button type="button" class="btn-remove-item" style="background:none; border:none; color:#e53e3e; cursor:pointer;" title="Remover">
            <i class="fas fa-trash-alt"></i>
            </button>
        `;

        li.querySelector('.btn-remove-item').addEventListener('click', () => li.remove());
        listaServicos.appendChild(li);
        selectServico.value = "";
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
        margin:       10,
        filename:     `OS_${dadosOS.numero}_${dadosOS.cliente.replace(/\s+/g, '_')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Temporariamente exibe a área oculta para que o html2pdf consiga lê-la perfeitamente
    printArea.style.display = 'block';

    // 1. Executa a conversão para PDF e extrai o Blob binário
    html2pdf().set(opt).from(printArea).toPdf().output('blob').then(function(pdfBlob) {
        
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

    }).catch(err => {
        console.error("Erro no fluxo do PDF:", err);
        printArea.style.display = 'none';
        alert("Ocorreu uma falha ao processar o PDF.");
    });
}

// ==========================================
// 5. SUBMISSÃO DO ARQUIVO BINÁRIO AO GOOGLE DRIVE
// ==========================================
function enviarParaGoogleDrive(blob, nomeArquivo) {
    // IMPORTANTE: Insira aqui a URL gerada na implantação do seu Google Apps Script (Web App)
    // Ela deve terminar com "/exec" e NÃO com "/edit..."
    const urlScript = 'https://script.google.com/macros/s/AKfycbzxRLQyam8P2dyfQzhHZwDwVhUH0PwCb6f-5gfKScA-P_w7UToU3RCMJq_SjWFazkRl/exec';

    if (urlScript === 'https://script.google.com/macros/s/AKfycbzxRLQyam8P2dyfQzhHZwDwVhUH0PwCb6f-5gfKScA-P_w7UToU3RCMJq_SjWFazkRl/exec' || urlScript.includes('docs.google.com/spreadsheets')) {
        console.warn("Atenção: Configure a URL CORRETA do Apps Script (Web App) para que o salvamento automático funcione.");
        return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = function() {
        // Extrai apenas a string base64 pura (removendo o cabeçalho data:application/pdf;base64,)
        const base64data = reader.result.split(',')[1];

        // Monta o objeto que o Apps Script espera receber
        const payload = {
            arquivoBase64: base64data,
            nome: nomeArquivo,
            mimeType: 'application/pdf'
        };

        // Faz o envio usando POST e JSON estruturado (mais limpo para arquivos grandes)
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
});