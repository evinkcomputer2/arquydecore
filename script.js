let cena, camera, renderizador, controles;
let modo3D = false;
let salaMesh;

function iniciar() {
    const container = document.getElementById("area3d");

    cena = new THREE.Scene();
    cena.background = new THREE.Color(0xf2f2f2);

    camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 15, 0.01);

    renderizador = new THREE.WebGLRenderer({ antialias: true });
    renderizador.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderizador.domElement);

    controles = new THREE.OrbitControls(camera, renderizador.domElement);
    controles.enableDamping = true;

    const luzAmbiente = new THREE.AmbientLight(0xffffff, 0.7);
    cena.add(luzAmbiente);

    const luzDirecional = new THREE.DirectionalLight(0xffffff, 0.5);
    luzDirecional.position.set(10, 20, 10);
    cena.add(luzDirecional);

    atualizarAmbiente();
    animar();

    window.addEventListener('resize', onWindowResize);
}

function atualizarAmbiente() {
    if (salaMesh) cena.remove(salaMesh);

    const largura = parseFloat(document.getElementById('inputLargura').value) || 10;
    const comprimento = parseFloat(document.getElementById('inputComprimento').value) || 8;

    const geo = new THREE.PlaneGeometry(largura, comprimento);
    const mat = new THREE.MeshStandardMaterial({ color: 0xe0e0e0, side: THREE.DoubleSide });
    salaMesh = new THREE.Mesh(geo, mat);
    salaMesh.rotation.x = -Math.PI / 2;
    cena.add(salaMesh);
}

function adicionarMovel(tipo) {
    const corHex = document.getElementById('corMovel').value;
    const mat = new THREE.MeshStandardMaterial({ color: corHex });
    let geo, movel;

    if (tipo === 'cama') geo = new THREE.BoxGeometry(2, 0.6, 2.5);
    else if (tipo === 'sofa') geo = new THREE.BoxGeometry(2.5, 0.8, 1);
    else if (tipo === 'mesa') geo = new THREE.BoxGeometry(2, 0.9, 1);
    else if (tipo === 'cadeira') geo = new THREE.BoxGeometry(0.6, 0.9, 0.6);
    else geo = new THREE.BoxGeometry(1.2, 2, 0.6);

    movel = new THREE.Mesh(geo, mat);
    movel.position.set((Math.random() - 0.5) * 4, 0.5, (Math.random() - 0.5) * 4);
    cena.add(movel);
}

function alternarVisao() {
    modo3D = !modo3D;
    const textoModo = document.getElementById('modoTexto');
    if (modo3D) {
        camera.position.set(0, 8, 10);
        textoModo.innerText = "Modo: 3D (Perspectiva)";
    } else {
        camera.position.set(0, 15, 0.01);
        textoModo.innerText = "Modo: 2D (Planta Baixa)";
    }
}

function animar() {
    requestAnimationFrame(animar);
    controles.update();
    renderizador.render(cena, camera);
}

function onWindowResize() {
    const container = document.getElementById("area3d");
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderizador.setSize(container.clientWidth, container.clientHeight);
}

window.onload = iniciar;
