
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
// Captura o elemento de imagem que exibirá a capa (certifique-se de ter esse ID no seu HTML)
const albumPoster = document.getElementById('albumPoster'); 
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
    
    // Atualiza a música e o poster dinamicamente
    audioPlayer.src = track.getAttribute('data-src');
    
    // Altera a imagem do poster se o elemento existir
    if (albumPoster) {
        albumPoster.src = track.getAttribute('data-poster');
        albumPoster.alt = "Capa da música: " + track.textContent.trim();
    }
    
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
}