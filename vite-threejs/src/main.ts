import './style.css'
import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import Stats from 'three/addons/libs/stats.module.js'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'
import RAPIER from '@dimforge/rapier3d-compat'
import RapierDebugRenderer from './RapierDebugRenderer'
import Car from './Car'
import Box from './Box'

const menuPanel = document.getElementById('menuPanel');
const startButton = document.getElementById('startButton');
if (startButton && menuPanel) {
  startButton.addEventListener('click', () => {
    menuPanel.style.display = 'none';
  });
}

// Mostrar el panel de menú cuando se libera el pointer lock (Escape)
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement !== renderer.domElement && menuPanel) {
    menuPanel.style.display = 'block';
  }
});

await RAPIER.init() // This line is only needed if using the compat version
const gravity = new RAPIER.Vector3(0.0, -9.81, 0.0)
const world = new RAPIER.World(gravity)

const scene = new THREE.Scene()

const rapierDebugRenderer = new RapierDebugRenderer(scene, world)

const gridHelper = new THREE.GridHelper(200, 100, 0x222222, 0x222222)
gridHelper.position.y = -0.5
scene.add(gridHelper)

await new RGBELoader().loadAsync('img/rogland_clear_night_2k.hdr').then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping
  scene.environment = texture
  scene.background = texture
  scene.environmentIntensity = 0.1 // new in Three r163. https://threejs.org/docs/#api/en/scenes/Scene.environmentIntensity
})

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
camera.position.set(0, 3, 8)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement)

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

/* 
A follow cam implementation. 
A followTarget is added to the car mesh. 
A reference to the pivot is given to the car. 
The cars update method lerps the pivot towards to followTarget.
*/

const pivot = new THREE.Object3D()
const yaw = new THREE.Object3D()
const pitch = new THREE.Object3D()

scene.add(pivot)
pivot.add(yaw)
yaw.add(pitch)
pitch.add(camera) // adding the perspective camera to the hierarchy

function onDocumentMouseMove(e: MouseEvent) {
  yaw.rotation.y -= e.movementX * 0.002
  const v = pitch.rotation.x - e.movementY * 0.002

  // limit range
  if (v > -1 && v < 0.1) {
    pitch.rotation.x = v
  }
}

function onDocumentMouseWheel(e: WheelEvent) {
  e.preventDefault()
  const v = camera.position.z + e.deltaY * 0.005

  // limit range
  if (v >= 1 && v <= 10) {
    camera.position.z = v
  }
}
// end follow cam.

const keyMap: { [key: string]: boolean } = {}

const onDocumentKey = (e: KeyboardEvent) => {
  keyMap[e.code] = e.type === 'keydown'
}

document.addEventListener('click', () => {
  renderer.domElement.requestPointerLock()
})
document.addEventListener('pointerlockchange', () => {
  if (document.pointerLockElement === renderer.domElement) {
    document.addEventListener('keydown', onDocumentKey)
    document.addEventListener('keyup', onDocumentKey)

    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove)
    renderer.domElement.addEventListener('wheel', onDocumentMouseWheel)
  } else {
    document.removeEventListener('keydown', onDocumentKey)
    document.removeEventListener('keyup', onDocumentKey)

    renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove)
    renderer.domElement.removeEventListener('wheel', onDocumentMouseWheel)
  }
})

const floorMesh = new THREE.Mesh(new THREE.BoxGeometry(200, 1, 200), new THREE.MeshPhongMaterial())
floorMesh.receiveShadow = true
floorMesh.position.y = -1
scene.add(floorMesh)
const floorBody = world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(0, -1, 0))
const floorShape = RAPIER.ColliderDesc.cuboid(100, 0.5, 100) //.setCollisionGroups(65542)
world.createCollider(floorShape, floorBody)

//para poner el florr metalizado hay que cambiar el tipo de mesh material 
// const floorMesh = new THREE.Mesh(
//   new THREE.BoxGeometry(200, 1, 200),
//   new THREE.MeshStandardMaterial({
//     color: 0x888888,      // gris metálico, puedes cambiar el color si quieres
//     metalness: 1,         // máximo metalizado
//     roughness: 0.2        // bajo para que se vea brillante
//   })
// )

const car = new Car(keyMap, pivot)
await car.init(scene, world, [0, 1, 0])

const boxes: Box[] = []
for (let x = 0; x < 8; x += 1) {
  for (let y = 0; y < 8; y += 1) {
    boxes.push(new Box(scene, world, [(x - 4) * 1.2, y + 1, -20]))
  }
}

const boxes2: Box[] = []
for (let x = 0; x < 8; x += 1) {
  for (let y = 0; y < 8; y += 1) {
    boxes2.push(new Box(scene, world, [(x + 8) * 1.2, y + 1, -40]))
  }
}

const boxes3: Box[] = []
for (let x = 0; x < 8; x += 1) {
  for (let y = 0; y < 8; y += 1) {
    boxes3.push(new Box(scene, world, [(x - 7) * 1.2, y + 1, 34]))
  }
}

// al cargar estas me da problemas de memoria al ser demasiadas
// const boxes4: Box[] = []
// for (let x = 0; x < 8; x += 1) {
//   for (let y = 0; y < 8; y += 1) {
//     boxes4.push(new Box(scene, world, [(x + 10) * 1.2, y + 1, 34]))
//   }
// }

// Ejemplo de InstancedMesh para renderizar muchos cubos sin física
// const boxGeometry = new THREE.BoxGeometry(1, 1, 1)
// const boxMaterial = new THREE.MeshStandardMaterial({
//   color: 0xff0000,
//   metalness: 1,
//   roughness: 0.2
// })
// const instanceCount = 8 * 8 * 8 // 512 cubos
// const instancedMesh = new THREE.InstancedMesh(boxGeometry, boxMaterial, instanceCount)
// instancedMesh.castShadow = true
// scene.add(instancedMesh)

// let i = 0
// for (let x = 0; x < 8; x++) {
//   for (let y = 0; y < 8; y++) {
//     for (let z = 0; z < 8; z++) {
//       const matrix = new THREE.Matrix4()
//       matrix.setPosition(x * 2, y * 2, z * 2)
//       instancedMesh.setMatrixAt(i, matrix)
//       i++
//     }
//   }
// }

const stats = new Stats()
document.body.appendChild(stats.dom)

const gui = new GUI()
gui.add(rapierDebugRenderer, 'enabled').name('Rapier Degug Renderer')

const physicsFolder = gui.addFolder('Physics')
physicsFolder.add(world.gravity, 'x', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'y', -10.0, 10.0, 0.1)
physicsFolder.add(world.gravity, 'z', -10.0, 10.0, 0.1)

const clock = new THREE.Clock()
let delta

function animate() {
  requestAnimationFrame(animate)

  delta = clock.getDelta()
  world.timestep = Math.min(delta, 0.1)
  world.step()

  car.update(delta)

  boxes.forEach((b) => b.update())
  boxes2.forEach((b) => b.update())
  boxes3.forEach((b) => b.update())
  //boxes4.forEach((b) => b.update())

  rapierDebugRenderer.update()

  renderer.render(scene, camera)

  stats.update()
}

animate()