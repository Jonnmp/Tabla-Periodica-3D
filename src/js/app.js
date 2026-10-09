import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Variables globales UI y Datos
let elementos = [];
let indiceActual = 0;

// Variables globales Three.js
let scene, camera, renderer, modeloActual;

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

    // Objeto 3D Temporal (Icosaedro tipo cristal)
    const geometry = new THREE.IcosahedronGeometry(1.5, 0); 
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x00f0ff, 
        wireframe: true // Se verá como un holograma por ahora
    });
    modeloActual = new THREE.Mesh(geometry, material);
    scene.add(modeloActual);

    // Ajustar si la ventana cambia de tamaño
    window.addEventListener('resize', onWindowResize, false);
    
    // Iniciar bucle de animación
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    // Rotación constante del modelo
    if (modeloActual) {
        modeloActual.rotation.x += 0.005;
        modeloActual.rotation.y += 0.01;
    }
    
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
    if (modeloActual && modeloActual.material) {
        modeloActual.material.color.set(elemento.color_tema);
    }
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

function onResults(results) {
    // Ajustar el tamaño del canvas interno al del video
    canvasElement.width = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;

    canvasCtx.save();
    canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    
    // Dibujar los puntos y conexiones de la mano
    if (results.multiHandLandmarks) {
        for (const landmarks of results.multiHandLandmarks) {
            window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS,
                                 {color: '#00FF00', lineWidth: 2});
            window.drawLandmarks(canvasCtx, landmarks, {color: '#FF0000', lineWidth: 1});
            
            // FASE 5 (Adelanto): Aquí extraeremos las coordenadas X e Y
            // del centro de la mano para rotar el modelo 3D.
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