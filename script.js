let cena;
let camera, camera3DOriginal, camera2D;
let renderizador;
let controles;

let ambiente;
let piso;

let larguraAmbiente = 10;
let comprimentoAmbiente = 8;

let moveis = [];
let selecionado = null;

let raycaster;
let mouse;
let arrastando = false;
let modoCamera = '3d';

/* =====================================================
   INICIAR THREE.JS
===================================================== */
function iniciar3D() {
    const area = document.getElementById("area3d");

    /* CENA */
    cena = new THREE.Scene();
    cena.background = new THREE.Color(0xeaf8ff);

    /* CÂMERA 3D */
    camera3DOriginal = new THREE.PerspectiveCamera(
        50,
        area.clientWidth / area.clientHeight,
        0.1,
        1000
    );
    camera3DOriginal.position.set(12, 11, 14);
    camera = camera3DOriginal;

    /* CONFIGURAR CÂMERA 2D */
    configurarCamera2D();

    /* RENDERIZADOR */
    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(area.clientWidth, area.clientHeight);
    renderizador.shadowMap.enabled = true;
    area.appendChild(renderizador.domElement);

    /* CONTROLES */
    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true;
    controles.target.set(0, 0, 0);

    /* LUZ */
    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.7);
    cena.add(luzAmbiente);

    const luz = new THREE.DirectionalLight(0xffffff, 0.8);
    luz.position.set(5, 15, 5);
    luz.castShadow = true;
    cena.add(luz);

    /* RAYCASTER */
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    criarAmbiente();

    /* EVENTOS */
    window.addEventListener("resize", ajustarTela);
    area.addEventListener("pointerdown", selecionarObjeto);
    area.addEventListener("pointermove", moverObjeto);
    area.addEventListener("pointerup", soltarObjeto);

    // Evento de rotação com a tecla R
    window.addEventListener("keydown", (event) => {
        if (event.key.toLowerCase() === "r" && selecionado) {
            selecionado.rotation.y += Math.PI / 4; // Gira 45 graus
        }
    });

    animar();
}

/* =====================================================
   CÂMERA 2D (PLANTA BAIXA)
===================================================== */
function configurarCamera2D() {
    const area = document.getElementById("area3d");
    const aspecto = area ? area.clientWidth / area.clientHeight : 1;
    const tamanho = Math.max(larguraAmbiente, comprimentoAmbiente) * 0.7;

    camera2D = new THREE.OrthographicCamera(
        -tamanho * aspecto, tamanho * aspecto,
        tamanho, -tamanho,
        0.1, 1000
    );
    camera2D.position.set(0, 20, 0);
    camera2D.lookAt(0, 0, 0);
}

function alternarVisao() {
    const statusDiv = document.getElementById("info-status");
    if (modoCamera === '3d') {
        modoCamera = '2d';
        configurarCamera2D();
        camera = camera2D;
        controles.object = camera2D;
        if (statusDiv) statusDiv.innerHTML = "Modo: <strong>2D (Planta Baixa)</strong>";
    } else {
        modoCamera = '3d';
        camera = camera3DOriginal;
        controles.object = camera3DOriginal;
        if (statusDiv) statusDiv.innerHTML = "Modo: <strong>3D Livre</strong> | Dica: Pressione <strong>R</strong> para rotacionar";
    }
}

/* =====================================================
   CRIAR AMBIENTE
===================================================== */
function criarAmbiente() {
    if (ambiente) {
        cena.remove(ambiente);
    }

    ambiente = new THREE.Group();

    /* PISO */
    const geometriaPiso = new THREE.BoxGeometry(larguraAmbiente, 0.2, comprimentoAmbiente);
    const materialPiso = new THREE.MeshStandardMaterial({ color: 0xffffff });
    piso = new THREE.Mesh(geometriaPiso, materialPiso);
    piso.position.y = -0.1;
    piso.receiveShadow = true;
    ambiente.add(piso);

    /* MATERIAL DAS PAREDES */
    const materialParede = new THREE.MeshStandardMaterial({ color: 0xbfe8fa });

    /* PAREDE FUNDO */
    const paredeFundo = new THREE.Mesh(
        new THREE.BoxGeometry(larguraAmbiente, 3, 0.2),
        materialParede
    );
    paredeFundo.position.set(0, 1.5, -comprimentoAmbiente / 2);
    paredeFundo.castShadow = true;
    ambiente.add(paredeFundo);

    /* PAREDE ESQUERDA */
    const paredeEsquerda = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 3, comprimentoAmbiente),
        materialParede
    );
    paredeEsquerda.position.set(-larguraAmbiente / 2, 1.5, 0);
    paredeEsquerda.castShadow = true;
    ambiente.add(paredeEsquerda);

    /* PAREDE DIREITA */
    const paredeDireita = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 3, comprimentoAmbiente),
        materialParede
    );
    paredeDireita.position.set(larguraAmbiente / 2, 1.5, 0);
    paredeDireita.castShadow = true;
    ambiente.add(paredeDireita);

    cena.add(ambiente);

    if (modoCamera === '2d') {
        configurarCamera2D();
    }
}

/* =====================================================
   ATUALIZAR TAMANHO
===================================================== */
function atualizarAmbiente() {
    larguraAmbiente = Number(document.getElementById("largura").value);
    comprimentoAmbiente = Number(document.getElementById("comprimento").value);
    criarAmbiente();
}

/* =====================================================
   CRIAR MÓVEIS
===================================================== */
function adicionarMovel(tipo) {
    let largura, altura, profundidade, cor;

    switch (tipo) {
        case "cama":
            largura = 2.5; altura = 0.6; profundidade = 4; cor = 0xffffff;
            break;
        case "sofa":
            largura = 3; altura = 1.2; profundidade = 1.2; cor = 0x8ed0f5;
            break;
        case "mesa":
            largura = 2; altura = 1; profundidade = 1; cor = 0xddebf2;
            break;
        case "cadeira":
            largura = 0.8; altura = 1; profundidade = 0.8; cor = 0x75c4ee;
            break;
        case "armario":
            largura = 2; altura = 2.5; profundidade = 0.7; cor = 0xb8dff2;
            break;
    }

    const geometria = new THREE.BoxGeometry(largura, altura, profundidade);
    const material = new THREE.MeshStandardMaterial({ color: cor });
    const movel = new THREE.Mesh(geometria, material);

    movel.position.set(0, altura / 2, 0);
    movel.castShadow = true;
    movel.receiveShadow = true;

    movel.userData.tipo = tipo;
    movel.userData.largura = largura;
    movel.userData.altura = altura;
    movel.userData.profundidade = profundidade;

    cena.add(movel);
    moveis.push(movel);

    selecionar(movel);
}

/* =====================================================
   SELECIONAR
===================================================== */
function selecionarObjeto(event) {
    const rect = renderizador.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objetos = raycaster.intersectObjects(moveis);

    if (objetos.length > 0) {
        selecionar(objetos[0].object);
        arrastando = true;
        if (modoCamera === '3d') controles.enabled = false;
    }
}

function selecionar(objeto) {
    selecionado = objeto;
    const infoObjeto = document.getElementById("objetoSelecionado");
    if (infoObjeto) {
        infoObjeto.innerHTML = "Selecionado: <strong>" + traduzirNome(objeto.userData.tipo) + "</strong>";
    }
    const inputCor = document.getElementById("corMovel");
    if (inputCor) {
        inputCor.value = "#" + objeto.material.color.getHexString();
    }
}

function alterarCorMovel(hexColor) {
    if (!selecionado) return;
    selecionado.material.color.set(hexColor);
}

/* =====================================================
   MOVER OBJETO
===================================================== */
function moverObjeto(event) {
    if (!arrastando || !selecionado) return;

    const rect = renderizador.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const plano = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const ponto = new THREE.Vector3();

    raycaster.ray.intersectPlane(plano, ponto);

    if (ponto) {
        const metadeX = larguraAmbiente / 2;
        const metadeZ = comprimentoAmbiente / 2;

        selecionado.position.x = Math.max(-metadeX + 0.5, Math.min(metadeX - 0.5, ponto.x));
        selecionado.position.z = Math.max(-metadeZ + 0.5, Math.min(metadeZ - 0.5, ponto.z));
    }
}

function soltarObjeto() {
    arrastando = false;
    if (modoCamera === '3d') controles.enabled = true;
}

/* =====================================================
   REMOVER
===================================================== */
function removerSelecionado() {
    if (!selecionado) {
        alert("Selecione um móvel primeiro.");
        return;
    }

    cena.remove(selecionado);
    const indice = moveis.indexOf(selecionado);
    if (indice !== -1) moveis.splice(indice, 1);

    selecionado = null;
    const infoObjeto = document.getElementById("objetoSelecionado");
    if (infoObjeto) {
        infoObjeto.innerHTML = "Nenhum móvel selecionado.";
    }
}

/* =====================================================
   TRADUZIR NOME
===================================================== */
function traduzirNome(tipo) {
    const nomes = {
        cama: "Cama",
        sofa: "Sofá",
        mesa: "Mesa",
        cadeira: "Cadeira",
        armario: "Armário"
    };
    return nomes[tipo] || tipo;
}

/* =====================================================
   ANIMAÇÃO
===================================================== */
function animar() {
    requestAnimationFrame(animar);
    if (controles && modoCamera === '3d') controles.update();
    if (renderizador) renderizador.render(cena, camera);
}

/* =====================================================
   REDIMENSIONAR
===================================================== */
function ajustarTela() {
    const area = document.getElementById("area3d");
    if (!camera || !renderizador || !area) return;

    if (modoCamera === '3d') {
        camera.aspect = area.clientWidth / area.clientHeight;
        camera.updateProjectionMatrix();
    } else {
        configurarCamera2D();
    }

    renderizador.setSize(area.clientWidth, area.clientHeight);
}

/* =====================================================
   CRIAR PROJETO
===================================================== */
function criarProjeto(tipo) {
    const telaInicio = document.getElementById("inicio");
    const editor = document.getElementById("editor");
    const tipoProjeto = document.getElementById("tipoProjeto");

    if (telaInicio) telaInicio.style.display = "none";
    if (editor) editor.classList.remove("escondido");
    if (tipoProjeto) {
        tipoProjeto.textContent = tipo === "casa" ? "🏠 Projeto de casa" : "🛏️ Projeto de cômodo";
    }
    iniciar3D();
}

/* =====================================================
   NOVO PROJETO
===================================================== */
function novoProjeto() {
    if (!confirm("Começar um novo projeto?")) return;
    location.reload();
}

/* =====================================================
   SALVAR PROJETO
===================================================== */
function salvarProjeto() {
    const dados = {
        largura: larguraAmbiente,
        comprimento: comprimentoAmbiente,
        moveis: moveis.map(movel => ({
            tipo: movel.userData.tipo,
            x: movel.position.x,
            y: movel.position.y,
            z: movel.position.z,
            rotacao: movel.rotation.y,
            cor: movel.material.color.getHexString()
        }))
    };

    localStorage.setItem("meuProjeto3D", JSON.stringify(dados));
    alert("Projeto salvo com sucesso! 💙");
}