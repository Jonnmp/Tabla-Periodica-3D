import * as THREE from 'three';

// Variables globales UI y Datos
let elementos = [];
let indiceActual = 0;

// Variables globales Three.js// Variables globales Three.js
let scene, camera, renderer, modeloActual, grupoModelo;
let escalaBase = 1.5; // Tamaño inicial del objeto
let electronesAnimados = [];

// Referencias al DOM (Panel de Datos)
const uiNumAtomico = document.getElementById('ui-numero-atomico');
const uiSimbolo = document.getElementById('ui-simbolo');
const uiNombre = document.getElementById('ui-nombre');
const uiMasa = document.getElementById('ui-masa');
const uiEstado = document.getElementById('ui-estado');
const uiConfig = document.getElementById('ui-config');
const uiElectro = document.getElementById('ui-electro');
const uiDescripcion = document.getElementById('ui-descripcion');

// Botones
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

async function inicializarApp() {
    // 1. Iniciar Entorno 3D
    init3D();
    initMediaPipe();  // Inicializar MediaPipe para la detección de manos

    // 2. Cargar Datos
    try {
        const respuesta = await fetch('./data/elementos.json');
        elementos = await respuesta.json();
        
        if(elementos.length > 0) {
            actualizarUI(elementos[indiceActual]);
        }
    } catch (error) {
        console.error("Error cargando la base de datos:", error);
    }
}

function init3D() {
    const container = document.getElementById('canvas-container');
    
    // Escena y Cámara
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    // Motor de Renderizado (con alpha true para respetar tu fondo CSS)
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); 
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Iluminación (Clave para que se vea realista)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Reemplaza el IcosahedronGeometry por esto dentro de init3D():
    grupoModelo = new THREE.Group();
    scene.add(grupoModelo);

    // Ajustar si la ventana cambia de tamaño
    window.addEventListener('resize', onWindowResize, false);
    
    // Iniciar bucle de animación
    animate();
}


function crearElementoProcedural(elemento) {
    // 1. Limpiar el modelo anterior y el arreglo de animaciones
    while(grupoModelo.children.length > 0){ 
        grupoModelo.remove(grupoModelo.children[0]); 
    }
    electronesAnimados = []; 

    // CORRECCIÓN: Instanciamos el contenedor del átomo para que MediaPipe pueda controlarlo
    modeloActual = new THREE.Group(); 

    let colorBase = new THREE.Color(elemento.color_tema);
    const Z = elemento.numero_atomico;

    // 2. CREAR EL NÚCLEO
    const nucleoGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const nucleoMat = new THREE.MeshPhysicalMaterial({
        color: colorBase,
        emissive: colorBase,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8,
        clearcoat: 1.0
    });
    const nucleo = new THREE.Mesh(nucleoGeo, nucleoMat);
    
    const maxParticulas = Math.min(Z, 30);
    const partGeo = new THREE.SphereGeometry(0.12, 16, 16);
    for(let i=0; i<maxParticulas; i++) {
        const partMat = new THREE.MeshStandardMaterial({
            color: Math.random() > 0.5 ? 0xff2222 : 0x2222ff, 
            roughness: 0.6
        });
        const particula = new THREE.Mesh(partGeo, partMat);
        particula.position.set(
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5,
            (Math.random() - 0.5) * 0.5
        );
        nucleo.add(particula);
    }
    // CORRECCIÓN: Lo añadimos a modeloActual en lugar de grupoModelo
    modeloActual.add(nucleo);

    // 3. CALCULAR LAS CAPAS ELECTRÓNICAS
    let electronesRestantes = Z;
    const capacidadesOrbitales = [2, 8, 18, 32, 32, 18, 8];
    let distribucion = [];

    for (let cap of capacidadesOrbitales) {
        if (electronesRestantes > 0) {
            let eEnCapa = Math.min(electronesRestantes, cap);
            distribucion.push(eEnCapa);
            electronesRestantes -= eEnCapa;
        } else {
            break;
        }
    }

    // 4. CREAR LAS ÓRBITAS Y LOS ELECTRONES
    const electronGeo = new THREE.SphereGeometry(0.06, 16, 16);
    const electronMat = new THREE.MeshBasicMaterial({ color: 0xffffff }); 

    distribucion.forEach((numE, indexCapa) => {
        const radioOrbita = 0.8 + (indexCapa * 0.4); 

        const anilloGeo = new THREE.TorusGeometry(radioOrbita, 0.005, 8, 64);
        const anilloMat = new THREE.MeshBasicMaterial({
            color: colorBase,
            transparent: true,
            opacity: 0.4
        });
        const anillo = new THREE.Mesh(anilloGeo, anilloMat);

        anillo.rotation.x = Math.random() * Math.PI;
        anillo.rotation.y = Math.random() * Math.PI;
        
        // CORRECCIÓN: Lo añadimos a modeloActual
        modeloActual.add(anillo);

        for(let i=0; i<numE; i++) {
            const angulo = (i / numE) * Math.PI * 2;
            const pivote = new THREE.Group();
            
            const electron = new THREE.Mesh(electronGeo, electronMat);
            electron.position.set(Math.cos(angulo) * radioOrbita, Math.sin(angulo) * radioOrbita, 0);
            
            pivote.add(electron);
            pivote.rotation.copy(anillo.rotation);
            
            // CORRECCIÓN: Lo añadimos a modeloActual
            modeloActual.add(pivote);

            electronesAnimados.push({
                pivote: pivote,
                velocidad: (0.01 + Math.random() * 0.01) * (indexCapa % 2 === 0 ? 1 : -1)
            });
        }
    });

    // CORRECCIÓN FINAL: Escalamos e insertamos todo el ensamble en el grupo principal
    modeloActual.scale.set(escalaBase * 0.7, escalaBase * 0.7, escalaBase * 0.7);
    grupoModelo.add(modeloActual);
}


function animate() {
    requestAnimationFrame(animate);

    electronesAnimados.forEach(obj => {
        obj.pivote.rotation.z += obj.velocidad;
    });
    
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('canvas-container');
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function actualizarUI(elemento) {
    uiNumAtomico.textContent = elemento.numero_atomico;
    uiSimbolo.textContent = elemento.simbolo;
    uiNombre.textContent = elemento.nombre;
    uiMasa.textContent = elemento.masa_atomica;
    uiEstado.textContent = elemento.estado_natural;
    uiConfig.textContent = elemento.configuracion_electronica;
    uiElectro.textContent = elemento.electronegatividad;
    uiDescripcion.textContent = elemento.descripcion;

    // Actualizar color de la tarjeta
    document.documentElement.style.setProperty('--color-acento', elemento.color_tema);

    // Vincular el color de la UI con el color del modelo 3D temporal
    crearElementoProcedural(elemento);
}

// Listeners
btnNext.addEventListener('click', () => {
    indiceActual = (indiceActual + 1) % elementos.length;
    actualizarUI(elementos[indiceActual]);
});

btnPrev.addEventListener('click', () => {
    indiceActual = (indiceActual - 1 + elementos.length) % elementos.length;
    actualizarUI(elementos[indiceActual]);
});

// --- FASE 4: MEDIAPIPE Y CÁMARA ---
const videoElement = document.getElementById('video-camara');
const canvasElement = document.getElementById('canvas-mediapipe');
const canvasCtx = canvasElement.getContext('2d');

// --- Lógica de Interacción 3D con la Mano (Fase 5) ---
let tiempoUltimoGesto = 0; // Control de tiempo para no cambiar 100 veces por segundo

function onResults(results) {
    // Ajustar el tamaño del canvas interno al del video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Dibujar los puntos y conexiones de la mano
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0]; // Tomamos solo la primera mano

        window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS,
                             {color: '#00FF00', lineWidth: 2});
        window.drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
        
        // 1. ROTACIÓN: Usamos el punto 9 (el nudillo de en medio)
        // Mapeamos el movimiento horizontal (X) y vertical (Y)
        const puntoPalma = landmarks[9];
        if (modeloActual) {
            // Restamos 0.5 para centrar la rotación en 0 y suavizamos
            // Invertimos el eje X para que actúe en modo espejo natural
            const targetRotY = -(puntoPalma.x - 0.5) * Math.PI * 2;
            const targetRotX = (puntoPalma.y - 0.5) * Math.PI * 2;
            
            // Interpolación lineal (LERP) para que el movimiento sea suave
            modeloActual.rotation.y += (targetRotY - modeloActual.rotation.y) * 0.1;
            modeloActual.rotation.x += (targetRotX - modeloActual.rotation.x) * 0.1;

            // 3. CAMBIO DE ELEMENTO (SWIPE): Detectar si la mano se va a los bordes
            const tiempoActual = Date.now();
            if (tiempoActual - tiempoUltimoGesto > 1200) { // Cooldown de 1.2 segundos
            if (puntoPalma.x > 0.85) { 
                // Mano hacia el borde derecho (Recuerda que la cámara está en modo espejo)
                console.log("Gesto: Siguiente");
                btnNext.click(); // Simulamos el clic en tu botón HTML
                tiempoUltimoGesto = tiempoActual;
            } else if (puntoPalma.x < 0.15) {
                // Mano hacia el borde izquierdo
                console.log("Gesto: Anterior");
                btnPrev.click();
                tiempoUltimoGesto = tiempoActual;
            }
        }
        }

        // 2. ESCALADO (ZOOM / PELLIZCO): Medimos distancia entre pulgar (4) e índice (8)
        const pulgar = landmarks[4];
        const indice = landmarks[8];

        // Distancia euclidiana en 3D
        const dx = pulgar.x - indice.x;
        const dy = pulgar.y - indice.y;
        const dz = pulgar.z - indice.z;
        const distancia = Math.sqrt(dx*dx + dy*dy + dz*dz);

        // Mapeamos la distancia para que el factor de escala sea natural (ej. entre 0.5 y 2.5)
        // Si juntas los dedos (distancia pequeña) se encoge; si los abres, crece
        let escalaTarget = distancia * 8; 
        escalaTarget = Math.max(0.4, Math.min(escalaTarget, 2.8)); // Ponemos límites

        if (modeloActual) {
            // Transición suave al nuevo tamaño
            const escalaActual = modeloActual.scale.x;
            const nuevaEscala = escalaActual + (escalaTarget - escalaActual) * 0.15;
            modeloActual.scale.set(nuevaEscala, nuevaEscala, nuevaEscala);
        }

    } else {
        // Si no hay manos en pantalla, regresa suavemente a su estado natural de rotación
        if (modeloActual) {
            modeloActual.rotation.y += 0.005;
            modeloActual.rotation.x += 0.005;
            
            // Regresar a la escala base suavemente
            const escalaActual = modeloActual.scale.x;
            const nuevaEscala = escalaActual + (escalaBase - escalaActual) * 0.05;
            modeloActual.scale.set(nuevaEscala, nuevaEscala, nuevaEscala);
        }
    }
    
    canvasCtx.restore();
}

function initMediaPipe() {
    const hands = new window.Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });

    hands.setOptions({
        maxNumHands: 1, // Solo rastreamos una mano para manipular el elemento
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults(onResults);

    const cameraUtils = new window.Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 640,
        height: 480
    });
    cameraUtils.start();
}

inicializarApp();