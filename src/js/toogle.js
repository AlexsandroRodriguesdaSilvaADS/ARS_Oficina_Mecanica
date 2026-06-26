
// MENU ESCONDIDO

function toggleMenu1() {
    document.getElementById("meuPainel").classList.toggle("ativo");
}

function toggleMenu2() {
    document.getElementById("overlay").classList.toggle("ativo");
}

function toggleMenu3() {
    document.getElementById("navbar").classList.toggle("ativo");
}


let show = true;

const menuSection = document.querySelector(".menu-section")
const menuToggle = menuSection.querySelector(".menu-toggle")

// Menu em max-width 425px //
menuToggle.addEventListener("click", () => {
/*document.body.style.overflow = show ? "hidden" : "initial"*/
    menuSection.classList.toggle("on", show)
    show = !show;
})