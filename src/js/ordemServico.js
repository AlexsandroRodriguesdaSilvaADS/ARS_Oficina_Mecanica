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
// 4. PROCESSAR DADOS E ABRIR IMPRESSÃO NATIVA (OS + TERMO)
// ==========================================
function gerarOS(event) {
    event.preventDefault();

    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    // 1. Coleta e mapeamento de variáveis do formulário
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
        data: new Date().toLocaleDateString('pt-BR'),
        //total: 'Sob Consulta' // Como o form original está com o campo de valores comentado, deixamos um fallback elegante
    };

    // 2. Preenche a página 1 (Ordem de Serviço Clássica)
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

    // Popula a lista simples na OS
    const pLista = document.getElementById('p_lista');
    pLista.innerHTML = '';

    // String acumuladora para a tabela estruturada do Termo de Garantia
    let itensHTMLParaTermo = '';

    itensServico.forEach(li => {
        const txtServico = li.innerText.trim();

        // Elemento da pág 1
        const novoLi = document.createElement('li');
        novoLi.textContent = txtServico;
        pLista.appendChild(novoLi);

        /*// Elemento da pág 2 (Termo)
        itensHTMLParaTermo += `
            <tr>
                <td style="border: 1px solid #e2e8f0; padding: 6px 10px; font-size: 10pt;">
                ${txtServico}
                </td>
            </tr>
        `;*/
    });

    // TERMO DE GARANTIA
    /* // 3. Remove qualquer Termo gerado anteriormente para não duplicar no HTML
        const termoAntigo = document.getElementById('print-termo-garantia');
        if (termoAntigo) termoAntigo.remove();
    
        // 4. Constrói a estrutura da Página 2 injetando o template fornecido
        const containerTermo = document.createElement('div');
        containerTermo.id = 'print-termo-garantia';
    
        // Estilização inline focada na quebra de folha para impressão
        containerTermo.style.cssText = 'page-break-before: always; margin-top: 30px; font-family: Arial, sans-serif;';
    
        containerTermo.innerHTML = `
            <div class="header" style="border-bottom: 3px solid #2b6cb0; padding-bottom: 8px; margin-bottom: 18px; text-align: center;">
                <h1 style="font-size: 22pt; margin: 0; color: #2b6cb0; text-transform: uppercase; font-weight: bold;">
                Termo de Garantia</h1>
    
                <p style="font-size: 11pt; color: #4a5568; margin: 4px 0 0 0; font-weight: bold;">
                Referente à Ordem de Serviço Nº ${dadosOS.numero}</p>
            </div>
    
            <table class="grid" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                <tr>
                    <td class="bg-gray" style="width: 35%; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: #f7fafc;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">OS Documento</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">#${dadosOS.numero}</span></td>
                    <td class="bg-gray" style="width: 65%; border: 1px solid #e2e8f0; padding: 6px 10px; background-color: #f7fafc;"><span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">Data de Emissão</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.data}</span></td>
                </tr>
            </table>
    
            <div class="section-title" style="font-size: 11pt; font-weight: bold; color: #2b6cb0; background-color: #ebf8ff; padding: 5px 10px; margin: 15px 0 8px 0; border-left: 4px solid #3182ce; text-transform: uppercase;">
            Dados do Cliente</div>
            <table class="grid" style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
                <tr>
                    <td style="border: 1px solid #e2e8f0; padding: 6px 10px; width: 60%;">
                    <span class="label" style="font-size: 8pt; text-transform: uppercase; color: #718096; font-weight: bold; display: block; margin-bottom: 2px;">
                    Nome / Razão Social</span><span class="value" style="font-size: 10.5pt; color: #1a202c; font-weight: 500;">${dadosOS.cliente}</span></td>
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
    
        // 5. Injeta a estrutura montada no fim da `#print-area` do arquivo original
        document.getElementById('print-area').appendChild(containerTermo);
        */

    const printArea = document.getElementById('print-area');
    // if (containerTermo) printArea.appendChild(containerTermo); // Se usar o termo dinâmico

    // =========================================================
    // MODIFICAÇÃO: CONFIGURAÇÃO E GERAÇÃO DO PDF COMO BLOB
    // =========================================================

    // Configurações do PDF (Tamanho, margens e qualidade)
    const opt = {
        margin: 10,
        filename: `OS_${dadosOS.numero}_${dadosOS.cliente.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true }, // Escala 2 garante boa resolução
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // Gera o PDF a partir da print-area e extrai o BLOB
    html2pdf().set(opt).from(printArea).toPdf().output('blob').then(function (pdfBlob) {

        console.log("Blob do PDF gerado com sucesso!", pdfBlob);

        // Chame aqui a sua função de upload enviando o Blob gerado e os metadados
        const nomeArquivo = `OS_${dadosOS.numero}_${dadosOS.cliente}.pdf`;
        enviarParaGoogleDrive(pdfBlob, nomeArquivo);

    }).catch(err => {
        console.error("Erro ao gerar o PDF:", err);
        alert("Ocorreu um erro ao gerar o arquivo PDF.");
    });

    /*// 6. Executa a impressão nativa do sistema (Já englobando a OS e o Termo em folhas separadas)
    window.print();*/

    // 7. Incrementos pós-impressão
    incrementarNumeroOS();
    limparCamposFormulario();
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

    // Remove o termo gerado dinamicamente para restaurar o estado limpo
    /*const termoAntigo = document.getElementById('print-termo-garantia');
    if (termoAntigo) termoAntigo.remove();*/
}

// ==========================================
// 6. CONFIGURAÇÃO INICIAL
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    inicializarNumeroOS();
});



/*function enviarParaGoogleDrive(blob, nomeArquivo) {
    const urlScript = 'SUA_URL_DO_WEB_APP_DO_APPS_SCRIPT_AQUI';

    // O truque aqui é converter o Blob em Base64 para enviá-lo facilmente via JSON ou FormData
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = function () {
        const base64data = reader.result.split(',')[1]; // Remove o prefixo data:application/pdf;base64,

        // Monta os dados para enviar ao backend do Google
        const dadosEnvio = new URLSearchParams({
            arquivoBase64: base64data,
            nome: nomeArquivo,
            mimeType: 'application/pdf'
        });

        fetch(urlScript, {
            method: 'POST',
            body: dadosEnvio
        })
            .then(response => response.json())
            .then(data => {
                if (data.result === 'success') {
                    alert('Ordem de Serviço salva com sucesso no Google Drive!');
                } else {
                    alert('Erro ao salvar no Drive: ' + data.error);
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
                alert('Falha na comunicação com o servidor de armazenamento.');
            });
    };
}*/



/*// ==========================================
// 1. CONTROLADOR DO NÚMERO SEQUENCIAL (OS)
// ==========================================
function inicializarNumeroOS() {
    const fNumero = document.getElementById('f_numero');
    if (!fNumero) return; // Proteção caso o elemento sumisse

    // Se não existir nenhuma OS guardada, começa no número 2601
    if (!localStorage.getItem('proximo_numero_os')) {
        localStorage.setItem('proximo_numero_os', '2601');
    }
    
    // Recupera o número e define o input como readOnly para ninguém alterar manualmente
    fNumero.value = localStorage.getItem('proximo_numero_os');
    fNumero.readOnly = true;
}

function incrementarNumeroOS() {
    let atual = parseInt(localStorage.getItem('proximo_numero_os'), 10) || 1001;
    let proximo = atual + 1;
    localStorage.setItem('proximo_numero_os', proximo.toString());
    
    // Atualiza o campo do formulário com o novo número
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
        
        // Garante que o número está lá ao logar
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
            <span><i class="fas fa-wrench" style="margin-right: 8px; color: #1a365d;"></i>${servicoSelecionado}</span>
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
// 4. PROCESSAR DADOS E ABRIR IMPRESSÃO NATIVA
// ==========================================
function gerarOS(event) {
    event.preventDefault();

    const itensServico = listaServicos.querySelectorAll('li');
    if (itensServico.length === 0) {
        alert('Adicione pelo menos um serviço antes de gerar a Ordem de Serviço.');
        return;
    }

    const campos = [
        ['f_numero', 'p_numero'],
        ['f_status', 'p_status'],
        ['f_cliente', 'p_cliente'],
        ['f_documento', 'p_documento'],
        ['f_telefone', 'p_telefone'],
        ['f_email', 'p_email'],
        ['f_objeto', 'p_objeto'],
        ['f_modelo', 'p_modelo'],
        ['f_serial', 'p_serial'],
        ['f_defeito', 'p_defeito'],
        ['f_laudo', 'p_laudo']
    ];

    campos.forEach(([idForm, idPrint]) => {
        const input = document.getElementById(idForm);
        const printElem = document.getElementById(idPrint);
        if (input && printElem) {
            printElem.textContent = input.value || 'Não informado';
        }
    });

    const dataAtual = new Date().toLocaleDateString('pt-BR');
    document.getElementById('p_data').textContent = dataAtual;

    const pLista = document.getElementById('p_lista');
    pLista.innerHTML = '';
    itensServico.forEach(li => {
        const novoLi = document.createElement('li');
        novoLi.textContent = li.innerText.trim();
        pLista.appendChild(novoLi);
    });

    // Abre a janela de impressão
    window.print();

    // Incrementa após mandar imprimir
    incrementarNumeroOS();
    limparCamposFormulario();
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
    
    // Devolve o número atual correto para o campo
    document.getElementById('f_numero').value = numeroAtual;
}

// ==========================================
// 6. CONFIGURAÇÃO INICIAL (AO CARREGAR A PÁGINA)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Esconde o conteúdo principal e mostra o login
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('main-content').style.display = 'none';
    
    // Força a inicialização do número logo de cara na memória
    inicializarNumeroOS();
});*/