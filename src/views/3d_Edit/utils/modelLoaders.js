import * as THREE from 'three'

// 模型加载器管理器
export class ModelLoaderManager {
  constructor() {
    this.loaders = new Map()
    this.initLoaders()
  }

  // 初始化加载器
  initLoaders() {
    // 这里可以添加各种格式的加载器
    // 由于Three.js的加载器需要额外的包，这里提供基础实现
  }

  // 根据文件扩展名获取加载器
  getLoader(fileExtension) {
    return this.loaders.get(fileExtension.toLowerCase())
  }

  // 加载模型文件
  async loadModel(file) {
    const fileExtension = file.name.toLowerCase().split('.').pop()
    
    if (!fileExtension) {
      throw new Error('无法识别文件类型')
    }

    try {
      switch (fileExtension) {
        case 'gltf':
        case 'glb':
          return await this.loadGLTF(file)
        case 'obj':
          return await this.loadOBJ(file)
        case 'fbx':
          return await this.loadFBX(file)
        case 'stl':
          return await this.loadSTL(file)
        case 'dae':
          return await this.loadDAE(file)
        case '3ds':
          return await this.load3DS(file)
        case 'ply':
          return await this.loadPLY(file)
        case '3mf':
          return await this.load3MF(file)
        case 'rain':
          return await this.loadRain(file)
        default:
          throw new Error(`不支持的文件格式: ${fileExtension}`)
      }
    } catch (error) {
      console.error(`加载模型失败: ${file.name}`, error)
      throw error
    }
  }

  // GLTF/GLB 加载器
  async loadGLTF(file) {
    try {
      // 动态导入GLTF加载器
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      let DRACOLoaderModule = null
      try {
        DRACOLoaderModule = await import('three/examples/jsm/loaders/DRACOLoader.js')
      } catch (e) {
        console.warn('未能动态加载 DRACOLoader，将尝试直接解析（可能失败，建议放置 Draco 解码器或使用CDN）', e)
      }
      
      return new Promise((resolve, reject) => {
        const loader = new GLTFLoader()
        // 配置 DRACOLoader（若可用）
        if (DRACOLoaderModule && DRACOLoaderModule.DRACOLoader) {
          const dracoLoader = new DRACOLoaderModule.DRACOLoader()
          // 使用官方CDN的解码器，开箱即用；如需本地离线，将解码器拷贝到 public/draco/ 并改为 `${import.meta.env.BASE_URL}draco/`
          dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/')
          dracoLoader.setDecoderConfig({ type: 'js' })
          loader.setDRACOLoader(dracoLoader)
        }
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const arrayBuffer = event.target.result
            loader.parse(arrayBuffer, '', (gltf) => {
              console.log('GLTF模型加载成功:', gltf)
              
              // 将动画数据传递到场景对象上
              if (gltf.animations && gltf.animations.length > 0) {
                console.log(`发现 ${gltf.animations.length} 个动画:`, gltf.animations.map(anim => ({
                  name: anim.name || '未命名',
                  duration: anim.duration,
                  tracks: anim.tracks.length
                })))
                
                // 将动画数据添加到场景对象上
                gltf.scene.animations = gltf.animations
                
                // 递归遍历所有子对象，确保动画数据可用
                gltf.scene.traverse((child) => {
                  if (child.type === 'Mesh' || child.type === 'Group') {
                    child.animations = gltf.animations
                  }
                })
              }
              
              resolve(gltf.scene)
            }, (error) => {
              console.error('GLTF解析失败:', error)
              reject(error)
            })
          } catch (error) {
            console.error('GLTF加载错误:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      console.warn('GLTF加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'GLTF', 0x00ff00)
    }
  }

  // OBJ 加载器
  async loadOBJ(file) {
    try {
      // 动态导入OBJ加载器
      const { OBJLoader } = await import('three/examples/jsm/loaders/OBJLoader.js')
      
      return new Promise((resolve, reject) => {
        const loader = new OBJLoader()
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const text = event.target.result
            const object = loader.parse(text)
            console.log('OBJ模型加载成功:', object)
            resolve(object)
          } catch (error) {
            console.error('OBJ解析失败:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    } catch (error) {
      console.warn('OBJ加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'OBJ', 0x0000ff)
    }
  }

  // FBX 加载器
  async loadFBX(file) {
    try {
      // 动态导入FBX加载器
      const { FBXLoader } = await import('three/examples/jsm/loaders/FBXLoader.js')
      
      return new Promise((resolve, reject) => {
        const loader = new FBXLoader()
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const arrayBuffer = event.target.result
            const object = loader.parse(arrayBuffer, '')
            console.log('FBX模型加载成功:', object)
            
            // FBX加载器通常会自动处理动画，但我们可以检查一下
            if (object.animations && object.animations.length > 0) {
              console.log(`发现 ${object.animations.length} 个FBX动画:`, object.animations.map(anim => ({
                name: anim.name || '未命名',
                duration: anim.duration,
                tracks: anim.tracks.length
              })))
            }
            
            resolve(object)
          } catch (error) {
            console.error('FBX解析失败:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      console.warn('FBX加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'FBX', 0xff0000)
    }
  }

  // STL 加载器
  async loadSTL(file) {
    try {
      // 动态导入STL加载器
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
      
      return new Promise((resolve, reject) => {
        const loader = new STLLoader()
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const arrayBuffer = event.target.result
            const geometry = loader.parse(arrayBuffer)
            const material = new THREE.MeshPhongMaterial({ color: 0xffff00 })
            const mesh = new THREE.Mesh(geometry, material)
            console.log('STL模型加载成功:', mesh)
            resolve(mesh)
          } catch (error) {
            console.error('STL解析失败:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      console.warn('STL加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'STL', 0xffff00)
    }
  }

  // DAE 加载器
  async loadDAE(file) {
    try {
      // 动态导入DAE加载器
      const { ColladaLoader } = await import('three/examples/jsm/loaders/ColladaLoader.js')
      
      return new Promise((resolve, reject) => {
        const loader = new ColladaLoader()
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const text = event.target.result
            const result = loader.parse(text)
            console.log('DAE模型加载成功:', result)
            resolve(result.scene)
          } catch (error) {
            console.error('DAE解析失败:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsText(file)
      })
    } catch (error) {
      console.warn('DAE加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'DAE', 0xff00ff)
    }
  }

  // 3DS 加载器
  async load3DS(file) {
    try {
      // 动态导入3DS加载器
      const { TDSLoader } = await import('three/examples/jsm/loaders/TDSLoader.js')
      
      return new Promise((resolve, reject) => {
        const loader = new TDSLoader()
        const reader = new FileReader()
        
        reader.onload = (event) => {
          try {
            const arrayBuffer = event.target.result
            const object = loader.parse(arrayBuffer)
            console.log('3DS模型加载成功:', object)
            resolve(object)
          } catch (error) {
            console.error('3DS解析失败:', error)
            reject(error)
          }
        }
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsArrayBuffer(file)
      })
    } catch (error) {
      console.warn('3DS加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, '3DS', 0x00ffff)
    }
  }

  // PLY 加载器
  async loadPLY(file) {
    try {
      // 动态导入PLY加载器
      const { PLYLoader } = await import('three/examples/jsm/loaders/PLYLoader.js')
      
      return new Promise((resolve, reject) => {
        const loader = new PLYLoader()
        const reader = new FileReader()
        
        reader.onerror = () => reject(new Error('文件读取失败'))
        
        // PLY文件通常是文本格式
        if (file.type === 'text/plain' || file.name.toLowerCase().endsWith('.ply')) {
          reader.onload = (event) => {
            try {
              const text = event.target.result
              const geometry = loader.parse(text)
              const material = new THREE.MeshPhongMaterial({ color: 0xff8800 })
              const mesh = new THREE.Mesh(geometry, material)
              console.log('PLY模型加载成功:', mesh)
              resolve(mesh)
            } catch (error) {
              console.error('PLY解析失败:', error)
              reject(error)
            }
          }
          reader.readAsText(file)
        } else {
          // 二进制PLY文件
          reader.onload = (event) => {
            try {
              const arrayBuffer = event.target.result
              const geometry = loader.parse(arrayBuffer)
              const material = new THREE.MeshPhongMaterial({ color: 0xff8800 })
              const mesh = new THREE.Mesh(geometry, material)
              console.log('PLY模型加载成功:', mesh)
              resolve(mesh)
            } catch (error) {
              console.error('PLY解析失败:', error)
              reject(error)
            }
          }
          reader.readAsArrayBuffer(file)
        }
      })
    } catch (error) {
      console.warn('PLY加载器不可用，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'PLY', 0xff8800)
    }
  }

  // 3MF 加载器（3D Manufacturing Format）
  async load3MF(file) {
    try {
      // 3MF格式比较复杂，Three.js没有内置加载器
      // 这里创建一个占位符，实际项目中可以集成专门的3MF加载器
      console.warn('3MF格式暂不支持直接加载，使用占位符模型')
      return this.createPlaceholderMesh(file.name, '3MF', 0xff6600)
    } catch (error) {
      console.warn('3MF加载失败，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, '3MF', 0xff6600)
    }
  }

  // RAIN 加载器（自定义格式）
  async loadRain(file) {
    try {
      // RAIN格式是自定义格式，Three.js没有内置加载器
      // 这里创建一个占位符，实际项目中可以集成专门的RAIN加载器
      console.warn('RAIN格式暂不支持直接加载，使用占位符模型')
      return this.createPlaceholderMesh(file.name, 'RAIN', 0x00ff88)
    } catch (error) {
      console.warn('RAIN加载失败，使用占位符:', error)
      return this.createPlaceholderMesh(file.name, 'RAIN', 0x00ff88)
    }
  }


  // 创建占位符网格（用于测试）
  createPlaceholderMesh(fileName, format, color) {
    // 创建更大的占位符，更容易看到
    const geometry = new THREE.BoxGeometry(2, 2, 2)
    const material = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: 0.8
    })
    const mesh = new THREE.Mesh(geometry, material)
    
    // 设置名称和用户数据
    mesh.name = `${format}_${fileName}`
    mesh.userData = {
      originalFile: fileName,
      format: format,
      isPlaceholder: true
    }
    
    // 添加边框效果
    const edges = new THREE.EdgesGeometry(geometry)
    const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff })
    const wireframe = new THREE.LineSegments(edges, lineMaterial)
    mesh.add(wireframe)
    
    return mesh
  }

  // 处理模型导入后的设置
  setupImportedModel(model, options = {}) {
    const {
      autoScale = true,
      autoCenter = true,
      generateShadows = true,
      defaultMaterial = null
    } = options

    try {
      // 设置模型名称（如果没有的话）
      if (!model.name) {
        model.name = `Imported_${Date.now()}`
      }

      // 确保模型可见
      model.visible = true

      // 自动缩放
      if (autoScale) {
        this.autoScaleModel(model)
      }

      // 自动居中
      if (autoCenter) {
        this.autoCenterModel(model)
      }

      // 生成阴影
      if (generateShadows) {
        this.enableShadows(model)
      }

      // 应用默认材质（如果需要）
      if (defaultMaterial) {
        this.applyDefaultMaterial(model, defaultMaterial)
      }

      // 遍历所有子对象，确保它们都可见并设置阴影
      model.traverse((child) => {
        if (child.isMesh || child.isLine || child.isPoints) {
          child.visible = true
          
          // 设置阴影
          if (child.isMesh) {
            child.castShadow = true
            child.receiveShadow = true
          }
          
          // 确保几何体有正确的材质
          if (child.isMesh && !child.material) {
            child.material = new THREE.MeshPhongMaterial({ 
              color: 0xcccccc,
              shininess: 100,
              transparent: false,
              opacity: 1
            })
          }
          
          // 优化现有材质
          if (child.isMesh && child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.isMaterial) {
                  mat.needsUpdate = true
                  // 确保材质支持阴影
                  if (mat.transparent) {
                    mat.transparent = false
                    mat.opacity = 1
                  }
                }
              })
            } else if (child.material.isMaterial) {
              child.material.needsUpdate = true
              // 确保材质支持阴影
              if (child.material.transparent) {
                child.material.transparent = false
                child.material.opacity = 1
              }
            }
          }
        }
      })

      console.log('模型设置完成:', {
        name: model.name,
        type: model.type,
        children: model.children.length,
        position: model.position,
        scale: model.scale
      })

      return model
    } catch (error) {
      console.error('设置导入模型时出错:', error)
      return model
    }
  }

  // 自动缩放模型
  autoScaleModel(model) {
    try {
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const maxSize = Math.max(size.x, size.y, size.z)
      
      // 如果模型太大，缩小到合适大小
      if (maxSize > 10) {
        const scale = 10 / maxSize
        model.scale.setScalar(scale)
        console.log(`模型自动缩放: ${maxSize.toFixed(2)} -> 10, 缩放比例: ${scale.toFixed(2)}`)
      } else if (maxSize < 0.5) {
        // 如果模型太小，放大到合适大小
        const scale = 2 / maxSize
        model.scale.setScalar(scale)
        console.log(`模型自动放大: ${maxSize.toFixed(2)} -> 2, 缩放比例: ${scale.toFixed(2)}`)
      }
    } catch (error) {
      console.warn('自动缩放失败:', error)
    }
  }

  // 自动居中模型
  autoCenterModel(model) {
    try {
      const box = new THREE.Box3().setFromObject(model)
      const center = box.getCenter(new THREE.Vector3())
      
      // 将模型移动到场景中心
      model.position.sub(center)
      
      // 确保模型不会沉入地下（Y轴最低点至少在地面上）
      const minY = box.min.y
      if (minY < 0) {
        model.position.y -= minY
      }
      
      console.log(`模型自动居中: 偏移量 (${center.x.toFixed(2)}, ${center.y.toFixed(2)}, ${center.z.toFixed(2)})`)
    } catch (error) {
      console.warn('自动居中失败:', error)
    }
  }

  // 启用阴影
  enableShadows(model) {
    try {
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          
          // 确保材质支持阴影
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                if (mat.transparent) {
                  mat.transparent = false
                  mat.opacity = 1
                }
              })
            } else {
              if (child.material.transparent) {
                child.material.transparent = false
                child.material.opacity = 1
              }
            }
          }
        }
      })
      console.log('阴影已启用')
    } catch (error) {
      console.warn('启用阴影失败:', error)
    }
  }

  // 应用默认材质
  applyDefaultMaterial(model, material) {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.material = material.clone()
      }
    })
  }

  // 获取模型信息
  getModelInfo(model) {
    try {
      const box = new THREE.Box3().setFromObject(model)
      const size = box.getSize(new THREE.Vector3())
      const center = box.getCenter(new THREE.Vector3())
      
      return {
        size: size,
        center: center,
        boundingBox: box,
        vertexCount: this.getVertexCount(model),
        faceCount: this.getFaceCount(model),
        position: model.position.clone(),
        rotation: model.rotation.clone(),
        scale: model.scale.clone()
      }
    } catch (error) {
      console.warn('获取模型信息失败:', error)
      return null
    }
  }

  // 获取顶点数量
  getVertexCount(model) {
    let count = 0
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        if (child.geometry.attributes.position) {
          count += child.geometry.attributes.position.count
        }
      }
    })
    return count
  }

  // 获取面数量
  getFaceCount(model) {
    let count = 0
    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        if (child.geometry.index) {
          count += child.geometry.index.count / 3
        } else if (child.geometry.attributes.position) {
          count += child.geometry.attributes.position.count / 3
        }
      }
    })
    return count
  }

  // 清理资源
  dispose() {
    this.loaders.clear()
  }
}

// 导出单例实例
export const modelLoaderManager = new ModelLoaderManager()

// 工具函数
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (fileName) => {
  return fileName.toLowerCase().split('.').pop()
}

export const isSupportedFormat = (fileName) => {
  const supportedFormats = ['gltf', 'glb', 'obj', 'fbx', 'stl', 'dae', '3ds', 'ply']
  const extension = getFileExtension(fileName)
  return supportedFormats.includes(extension)
}
