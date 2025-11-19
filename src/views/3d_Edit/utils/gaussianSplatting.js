import * as THREE from 'three'
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader'

/**
 * 简化版高斯泼溅加载器 (兼容 Three.js 0.149.0)
 * 将 .ply 点云文件渲染为点精灵
 */
export class GaussianSplattingLoader {
  constructor() {
    this.plyLoader = new PLYLoader()
  }

  /**
   * 加载 .ply 文件并创建点云对象
   * @param {string} url - .ply 文件路径
   * @param {function} onProgress - 加载进度回调
   * @returns {Promise<THREE.Points>}
   */
  load(url, onProgress) {
    return new Promise((resolve, reject) => {
      this.plyLoader.load(
        url,
        (geometry) => {
      // 创建点云材质
      const material = new THREE.PointsMaterial({
        size: 0.08, // 增大默认尺寸，减少"马赛克"效果
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95, // 提高不透明度
        blending: THREE.NormalBlending,
        depthWrite: true,
        depthTest: true
      })

          // 如果几何体没有颜色属性，添加默认颜色
          if (!geometry.attributes.color) {
            const colors = new Float32Array(geometry.attributes.position.count * 3)
            for (let i = 0; i < colors.length; i += 3) {
              colors[i] = 0.8
              colors[i + 1] = 0.8
              colors[i + 2] = 0.8
            }
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
          }

          // 计算法线（可选，用于更好的渲染效果）
          if (!geometry.attributes.normal) {
            geometry.computeVertexNormals()
          }

          // 创建点云对象
          const points = new THREE.Points(geometry, material)
          points.name = 'GaussianSplatting'
          points.userData.isGaussianSplat = true

          resolve(points)
        },
        onProgress,
        reject
      )
    })
  }

  /**
   * 从 .splat 文件加载 (简化版，将其视为二进制点云数据)
   * @param {string} url - .splat 文件路径
   * @returns {Promise<THREE.Points>}
   */
  async loadSplat(url) {
    try {
      const response = await fetch(url)
      const buffer = await response.arrayBuffer()
      
      // 简化解析：假设每个点包含位置(3 floats) + 颜色(3 floats)
      const floatView = new Float32Array(buffer)
      const pointCount = Math.floor(floatView.length / 6)

      const positions = new Float32Array(pointCount * 3)
      const colors = new Float32Array(pointCount * 3)

      for (let i = 0; i < pointCount; i++) {
        const offset = i * 6
        positions[i * 3] = floatView[offset]
        positions[i * 3 + 1] = floatView[offset + 1]
        positions[i * 3 + 2] = floatView[offset + 2]
        colors[i * 3] = floatView[offset + 3]
        colors[i * 3 + 1] = floatView[offset + 4]
        colors[i * 3 + 2] = floatView[offset + 5]
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.08, // 增大默认尺寸，减少"马赛克"效果
        vertexColors: true,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.95 // 提高不透明度
      })

      const points = new THREE.Points(geometry, material)
      points.name = 'GaussianSplatting'
      points.userData.isGaussianSplat = true

      return points
    } catch (error) {
      console.error('Error loading .splat file:', error)
      throw error
    }
  }
}

/**
 * 高斯泼溅控制器 - 用于调整渲染参数
 */
export class GaussianSplattingController {
  constructor(pointsObject) {
    this.points = pointsObject
    this.material = pointsObject.material
  }

  /**
   * 设置点大小
   */
  setPointSize(size) {
    this.material.size = size
  }

  /**
   * 设置透明度
   */
  setOpacity(opacity) {
    this.material.opacity = opacity
  }

  /**
   * 设置是否启用深度测试
   */
  setDepthTest(enabled) {
    this.material.depthTest = enabled
    this.material.needsUpdate = true
  }

  /**
   * 设置混合模式
   */
  setBlending(mode) {
    const blendingModes = {
      'Normal': THREE.NormalBlending,
      'Additive': THREE.AdditiveBlending,
      'Subtractive': THREE.SubtractiveBlending,
      'Multiply': THREE.MultiplyBlending
    }
    this.material.blending = blendingModes[mode] || THREE.NormalBlending
    this.material.needsUpdate = true
  }

  /**
   * 获取点云信息
   */
  getInfo() {
    const geometry = this.points.geometry
    return {
      pointCount: geometry.attributes.position.count,
      hasColors: !!geometry.attributes.color,
      hasNormals: !!geometry.attributes.normal,
      boundingBox: geometry.boundingBox
    }
  }
}

