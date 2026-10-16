# Tabla Periódica 3D Interactiva con Control Gestual

Una aplicación web inmersiva que permite explorar los 118 elementos de la tabla periódica. Utiliza renderizado procedural para generar modelos atómicos tridimensionales (estilo Bohr) en tiempo real y visión por computadora para permitir a los usuarios manipular los átomos en el aire utilizando únicamente sus manos.

## Características Principales

* **Generación Procedural 3D:** Los átomos no son archivos descargados; se construyen matemáticamente en el navegador usando Three.js. El algoritmo calcula el número de protones/neutrones y distribuye los electrones en múltiples capas orbitales animadas según el número atómico del elemento.
* **Control Gestual Integrado (MediaPipe):**
* **Rotación Holográfica:** Mueve la palma de tu mano en el centro de la pantalla para rotar el átomo en cualquier dirección.
* **Zoom Dinámico (Pinch):** Junta o separa el dedo índice y el pulgar para acercar o alejar el modelo.
* **Navegación Swipe:** Desliza la mano hacia los bordes izquierdo o derecho de la cámara para cambiar instantáneamente al elemento anterior o siguiente.


* **Arquitectura de Datos Automatizada:** Incluye un script en Python (`generar_db.py`) que extrae datos científicos estructurados, los traduce al español, asigna colores representativos por familia química y compila un archivo JSON optimizado para la interfaz.
* **Diseño Asimétrico y Resiliente:** Interfaz de usuario estilo *glassmorphism* con un panel de datos científicos completos (Familia, Grupo, Periodo, Masa, Configuración Electrónica). Incluye manejo inteligente de errores: si no hay una cámara web disponible, la aplicación desactiva la visión computacional y permite la navegación tradicional mediante botones sin interrumpir la experiencia.

## Stack Tecnológico

* **Frontend:** HTML5, CSS3, JavaScript (ES6)
* **Motor Gráfico:** Three.js (WebGL)
* **Visión por Computadora:** MediaPipe Hands (Google)
* **Automatización de Datos:** Python (urllib, json)
* **Despliegue / Entorno:** Docker, Nginx, GitHub Pages

## Estructura del Proyecto

```text
/
├── data/
│   └── elementos.json       # Base de datos generada (118 elementos)
├── src/
│   ├── css/
│   │   └── style.css        # Estilos y variables de la UI
│   └── js/
│       └── app.js           # Lógica principal, Three.js y MediaPipe
├── generar_db.py            # Script automatizado de recolección de datos
├── index.html               # Estructura principal y UI
├── docker-compose.yml       # Configuración para contenedor local Nginx
└── README.md

```

## Instalación y Uso Local

Existen múltiples formas de ejecutar este proyecto localmente. Dado que utiliza módulos ES6 (`import * as THREE`), **debe** ejecutarse a través de un servidor HTTP, no abriendo el archivo localmente (`file://`).

### Opción 1: Usando Docker (Recomendado)

Asegúrate de tener Docker y Docker Compose instalados en tu sistema.

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd tu-repositorio

```


2. Levanta el contenedor:
```bash
docker compose up -d

```


3. Abre tu navegador y visita: `http://localhost:8080`

### Opción 2: Usando Live Server (VS Code)

1. Abre la carpeta del proyecto en Visual Studio Code.
2. Instala la extensión **Live Server**.
3. Haz clic derecho sobre `index.html` y selecciona **"Open with Live Server"**.

## Generación de la Base de Datos

Si deseas actualizar la base de datos de los elementos o modificar las reglas de traducción y colores por familia química, puedes ejecutar el script generador. Requiere Python 3.x (no necesita dependencias externas).

```bash
python generar_db.py

```

*Este comando descargará la última información de la API pública, aplicará el formato al español y sobrescribirá el archivo `data/elementos.json`.*

## Créditos y Desarrollo

Desarrollado como proyecto de ingeniería de software e integración de tecnologías de gráficos web y visión computacional por **Jonathan Eric Moo Pech**.