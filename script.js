/* =====================================================
   ARQUYDECORE
   Editor 2D + Visualização 3D
===================================================== */

let comprimento = 10;
let largura = 20;
let altura = 5;

let modo = "2D";

let canvas;
let ctx;

let desenhando = false;

let inicioX = 0;
let inicioY = 0;

let fimX = 0;
let fimY = 0;


/* =====================================================
   ABRIR PROJETO
===================================================== */

function abrirProjeto() {
    window.location.href = "projeto.html";
}


/* =====================================================
   CRIAR EDITOR
===================================================== */

function iniciarEditor() {

    canvas = document.getElementById("plantaCanvas");

    if (!canvas) return;

    ctx = canvas.getContext("2d");

    ajustarCanvas();

    desenharGrade();

    atualizarMedidas();

    window.addEventListener("resize", () => {
        ajustarCanvas();
        desenharGrade();
    });

    canvas.addEventListener("mousedown", iniciarDesenho);
    canvas.addEventListener("mousemove", moverDesenho);
    canvas.addEventListener("mouseup", finalizarDesenho);

    canvas.addEventListener("touchstart", toqueInicio, { passive: false });
    canvas.addEventListener("touchmove", toqueMover, { passive: false });
    canvas.addEventListener("touchend", toqueFim);
}


/* =====================================================
   CANVAS
===================================================== */

function ajustarCanvas() {

    const area = canvas.parentElement;

    canvas.width = area.clientWidth;
    canvas.height = Math.max(500, area.clientHeight);
}


/* =====================================================
   GRADE
===================================================== */

function desenharGrade() {

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tamanho = 25;

    ctx.strokeStyle = "#e4e4e4";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += tamanho) {

        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += tamanho) {

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}


/* =====================================================
   DESENHO COM MOUSE
===================================================== */

function iniciarDesenho(event) {

    if (modo !== "2D") return;

    const rect = canvas.getBoundingClientRect();

    inicioX = event.clientX - rect.left;
    inicioY = event.clientY - rect.top;

    desenhando = true;
}


function moverDesenho(event) {

    if (!desenhando) return;

    const rect = canvas.getBoundingClientRect();

    fimX = event.clientX - rect.left;
    fimY = event.clientY - rect.top;

    desenharRetangulo();
}


function finalizarDesenho(event) {

    if (!desenhando) return;

    desenhando = false;

    const rect = canvas.getBoundingClientRect();

    fimX = event.clientX - rect.left;
    fimY = event.clientY - rect.top;

    desenharRetangulo();

    calcularMedidas();
}


/* =====================================================
   DESENHO TOUCH
===================================================== */

function toqueInicio(event) {

    event.preventDefault();

    const toque = event.touches[0];

    const rect = canvas.getBoundingClientRect();

    inicioX = toque.clientX - rect.left;
    inicioY = toque.clientY - rect.top;

    desenhando = true;
}


function toqueMover(event) {

    event.preventDefault();

    if (!desenhando) return;

    const toque = event.touches[0];

    const rect = canvas.getBoundingClientRect();

    fimX = toque.clientX - rect.left;
    fimY = toque.clientY - rect.top;

    desenharRetangulo();
}


function toqueFim() {

    if (!desenhando) return;

    desenhando = false;

    desenharRetangulo();

    calcularMedidas();
}


/* =====================================================
   DESENHAR RETÂNGULO
===================================================== */

function desenharRetangulo() {

    desenharGrade();

    const x = Math.min(inicioX, fimX);
    const y = Math.min(inicioY, fimY);

    const w = Math.abs(fimX - inicioX);
    const h = Math.abs(fimY - inicioY);

    ctx.fillStyle = "rgba(96,120,95,0.18)";
    ctx.fillRect(x, y, w, h);

    ctx.strokeStyle = "#394f39";
    ctx.lineWidth = 4;

    ctx.strokeRect(x, y, w, h);

    /* Linha de comprimento */

    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(x, y - 15);
    ctx.lineTo(x + w, y - 15);

    ctx.stroke();

    /* Linha de largura */

    ctx.beginPath();

    ctx.moveTo(x - 15, y);
    ctx.lineTo(x - 15, y + h);

    ctx.stroke();

    /* Texto */

    ctx.fillStyle = "#222";
    ctx.font = "bold 14px Arial";

    ctx.fillText(
        comprimento.toFixed(1) + " m",
        x + w / 2 - 20,
        y - 22
    );

    ctx.save();

    ctx.translate(x - 22, y + h / 2);
    ctx.rotate(-Math.PI / 2);

    ctx.fillText(
        largura.toFixed(1) + " m",
        0,
        0
    );

    ctx.restore();
}


/* =====================================================
   CALCULAR MEDIDAS
===================================================== */

function calcularMedidas() {

    const larguraPixel = Math.abs(fimX - inicioX);
    const alturaPixel = Math.abs(fimY - inicioY);

    if (larguraPixel < 10 || alturaPixel < 10) {
        return;
    }

    /*
       Cada 25 pixels representam aproximadamente
       1 metro.
    */

    comprimento = larguraPixel / 25;
    largura = alturaPixel / 25;

    document.getElementById("comprimento").value =
        comprimento.toFixed(2);

    document.getElementById("largura").value =
        largura.toFixed(2);

    atualizarMedidas();
}


/* =====================================================
   ATUALIZAR INFORMAÇÕES
===================================================== */

function atualizarMedidas() {

    const area = comprimento * largura;

    const campoArea = document.getElementById("area");

    if (campoArea) {
        campoArea.textContent = area.toFixed(2) + " m²";
    }

    const campoResumo =
        document.getElementById("resumoMedidas");

    if (campoResumo) {

        campoResumo.innerHTML = `
            <strong>${area.toFixed(2)} m²</strong>
            <span>
                ${comprimento.toFixed(2)} m ×
                ${largura.toFixed(2)} m
            </span>
        `;
    }
}


/* =====================================================
   ALTERAR MEDIDAS MANUALMENTE
===================================================== */

function alterarMedidas() {

    const c =
        parseFloat(document.getElementById("comprimento").value);

    const l =
        parseFloat(document.getElementById("largura").value);

    const a =
        parseFloat(document.getElementById("altura").value);

    if (!isNaN(c)) comprimento = c;

    if (!isNaN(l)) largura = l;

    if (!isNaN(a)) altura = a;

    atualizarMedidas();

    if (fimX !== inicioX) {

        desenharGrade();

        const escala = 25;

        fimX = inicioX + comprimento * escala;
        fimY = inicioY + largura * escala;

        desenharRetangulo();
    }
}


/* =====================================================
   MODO 2D
===================================================== */

function ativar2D() {

    modo = "2D";

    document.getElementById("editor2D").style.display = "block";
    document.getElementById("editor3D").style.display = "none";

    document.getElementById("btn2D").classList.add("active");
    document.getElementById("btn3D").classList.remove("active");
}


/* =====================================================
   MODO 3D
===================================================== */

function ativar3D() {

    modo = "3D";

    document.getElementById("editor2D").style.display = "none";
    document.getElementById("editor3D").style.display = "flex";

    document.getElementById("btn3D").classList.add("active");
    document.getElementById("btn2D").classList.remove("active");

    criarCasa3D();
}


/* =====================================================
   CASA 3D
===================================================== */

function criarCasa3D() {

    const casa =
        document.getElementById("casa3D");

    if (!casa) return;

    casa.innerHTML = "";

    const escala = 20;

    const larguraCasa =
        Math.min(comprimento * escala, 350);

    const profundidade =
        Math.min(largura * escala, 350);

    const alturaCasa =
        Math.min(altura * escala, 220);

    /* PISO */

    const piso = document.createElement("div");

    piso.className = "piso3D";

    piso.style.width =
        larguraCasa + "px";

    piso.style.height =
        profundidade + "px";

    casa.appendChild(piso);


    /* PAREDE TRASEIRA */

    const paredeFundo =
        document.createElement("div");

    paredeFundo.className = "parede parede-fundo";

    paredeFundo.style.width =
        larguraCasa + "px";

    paredeFundo.style.height =
        alturaCasa + "px";

    casa.appendChild(paredeFundo);


    /* PAREDE ESQUERDA */

    const paredeEsquerda =
        document.createElement("div");

    paredeEsquerda.className =
        "parede parede-esquerda";

    paredeEsquerda.style.width =
        profundidade + "px";

    paredeEsquerda.style.height =
        alturaCasa + "px";

    casa.appendChild(paredeEsquerda);


    /* INFORMAÇÕES */

    const info =
        document.createElement("div");

    info.className = "info3D";

    info.innerHTML = `
        <strong>Ambiente 3D</strong>
        <span>
            ${comprimento.toFixed(2)}m ×
            ${largura.toFixed(2)}m ×
            ${altura.toFixed(2)}m
        </span>
        <span>
            Área: ${(comprimento * largura).toFixed(2)} m²
        </span>
    `;

    casa.appendChild(info);
}


/* =====================================================
   LIMPAR PROJETO
===================================================== */

function limparProjeto() {

    comprimento = 10;
    largura = 20;
    altura = 5;

    inicioX = 0;
    inicioY = 0;
    fimX = 0;
    fimY = 0;

    desenharGrade();

    document.getElementById("comprimento").value = 10;
    document.getElementById("largura").value = 20;
    document.getElementById("altura").value = 5;

    atualizarMedidas();
}


/* =====================================================
   LOGIN
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    iniciarEditor();

    const login =
        document.querySelector(".login-btn");

    if (login) {

        login.addEventListener("click", () => {

            alert(
                "Área de login do ArquyDecore.\n\n" +
                "O sistema de contas pode ser conectado " +
                "posteriormente a um banco de dados."
            );

        });
    }

});
