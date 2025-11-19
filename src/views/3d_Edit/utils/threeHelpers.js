import * as THREE from 'three'
import { DEFAULT_COLORS } from './constants.js'

// 场景对象管理
export class SceneManager {
  constructor(scene) {
    this.scene = scene
    this.objects = new Map()
    this.selectedObject = null
    this.objectCounter = 0
  }

  // 添加对象
  addObject(object, type = 'mesh') {
    const id = `object_${this.objectCounter++}`
    object.userData.id = id
    object.userData.type = type
    object.userData.originalColor = object.material?.color?.getHex() || 0xffffff
    
    this.objects.set(id, object)
    this.scene.add(object)
    
    return id
  }

  // 移除对象
  removeObject(id) {
    const object = this.objects.get(id)
    if (object) {
      this.scene.remove(object)
      this.objects.delete(id)
      
      if (this.selectedObject === object) {
        this.selectedObject = null
      }
      
      return true
    }
    return false
  }

  // 选择对象
  selectObject(id) {
    this.clearSelection()
    
    const object = this.objects.get(id)
    if (object) {
      this.selectedObject = object
      this.highlightObject(object)
      return object
    }
    return null
  }

  // 清除选择
  clearSelection() {
    if (this.selectedObject) {
      this.unhighlightObject(this.selectedObject)
      this.selectedObject = null
    }
  }

  // 高亮对象
  highlightObject(object) {
    if (object.material) {
      object.userData.originalColor = object.material.color.getHex()
      object.material.color.setHex(DEFAULT_COLORS.SELECTED)
    }
  }

  // 取消高亮
  unhighlightObject(object) {
    if (object.material && object.userData.originalColor) {
      object.material.color.setHex(object.userData.originalColor)
    }
  }

  // 获取所有对象
  getAllObjects() {
    return Array.from(this.objects.values())
  }

  // 清空场景
  clearScene() {
    this.objects.forEach((object) => {
      this.scene.remove(object)
    })
    this.objects.clear()
    this.selectedObject = null
  }

  // 获取对象统计信息
  getStats() {
    const stats = {
      total: this.objects.size,
      meshes: 0,
      lights: 0,
      cameras: 0,
      groups: 0
    }

    this.objects.forEach((object) => {
      switch (object.userData.type) {
        case 'mesh':
          stats.meshes++
          break
        case 'light':
          stats.lights++
          break
        case 'camera':
          stats.cameras++
          break
        case 'group':
          stats.groups++
          break
      }
    })

    return stats
  }
}

// 相机控制器
export class CameraController {
  constructor(camera, controls) {
    this.camera = camera
    this.controls = controls
    this.originalPosition = camera.position.clone()
    this.originalRotation = camera.rotation.clone()
  }

  // 重置相机
  reset() {
    this.camera.position.copy(this.originalPosition)
    this.camera.rotation.copy(this.originalRotation)
    this.controls.reset()
  }

  // 聚焦到对象
  focusOnObject(object, distance = 10) {
    const box = new THREE.Box3().setFromObject(object)
    const center = box.getCenter(new THREE.Vector3())
    const size = box.getSize(new THREE.Vector3())
    
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = this.camera.fov * (Math.PI / 180)
    const cameraDistance = Math.abs(maxDim / 2 / Math.tan(fov / 2)) + distance
    
    this.camera.position.copy(center)
    this.camera.position.z += cameraDistance
    this.camera.lookAt(center)
    
    this.controls.target.copy(center)
    this.controls.update()
  }

  // 设置相机位置
  setPosition(x, y, z) {
    this.camera.position.set(x, y, z)
    this.controls.update()
  }

  // 设置相机目标
  setTarget(x, y, z) {
    this.controls.target.set(x, y, z)
    this.controls.update()
  }
}

// 材质管理器
export class MaterialManager {
  constructor() {
    this.materials = new Map()
    this.defaultMaterial = new THREE.MeshBasicMaterial({ color: 0x888888 })
  }

  // 创建材质
  createMaterial(type, params = {}) {
    const key = `${type}_${JSON.stringify(params)}`
    
    if (this.materials.has(key)) {
      return this.materials.get(key).clone()
    }

    let material
    switch (type) {
      case 'basic':
        material = new THREE.MeshBasicMaterial(params)
        break
      case 'standard':
        material = new THREE.MeshStandardMaterial(params)
        break
      case 'phong':
        material = new THREE.MeshPhongMaterial(params)
        break
      case 'lambert':
        material = new THREE.MeshLambertMaterial(params)
        break
      case 'toon':
        material = new THREE.MeshToonMaterial(params)
        break
      case 'normal':
        material = new THREE.MeshNormalMaterial(params)
        break
      case 'wireframe':
        material = new THREE.MeshBasicMaterial({
          ...params,
          wireframe: true
        })
        break
      // 镜面反射材质 - 使用MeshPhysicalMaterial获得更好的反射效果
      case 'mirror':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 1.0,
          roughness: params.roughness !== undefined ? params.roughness : 0.0,
          envMapIntensity: params.envMapIntensity !== undefined ? params.envMapIntensity : 2.0,
          color: 0xffffff,
          envMap: params.envMap || null,
          // 启用物理材质的高级反射特性
          reflectivity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: params.clearcoatRoughness !== undefined ? params.clearcoatRoughness : 0.0,
          // 增强反射效果
          transmission: 0.0,
          thickness: 0.0,
          ...params
        })
        break
      case 'chrome':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 1.0,
          roughness: 0.1,
          envMapIntensity: 2.0,
          color: 0xc0c0c0,
          envMap: params.envMap || null,
          reflectivity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          ...params
        })
        break
      case 'gold':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 1.0,
          roughness: 0.2,
          envMapIntensity: 1.8,
          color: 0xffd700,
          envMap: params.envMap || null,
          reflectivity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.2,
          ...params
        })
        break
      case 'silver':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 1.0,
          roughness: 0.1,
          envMapIntensity: 2.2,
          color: 0xe6e6e6,
          envMap: params.envMap || null,
          reflectivity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.1,
          ...params
        })
        break
      case 'copper':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 1.0,
          roughness: 0.3,
          envMapIntensity: 1.6,
          color: 0xb87333,
          envMap: params.envMap || null,
          reflectivity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.3,
          ...params
        })
        break
      case 'glass':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 0.0,
          roughness: 0.0,
          transmission: 0.9,
          transparent: true,
          opacity: 0.1,
          envMapIntensity: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          color: 0xffffff,
          envMap: params.envMap || null,
          ...params
        })
        break
      case 'crystal':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 0.0,
          roughness: 0.0,
          transmission: 0.95,
          transparent: true,
          opacity: 0.05,
          envMapIntensity: 1.2,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          ior: 1.5,
          color: 0xffffff,
          envMap: params.envMap || null,
          ...params
        })
        break
      case 'physical':
        material = new THREE.MeshPhysicalMaterial({
          metalness: 0.5,
          roughness: 0.5,
          envMapIntensity: 1.0,
          clearcoat: 0.5,
          clearcoatRoughness: 0.1,
          envMap: params.envMap || null,
          ...params
        })
        break
      default:
        material = this.defaultMaterial.clone()
    }

    this.materials.set(key, material)
    return material.clone()
  }

  // 更新材质
  updateMaterial(object, newMaterial) {
    if (object.material) {
      object.material.dispose()
    }
    object.material = newMaterial
  }

  // 应用材质到对象
  applyMaterial(object, materialType, params = {}) {
    const material = this.createMaterial(materialType, params)
    this.updateMaterial(object, material)
  }

  // 清理材质
  dispose() {
    this.materials.forEach((material) => {
      material.dispose()
    })
    this.materials.clear()
  }
}

// 几何体管理器
export class GeometryManager {
  constructor() {
    this.geometries = new Map()
  }

  // 创建几何体
  createGeometry(type, params = {}) {
    const key = `${type}_${JSON.stringify(params)}`
    
    if (this.geometries.has(key)) {
      return this.geometries.get(key)
    }

    let geometry
    switch (type) {
      case 'cube':
        geometry = new THREE.BoxGeometry(
          params.width || 2,
          params.height || 2,
          params.depth || 2
        )
        break
      case 'sphere':
        geometry = new THREE.SphereGeometry(
          params.radius || 1,
          params.widthSegments || 32,
          params.heightSegments || 32
        )
        break
      case 'cylinder':
        geometry = new THREE.CylinderGeometry(
          params.radiusTop || 1,
          params.radiusBottom || 1,
          params.height || 2,
          params.radialSegments || 32
        )
        break
      case 'cone':
        geometry = new THREE.ConeGeometry(
          params.radius || 1,
          params.height || 2,
          params.radialSegments || 32
        )
        break
      case 'plane':
        geometry = new THREE.PlaneGeometry(
          params.width || 4,
          params.height || 4
        )
        break
      case 'torus':
        geometry = new THREE.TorusGeometry(
          params.radius || 1,
          params.tube || 0.4,
          params.radialSegments || 16,
          params.tubularSegments || 100
        )
        break
      case 'octahedron':
        geometry = new THREE.OctahedronGeometry(params.radius || 1)
        break
      case 'tetrahedron':
        geometry = new THREE.TetrahedronGeometry(params.radius || 1)
        break
      case 'icosahedron':
        geometry = new THREE.IcosahedronGeometry(params.radius || 1)
        break
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2)
    }

    this.geometries.set(key, geometry)
    return geometry
  }

  // 清理几何体
  dispose() {
    this.geometries.forEach((geometry) => {
      geometry.dispose()
    })
    this.geometries.clear()
  }
}

// 工具函数
export const threeUtils = {
  // 计算包围盒
  computeBoundingBox(objects) {
    const box = new THREE.Box3()
    objects.forEach(obj => box.expandByObject(obj))
    return box
  },

  // 计算包围球
  computeBoundingSphere(objects) {
    const box = this.computeBoundingBox(objects)
    const sphere = new THREE.Sphere()
    box.getBoundingSphere(sphere)
    return sphere
  },

  // 随机颜色
  randomColor() {
    return Math.random() * 0xffffff
  },

  // 随机位置
  randomPosition(range = 10) {
    return new THREE.Vector3(
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range,
      (Math.random() - 0.5) * range
    )
  },

  // 随机旋转
  randomRotation() {
    return new THREE.Euler(
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2,
      Math.random() * Math.PI * 2
    )
  },

  // 随机缩放
  randomScale(min = 0.5, max = 2.0) {
    const scale = min + Math.random() * (max - min)
    return new THREE.Vector3(scale, scale, scale)
  },

  // 深拷贝对象
  cloneObject(object) {
    const clone = object.clone()
    
    if (object.material) {
      clone.material = object.material.clone()
    }
    
    if (object.geometry) {
      clone.geometry = object.geometry.clone()
    }
    
    return clone
  },

  // 导出场景为JSON
  exportScene(scene) {
    const sceneData = {
      objects: [],
      metadata: {
        version: '1.0.0',
        date: new Date().toISOString(),
        objectCount: scene.children.length
      }
    }

    scene.children.forEach(child => {
      if (child.userData.id) {
        const objectData = {
          id: child.userData.id,
          type: child.userData.type,
          position: child.position.toArray(),
          rotation: child.rotation.toArray(),
          scale: child.scale.toArray(),
          geometry: child.geometry?.type,
          material: child.material?.type,
          userData: child.userData
        }
        sceneData.objects.push(objectData)
      }
    })

    return sceneData
  },

  // 从JSON导入场景
  importScene(sceneData, sceneManager) {
    // 这里可以实现场景导入逻辑
    console.log('Importing scene:', sceneData)
  }
}
