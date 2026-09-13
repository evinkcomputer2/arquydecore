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
    cena.background = new THREE.Color(0xf5f2ed); // Fundo bege suave e acolhedor

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
    const luzAmbiente = new THREE.AmbientLight(0xfff8f0, 0.8);
    cena.add(luzAmbiente);

    const luz = new THREE.DirectionalLight(0xfff5ee, 0.7);
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
   CRIAR AMBIENTE (PISO E PAREDES TONS MARROM/BEGE/BRANCO)
===================================================== */
function criarAmbiente() {
    if (ambiente) {
        cena.remove(ambiente);
    }

    ambiente = new THREE.Group();

    /* PISO (Amadeirado claro / Bege limpo) */
    const geometriaPiso = new THREE.BoxGeometry(larguraAmbiente, 0.2, comprimentoAmbiente);
    const materialPiso = new THREE.MeshStandardMaterial({ color: 0xf5f0eb, roughness: 0.7 });
    piso = new THREE.Mesh(geometriaPiso, materialPiso);
    piso.position.y = -0.1;
    piso.receiveShadow = true;
    ambiente.add(piso);

    /* MATERIAL DAS PAREDES (Branco/Marfim elegante) */
    const materialParede = new THREE.MeshStandardMaterial({ color: 0xfaf9f6, roughness: 0.9 });

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
   CRIAR MÓVEIS REALISTAS (COMPOSTOS E DETALHADOS)
===================================================== */
function adicionarMovel(tipo) {
    let movelGrupo = new THREE.Group();
    let largura = 1, altura = 1, profundidade = 1;
    
    // Materiais refinados em tons de marrom, madeira e branco
    const materialMadeira = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.7, metalness: 0.1 });
    const materialTecidoClaro = new THREE.MeshStandardMaterial({ color: 0xfdfbf7, roughness: 0.9, metalness: 0.05 });
    const materialEstofado = new THREE.MeshStandardMaterial({ color: 0xa1887f, roughness: 0.85, metalness: 0.05 });
    const materialMetal = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.3, metalness: 0.6 });

    switch (tipo) {
        case "cama": {
            largura = 2.5; altura = 0.9; profundidade = 4;
            
            // Base da Cama (Madeira)
            const baseGeo = new THREE.BoxGeometry(2.5, 0.4, 4);
            const baseMesh = new THREE.Mesh(baseGeo, materialMadeira);
            baseMesh.position.y = 0.2;
            baseMesh.castShadow = true;
            baseMesh.receiveShadow = true;
            movelGrupo.add(baseMesh);

            // Colchão (Branco/Linho)
            const colchaoGeo = new THREE.BoxGeometry(2.4, 0.4, 3.8);
            const colchaoMesh = new THREE.Mesh(colchaoGeo, materialTecidoClaro);
            colchaoMesh.position.y = 0.6;
            colchaoMesh.castShadow = true;
            movelGrupo.add(colchaoMesh);

            // Cabeceira
            const cabecGeo = new THREE.BoxGeometry(2.5, 1.2, 0.2);
            const cabecMesh = new THREE.Mesh(cabecGeo, materialMadeira);
            cabecMesh.position.set(0, 0.6, -1.9);
            cabecMesh.castShadow = true;
            movelGrupo.add(cabecMesh);
            break;
        }

        case "sofa": {
            largura = 3; altura = 0.9; profundidade = 1.2;
            
            // Assento
            const assentoGeo = new THREE.BoxGeometry(3, 0.4, 1.1);
            const assentoMesh = new THREE.Mesh(assentoGeo, materialEstofado);
            assentoMesh.position.y = 0.3;
            assentoMesh.castShadow = true;
            movelGrupo.add(assentoMesh);

            // Encosto
            const encostoGeo = new THREE.BoxGeometry(3, 0.7, 0.3);
            const encostoMesh = new THREE.Mesh(encostoGeo, materialEstofado);
            encostoMesh.position.set(0, 0.75, -0.4);
            encostoMesh.castShadow = true;
            movelGrupo.add(encostoMesh);
            break;
        }

        case "mesa": {
            largura = 2; altura = 1; profundidade = 1;

            // Tampo da Mesa (Madeira)
            const tampoGeo = new THREE.BoxGeometry(2, 0.1, 1);
            const tampoMesh = new THREE.Mesh(tampoGeo, materialMadeira);
            tampoMesh.position.y = 0.95;
            tampoMesh.castShadow = true;
            tampoMesh.receiveShadow = true;
            movelGrupo.add(tampoMesh);

            // Pés da Mesa
            const peGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9);
            const posicoesPes = [
                [-0.9, 0.45, 0.4], [0.9, 0.45, 0.4],
                [-0.9, 0.45, -0.4], [0.9, 0.45, -0.4]
            ];
            posicoesPes.forEach(pos => {
                const peMesh = new THREE.Mesh(peGeo, materialMetal);
                peMesh.position.set(...pos);
                peMesh.castShadow = true;
                movelGrupo.add(peMesh);
            });
            break;
        }

        case "cadeira": {
            largura = 0.8; altura = 1; profundidade = 0.8;

            // Assento
            const assentoGeo = new THREE.BoxGeometry(0.7, 0.1, 0.7);
            const assentoMesh = new THREE.Mesh(assentoGeo, materialMadeira);
            assentoMesh.position.y = 0.5;
            assentoMesh.castShadow = true;
            movelGrupo.add(assentoMesh);

            // Encosto
            const encostoGeo = new THREE.BoxGeometry(0.7, 0.5, 0.1);
            const encostoMesh = new THREE.Mesh(encostoGeo, materialMadeira);
            encostoMesh.position.set(0, 0.8, -0.3);
            encostoMesh.castShadow = true;
            movelGrupo.add(encostoMesh);

            // Pés
            const peGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5);
            const posicoesPes = [
                [-0.3, 0.25, 0.3], [0.3, 0.25, 0.3],
                [-0.3, 0.25, -0.3], [0.3, 0.25, -0.3]
            ];
            posicoesPes.forEach(pos => {
                const peMesh = new THREE.Mesh(peGeo, materialMetal);
                peMesh.position.set(...pos);
                peMesh.castShadow = true;
                movelGrupo.add(peMesh);
            });
            break;
        }

        case "armario": {
            largura = 2; altura = 2.5; profundidade = 0.7;

            // Corpo do armário
            const corpoGeo = new THREE.BoxGeometry(2, 2.5, 0.7);
            const corpoMesh = new THREE.Mesh(corpoGeo, materialMadeira);
            corpoMesh.position.y = 1.25;
            corpoMesh.castShadow = true;
            corpoMesh.receiveShadow = true;
            movelGrupo.add(corpoMesh);

            // Divisão das Portas
            const portaGeo = new THREE.BoxGeometry(0.02, 2.4, 0.72);
            const portaMesh = new THREE.Mesh(portaGeo, materialMetal);
            portaMesh.position.set(0, 1.25, 0);
            movelGrupo.add(portaMesh);
            break;
        }
    }

    movelGrupo.position.set(0, 0, 0);

    movelGrupo.userData.tipo = tipo;
    movelGrupo.userData.largura = largura;
    movelGrupo.userData.altura = altura;
    movelGrupo.userData.profundidade = profundidade;

    cena.add(movelGrupo);
    moveis.push(movelGrupo);

    selecionar(movelGrupo);
}

/* =====================================================
   SELECIONAR
===================================================== */
function selecionarObjeto(event) {
    const rect = renderizador.domElement.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const objetos = raycaster.intersectObjects(moveis, true);

    if (objetos.length > 0) {
        let objPai = objetos[0].object;
        while (objPai.parent && objPai.parent !== cena) {
            objPai = objPai.parent;
        }
        selecionar(objPai);
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
}

function alterarCorMovel(hexColor) {
    if (!selecionado) {
        alert("Selecione um móvel primeiro.");
        return;
    }
    selecionado.traverse((filho) => {
        if (filho.isMesh && filho.material) {
            filho.material.color.set(hexColor);
        }
    });
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
            rotacao: movel.rotation.y
        }))
    };

    localStorage.setItem("meuProjeto3D", JSON.stringify(dados));
    alert("Projeto salvo com sucesso! 💙");
}
