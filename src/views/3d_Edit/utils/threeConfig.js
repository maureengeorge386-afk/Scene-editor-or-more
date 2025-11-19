import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { CAMERA_CONFIG, GRID_CONFIG, AXES_CONFIG, LIGHT_CONFIG, DEFAULT_COLORS } from './constants.js'

// 创建场景
export const createScene = () => {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(DEFAULT_COLORS.BACKGROUND)
  return scene
}

// 创建相机
export const createCamera = (aspect) => {
  const camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    aspect,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  )
  
  camera.position.set(...CAMERA_CONFIG.INITIAL_POSITION)
  camera.lookAt(...CAMERA_CONFIG.LOOK_AT)
  
  return camera
}

// 创建渲染器
export const createRenderer = (container) => {
  const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true
  })
  
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  
  // 增强阴影设置
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.shadowMap.autoUpdate = true
  
  // 增强光照和色彩设置
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.2 // 增加曝光度
  renderer.toneMappingWhitePoint = 1.0
  
  // 启用物理正确的光照
  renderer.useLegacyLights = false
  
  return renderer
}

// 创建控制器
export const createControls = (camera, renderer) => {
  const controls = new OrbitControls(camera, renderer.domElement)
  
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.screenSpacePanning = false
  controls.minDistance = 1
  controls.maxDistance = 100
  controls.maxPolarAngle = Math.PI
  
  return controls
}

// 创建光源
export const createLights = () => {
  const lights = []
  
  // 环境光 - 增强整体亮度
  const ambientLight = new THREE.AmbientLight(
    LIGHT_CONFIG.AMBIENT.COLOR,
    LIGHT_CONFIG.AMBIENT.INTENSITY
  )
  lights.push(ambientLight)
  
  // 主方向光 - 主要光源，产生强烈阴影
  const directionalLight = new THREE.DirectionalLight(
    LIGHT_CONFIG.DIRECTIONAL.COLOR,
    LIGHT_CONFIG.DIRECTIONAL.INTENSITY
  )
  directionalLight.position.set(...LIGHT_CONFIG.DIRECTIONAL.POSITION)
  directionalLight.castShadow = true
  
  // 增强阴影质量
  directionalLight.shadow.mapSize.width = 4096
  directionalLight.shadow.mapSize.height = 4096
  directionalLight.shadow.camera.near = 0.1
  directionalLight.shadow.camera.far = 100
  directionalLight.shadow.camera.left = -20
  directionalLight.shadow.camera.right = 20
  directionalLight.shadow.camera.top = 20
  directionalLight.shadow.camera.bottom = -20
  
  // 设置阴影偏移，减少阴影瑕疵
  directionalLight.shadow.bias = -0.0001
  directionalLight.shadow.normalBias = 0.02
  
  lights.push(directionalLight)
  
  // 点光源 - 补充照明
  const pointLight = new THREE.PointLight(
    LIGHT_CONFIG.POINT.COLOR,
    LIGHT_CONFIG.POINT.INTENSITY,
    LIGHT_CONFIG.POINT.DISTANCE
  )
  pointLight.position.set(...LIGHT_CONFIG.POINT.POSITION)
  pointLight.castShadow = true
  pointLight.shadow.mapSize.width = 1024
  pointLight.shadow.mapSize.height = 1024
  pointLight.shadow.camera.near = 0.1
  pointLight.shadow.camera.far = 50
  lights.push(pointLight)
  
  // 填充光 - 蓝色调，增加层次感
  const fillLight = new THREE.DirectionalLight(
    LIGHT_CONFIG.FILL.COLOR,
    LIGHT_CONFIG.FILL.INTENSITY
  )
  fillLight.position.set(...LIGHT_CONFIG.FILL.POSITION)
  fillLight.castShadow = false // 填充光不产生阴影
  lights.push(fillLight)
  
  return lights
}

// 创建网格
export const createGrid = () => {
  const gridHelper = new THREE.GridHelper(
    GRID_CONFIG.SIZE,
    GRID_CONFIG.DIVISIONS,
    DEFAULT_COLORS.GRID,
    DEFAULT_COLORS.GRID_SECONDARY
  )
  gridHelper.name = 'grid'
  return gridHelper
}

// 创建坐标轴
export const createAxes = () => {
  const axesHelper = new THREE.AxesHelper(AXES_CONFIG.SIZE)
  axesHelper.name = 'axes'
  return axesHelper
}

// 创建几何体工厂
export const createGeometry = (type, params = {}) => {
  switch (type) {
    case 'cube':
      return new THREE.BoxGeometry(
        params.width || 2,
        params.height || 2,
        params.depth || 2
      )
    case 'sphere':
      return new THREE.SphereGeometry(
        params.radius || 1,
        params.widthSegments || 32,
        params.heightSegments || 32
      )
    case 'cylinder':
      return new THREE.CylinderGeometry(
        params.radiusTop || 1,
        params.radiusBottom || 1,
        params.height || 2,
        params.radialSegments || 32
      )
    case 'cone':
      return new THREE.ConeGeometry(
        params.radius || 1,
        params.height || 2,
        params.radialSegments || 32
      )
    case 'plane':
      return new THREE.PlaneGeometry(
        params.width || 4,
        params.height || 4
      )
    case 'torus':
      return new THREE.TorusGeometry(
        params.radius || 1,
        params.tube || 0.4,
        params.radialSegments || 16,
        params.tubularSegments || 100
      )
    case 'octahedron':
      return new THREE.OctahedronGeometry(params.radius || 1)
    case 'tetrahedron':
      return new THREE.TetrahedronGeometry(params.radius || 1)
    case 'icosahedron':
      return new THREE.IcosahedronGeometry(params.radius || 1)
    default:
      return new THREE.BoxGeometry(2, 2, 2)
  }
}

// 创建材质工厂
export const createMaterial = (type, params = {}) => {
  const baseParams = {
    color: params.color || 0x00ff00,
    transparent: params.transparent || false,
    opacity: params.opacity || 1.0,
    ...params
  }
  
  switch (type) {
    case 'basic':
      return new THREE.MeshBasicMaterial(baseParams)
    case 'standard':
      return new THREE.MeshStandardMaterial({
        ...baseParams,
        roughness: params.roughness || 0.5,
        metalness: params.metalness || 0.5
      })
    case 'phong':
      return new THREE.MeshPhongMaterial({
        ...baseParams,
        shininess: params.shininess || 30
      })
    case 'lambert':
      return new THREE.MeshLambertMaterial(baseParams)
    case 'toon':
      return new THREE.MeshToonMaterial(baseParams)
    case 'normal':
      return new THREE.MeshNormalMaterial(baseParams)
    case 'wireframe':
      return new THREE.MeshBasicMaterial({
        ...baseParams,
        wireframe: true
      })
    default:
      return new THREE.MeshBasicMaterial(baseParams)
  }
}

// 创建网格对象
export const createMesh = (geometry, material) => {
  const mesh = new THREE.Mesh(geometry, material)
  
  // 设置默认属性
  mesh.castShadow = true
  mesh.receiveShadow = true
  
  // 随机位置
  mesh.position.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  )
  
  return mesh
}

// 创建文本几何体
export const createTextGeometry = (text, params = {}) => {
  // 注意：这里需要加载字体文件
  // 实际使用时需要先加载字体
  const geometry = new THREE.PlaneGeometry(2, 1)
  const material = new THREE.MeshBasicMaterial({ 
    color: params.color || 0xffffff,
    transparent: true,
    opacity: 0.8
  })
  
  const mesh = new THREE.Mesh(geometry, material)
  mesh.userData.text = text
  
  return mesh
}

// 创建粒子系统
export const createParticleSystem = (count = 1000, params = {}) => {
  const geometry = new THREE.BufferGeometry()
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  
  for (let i = 0; i < count * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 20
    positions[i + 1] = (Math.random() - 0.5) * 20
    positions[i + 2] = (Math.random() - 0.5) * 20
    
    colors[i] = Math.random()
    colors[i + 1] = Math.random()
    colors[i + 2] = Math.random()
  }
  
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  
  const material = new THREE.PointsMaterial({
    size: params.size || 0.1,
    vertexColors: true,
    transparent: true,
    opacity: params.opacity || 0.8
  })
  
  return new THREE.Points(geometry, material)
}
