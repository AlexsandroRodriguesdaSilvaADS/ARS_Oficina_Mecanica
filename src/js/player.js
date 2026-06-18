
//CONTROLE DAS MÚSICAS
/*
const audioPlayer = document.getElementById('audioPlayer');
const playlist = document.getElementById('playlist');
const tracks = playlist.getElementsByTagName('li');
let currentTrack = 0;

// Função para carregar e tocar a música
function loadTrack(index) {
    // Remove a classe 'active' de todas
    for (let i = 0; i < tracks.length; i++) {
        tracks[i].classList.remove('active');
    }

    // Define a nova música e destaca na lista
    const track = tracks[index];
    track.classList.add('active');
    audioPlayer.src = track.getAttribute('data-src');
    audioPlayer.load();
}
// Inicializa a primeira música
loadTrack(currentTrack);

// Modificação no evento 'ended' para criar o Auto-loop
audioPlayer.addEventListener('ended', () => {
    // Incrementa o índice e volta para 0 se for a última música
    currentTrack = (currentTrack + 1) % tracks.length;
    loadTrack(currentTrack);
    audioPlayer.play();
    console.log("Iniciando próxima faixa: " + currentTrack);
});

// Permitir clicar na música para trocar manualmente
for (let i = 0; i < tracks.length; i++) {
    tracks[i].addEventListener('click', function () {
        currentTrack = i;
        loadTrack(currentTrack);
        audioPlayer.play();
    });
}*/


const audioPlayer = document.getElementById('audioPlayer');
const playlist = document.getElementById('playlist');
const tracks = playlist.getElementsByTagName('li');
let currentTrack = 0;

// Função para carregar e tocar a música de forma segura
function loadAndPlayTrack(index) {
    // Atualiza o índice global
    currentTrack = index;

    // Atualiza a interface (classe 'active')
    Array.from(tracks).forEach((track, i) => {
        track.classList.toggle('active', i === index);
    });

    // Define a nova origem
    const track = tracks[index];
    audioPlayer.src = track.getAttribute('data-src');

    // Define o poster da música
    const posterSrc = track.getAttribute('data-poster');
    audioPlayer.poster = posterSrc || ''; // Usa string vazia se data-poster não existir

    // Toca a música e lida com a Promise do navegador
    audioPlayer.play().catch(error => {
        console.warn("A reprodução automática foi bloqueada ou interrompida:", error);
    });
}

// Inicializa a primeira música (sem dar play automático para evitar bloqueio do navegador)
if (tracks.length > 0) {
    // Apenas remove de todos e adiciona no primeiro para o estado inicial visual
    Array.from(tracks).forEach((track, i) => track.classList.toggle('active', i === 0));
    audioPlayer.src = tracks[0].getAttribute('data-src');
    audioPlayer.poster = tracks[0].getAttribute('data-poster') || '';
}

// Evento 'ended' para a próxima música (Auto-loop)
audioPlayer.addEventListener('ended', () => {
    const nextTrack = (currentTrack + 1) % tracks.length;
    console.log("Iniciando próxima faixa: " + nextTrack);
    loadAndPlayTrack(nextTrack);
});

// Permitir clicar na música para trocar manualmente usando Event Delegation (Mais performático)
playlist.addEventListener('click', function (e) {
    // Encontra o elemento 'li' clicado (ou o pai se houver tags dentro do li)
    const clickedTrack = e.target.closest('li');

    if (clickedTrack && playlist.contains(clickedTrack)) {
        const index = Array.from(tracks).indexOf(clickedTrack);
        if (index !== -1) {
            loadAndPlayTrack(index);
        }
    }
});