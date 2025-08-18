# 🚗 Proyecto 3D con Three.js + Rapier  

Este proyecto es una **demo interactiva en 3D** desarrollada con [Three.js](https://threejs.org/) y [Rapier](https://rapier.rs/), que incluye:  

- Un **coche en 3D** controlable con teclado.  
- **Cámara en tercera persona** tipo *follow cam* (sigue al coche con suavidad).  
- **Simulación física** con Rapier (colisiones, gravedad, movimiento).  
- **Entorno HDRI** para iluminación realista.  
- **Interfaz de depuración** con [lil-gui](https://lil-gui.georgealways.com/) para modificar parámetros de física.  
- **Estadísticas de rendimiento** con *stats.js*.  
- Renderizado en **WebGL**.  

---

## 📦 Tecnologías utilizadas  

- [Three.js](https://threejs.org/) → motor gráfico 3D.  
- [Rapier](https://rapier.rs/docs/user_guides/javascript/) → motor de físicas en WebAssembly.  
- [GLTFLoader](https://threejs.org/docs/#examples/en/loaders/GLTFLoader) → carga del modelo 3D del coche.  
- [lil-gui](https://lil-gui.georgealways.com/) → panel de control para depuración.  
- [Stats.js](https://github.com/mrdoob/stats.js/) → monitor de FPS.  

---

## 🎮 Controles

- W / S → Acelerar / frenar.

- A / D → Girar izquierda / derecha.

- Mouse → Rotar cámara.

- Rueda del ratón → Acercar / alejar cámara.

- Click en pantalla → Captura del puntero (para mover la cámara libremente).

---

## 📦 Instalación y ejecución

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/usuario/nombre-del-proyecto.git
   cd nombre-del-proyecto

npm install

npm run dev
