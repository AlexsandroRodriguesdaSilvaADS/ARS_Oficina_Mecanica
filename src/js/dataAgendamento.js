
//DATA AGENDAMENTO

document.addEventListener("DOMContentLoaded", function () {
    // 1. Obter a data atual no formato YYYY-MM-DD
    const hoje = new Date().toISOString().split('T')[0];

    // 2. Selecionar o campo de data pelo ID
    const campoData = document.getElementById('dataAgendamento');

    // 3. Definir o atributo 'min' do campo para a data de hoje
    campoData.setAttribute('min', hoje);
});