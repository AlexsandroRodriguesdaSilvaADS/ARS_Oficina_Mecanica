
// ALTERAÇÃO 1: Array agora armazena Objetos (imagem + título)

const images = [
  { src: "./src/imagens/embreagem-alfa.webp", title: "Kit de Embreagem" },
  { src: "./src/imagens/amortecedores-alfa.webp", title: "Amortecedores" },
  { src: "./src/imagens/coxins-batedores-coifas-alfa.webp", title: "Coxins, Batedores e Coifas" },
  { src: "./src/imagens/bandeja-alfa.webp", title: "Bandeja de Suspensão" },
  { src: "./src/imagens/bucha-traseira-alfa.webp", title: "Buchas da Suspensão Traseira" },
  { src: "./src/imagens/discos-de-freio-alfa.webp", title: "Discos de Freio" },
  { src: "./src/imagens/pastilhas-de-freio-alfa.webp", title: "Pastilhas de Freio" },
  { src: "./src/imagens/lonas-de-freio-alfa.webp", title: "Lonas de Freio" },
  { src: "./src/imagens/cilindro-mestre-alfa.webp", title: "Cilindro Mestre" },
  { src: "./src/imagens/servo-freio-alfa.webp", title: "Servo-freio (Hidrovácuo)" },
  { src: "./src/imagens/junta-homocinetica-alfa.webp", title: "Junta Homocinética" },
  { src: "./src/imagens/deslizante-e-trizeta-alfa.webp", title: "Junta Deslizante e Trizeta" },
  { src: "./src/imagens/eixo-completo-alfa.webp", title: "Semi-eixo Completo" },
  { src: "./src/imagens/kit-radiador-alfa.webp", title: "Radiador" },
  { src: "./src/imagens/eletro-ventilador-alfa.webp", title: "Eletro ventilador" },
  { src: "./src/imagens/valvula-termostatica-alfa.webp", title: "Válvula Termostática" },
  { src: "./src/imagens/coxins-do-motor-alfa.webp", title: "Coxins do Motor" },
  { src: "./src/imagens/correia-e-rolamento-alfa.webp", title: "Correia e Rolamento Tensor" }
];

let currentIndex = 0;
let autoPlayInterval;
const mainImage = document.getElementById("active-img");
const thumbnails = document.querySelectorAll(".thumb");

// ALTERAÇÃO 2: Mapear o elemento de texto do HTML
const carouselTitle = document.getElementById("carousel-title");

function changeImage(index) {
  currentIndex = index;

  // ALTERAÇÃO 3: Agora buscamos a propriedade .src do objeto
  mainImage.src = images[currentIndex].src;

  // ALTERAÇÃO 4: Atualiza o texto do título com a propriedade .title do objeto
  carouselTitle.textContent = images[currentIndex].title;

  // Atualiza o destaque das miniaturas
  thumbnails.forEach((thumb, i) => {
    thumb.classList.toggle("active", i === currentIndex);
  });
}

// Avança para a próxima imagem
function nextImage() {
  let nextIndex = (currentIndex + 1) % images.length;
  changeImage(nextIndex);
}

// Volta para a imagem anterior
function prevImage() {
  let prevIndex = (currentIndex - 1 + images.length) % images.length;
  changeImage(prevIndex);
}

// Configura o Carrossel Automático
function startAutoPlay() {
  stopAutoPlay();
  autoPlayInterval = setInterval(nextImage, 3000);
}

function stopAutoPlay() {
  clearInterval(autoPlayInterval);
}

function resetAutoPlay() {
  stopAutoPlay();
  startAutoPlay();
}

// Eventos das miniaturas
thumbnails.forEach((thumb, index) => {
  thumb.addEventListener("click", () => {
    changeImage(index);
    resetAutoPlay();
  });
});

// Eventos de mouse para o autoplay
document.querySelector(".carousel-slide").addEventListener("mouseenter", stopAutoPlay);
document.querySelector(".carousel-slide").addEventListener("mouseleave", startAutoPlay);


// Eventos dos botões
/*document.getElementById("nextBtn").addEventListener("click", () => {
  nextImage();
  resetAutoPlay();
});

document.getElementById("prevBtn").addEventListener("click", () => {
  prevImage();
  resetAutoPlay();
});*/

// Inicia o carrossel exibindo o primeiro item corretamente
changeImage(currentIndex);
startAutoPlay();
