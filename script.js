let cena, camera, renderizador, controles;
let modoAtual = '2d';
let ferramentaAtiva = 'retangulo';
let salaMesh = null;
let grupoAvatar = null;
let gridHelper2D, gridHelper3D;

function iniciar() {
    const container = document.getElementById("area3d");

    cena = new THREE.Scene();
    cena.background = new THREE.Color(0xf4f4f4);

    camera = new THREE.OrthographicCamera(
        container.clientWidth / -2, container.clientWidth / 2,
        container.clientHeight / 2, container.clientHeight / -2,
        1, 1000
    );
    camera.position.set(0, 100, 0);
    camera.lookAt(0, 0, 0);

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(container.clientWidth, container.clientHeight);
    renderizador.shadowMap.enabled = true;
    container.appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true;
    controles.enableRotate = false;

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.8);
    cena.add(luzAmbiente);

    const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.5);
    luzDirecional.position.set(5, 10, 7);
    cena.add(luzDirecional);

    gridHelper2D = new THREE.GridHelper(50, 50, 0xdddddd, 0xeeeeee);
    gridHelper2D.position.y = -0.1;
    cena.add(gridHelper2D);

    gridHelper3D = new THREE.GridHelper(30, 30, 0xcccccc, 0xe2e2e2);
    gridHelper3D.position.y = 0;
    gridHelper3D.visible = false;
    cena.add(gridHelper3D);

    desenharSalaExemplo();
    criarAvatarCentral();

    animar();

    window.addEventListener("resize", onWindowResize);
}

function desenharSalaExemplo() {
    if (salaMesh) cena.remove(salaMesh);

    const larguraX = 11.2; 
    const profundidadeZ = 7.14;

    const geometria = new THREE.PlaneGeometry(larguraX, profundidadeZ);
    const material = new THREE.MeshStandardMaterial({ 
        color: 0xd7ccc8, 
        side: THREE.DoubleSide,
        roughness: 0.8
    });

    salaMesh = new THREE.Mesh(geometria, material);
    salaMesh.rotation.x = -Math.PI / 2;
    salaMesh.position.set(0, 0, 0);
    cena.add(salaMesh);

    const pontosBorda = [
        new THREE.Vector3(-larguraX/2, 0.05, -profundidadeZ/2),
        new THREE.Vector3(larguraX/2, 0.05, -profundidadeZ/2),
        new THREE.Vector3(larguraX/2, 0.05, profundidadeZ/2),
        new THREE.Vector3(-larguraX/2, 0.05, profundidadeZ/2),
        new THREE.Vector3(-larguraX/2, 0.05, -profundidadeZ/2)
    ];
    const geoBorda = new THREE.BufferGeometry().setFromPoints(pontosBorda);
    const matBorda = new THREE.LineBasicMaterial({ color: 0x222222 });
    const linhaBorda = new THREE.Line(geoBorda, matBorda);
    salaMesh.add(linhaBorda);

    document.getElementById("valArea").innerText = "20.00 m²";
    document.getElementById("valComp").innerText = "560 cm";
    document.getElementById("valLarg").innerText = "357 cm";
}

function criarAvatarCentral() {
    grupoAvatar = new THREE.Group();

    const matCorpo = new THREE.MeshStandardMaterial({ color: 0x9fa8da, roughness: 0.5 });
    const geoCorpo = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 16);
    const corpo = new THREE.Mesh(geoCorpo, matCorpo);
    corpo.position.y = 0.85;
    grupoAvatar.add(corpo);

    const matCabeca = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });
    const geoCabeca = new THREE.SphereGeometry(0.18, 16, 16);
    const cabeca = new THREE.Mesh(geoCabeca, matCabeca);
    cabeca.position.y = 1.35;
    grupoAvatar.add(cabeca);

    const matCalca = new THREE.MeshStandardMaterial({ color: 0x37474f, roughness: 0.6 });
    const geoCalca = new THREE.CylinderGeometry(0.22, 0.22, 0.6, 16);
    const calca = new THREE.Mesh(geoCalca, matCalca);
    calca.position.y = 0.35;
    grupoAvatar.add(calca);

    const matBase = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const geoBase = new THREE.RingGeometry(0.4, 0.5, 32);
    const base = new THREE.Mesh(geoBase, matBase);
    base.rotation.x = -Math.PI / 2;
    base.position.y = 0.01;
    grupoAvatar.add(base);

    grupoAvatar.visible = false;
    cena.add(grupoAvatar);
}

function alternarSubmenu2D() {
    const submenu = document.getElementById("submenu2D");
    submenu.classList.toggle("visivel");
}

function definirFerramenta(ferramenta) {
    ferramentaAtiva = ferramenta;
    mostrarAviso("Ferramenta ativa: " + (ferramenta === 'linha' ? "Linhas" : "Retângulo"));
    alternarSubmenu2D();
}

function limparAmbiente2D() {
    if (salaMesh) {
        cena.remove(salaMesh);
        salaMesh = null;
    }
    document.getElementById("valArea").innerText = "0.00 m²";
    document.getElementById("valComp").innerText = "0 cm";
    document.getElementById("valLarg").innerText = "0 cm";
    mostrarAviso("Planta reiniciada");
}

function novoProjeto() {
    if (confirm("Deseja iniciar um novo projeto?")) {
        limparAmbiente2D();
        desenharSalaExemplo();
        mostrarAviso("Novo projeto criado");
    }
}

function salvarProjeto() {
    mostrarAviso("Projeto salvo com sucesso");
}

function desfazerAcao() {
    mostrarAviso("Ação desfeita");
}

function refazerAcao() {
    mostrarAviso("Ação refeita");
}

function mudarModoVisualizacao(modo) {
    const container = document.getElementById("area3d");
    const btn2D = document.getElementById("modo2DBtn");
    const btn3D = document.getElementById("modo3DBtn");
    const painel = document.getElementById("painelMedidas");

    if (modo === '2d') {
        modoAtual = '2d';
        btn2D.classList.add("ativo");
        btn3D.classList.remove("ativo");
        painel.style.display = "block";
        if (grupoAvatar) grupoAvatar.visible = false;
        gridHelper2D.visible = true;
        gridHelper3D.visible = false;

        camera = new THREE.OrthographicCamera(
            container.clientWidth / -2, container.clientWidth / 2,
            container.clientHeight / 2, container.clientHeight / -2,
            1, 1000
        );
        camera.position.set(0, 100, 0);
        camera.lookAt(0, 0, 0);
        controles.object = camera;
        controles.enableRotate = false;
        controles.target.set(0, 0, 0);
    } else {
        modoAtual = '3d';
        btn3D.classList.add("ativo");
        btn2D.classList.remove("ativo");
        painel.style.display = "none";
        if (grupoAvatar) grupoAvatar.visible = true;
        gridHelper2D.visible = false;
        gridHelper3D.visible = true;

        camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(0, 6, 8);
        camera.lookAt(0, 1, 0);
        controles.object = camera;
        controles.enableRotate = true;
        controles.target.set(0, 1, 0);
    }
}

function focarAvatar() {
    if (modoAtual === '3d' && grupoAvatar) {
        controles.target.copy(grupoAvatar.position);
        controles.target.y += 1;
        mostrarAviso("Focado no avatar");
    } else {
        mostrarAviso("Ative o modo 3D primeiro");
    }
}

function ajustarZoom(fator) {
    if (modoAtual === '2d') {
        camera.zoom *= fator;
        camera.updateProjectionMatrix();
    } else {
        camera.position.multiplyScalar(fator);
    }
}

function mostrarAviso(texto) {
    const notif = document.getElementById("notificacao");
    notif.innerText = texto;
    notif.style.display = "block";
    setTimeout(() => {
        notif.style.display = "none";
    }, 2000);
}

function animar() {
    requestAnimationFrame(animar);
    controles.update();
    renderizador.render(cena, camera);
}

function onWindowResize() {
    const container = document.getElementById("area3d");
    if (modoAtual === '2d') {
        camera.left = container.clientWidth / -2;
        camera.right = container.clientWidth / 2;
        camera.top = container.clientHeight / 2;
        camera.bottom = container.clientHeight / -2;
    } else {
        camera.aspect = container.clientWidth / container.clientHeight;
    }
    camera.updateProjectionMatrix();
    renderizador.setSize(container.clientWidth, container.clientHeight);
}

window.onload = iniciar;
