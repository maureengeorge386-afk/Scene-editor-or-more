import * as THREE from 'three'

/**
 * 粒子泼溅效果系统
 * 实现粒子发射、运动、消散的完整效果
 */
export class ParticleSplashSystem {
  constructor(scene) {
    this.scene = scene
    this.particleSystems = []
    this.isAnimating = false
  }

  /**
   * 创建泼溅效果
   * @param {Object} options - 配置参数
   */
  createSplash(options = {}) {
    const {
      position = new THREE.Vector3(0, 5, 0),
      particleCount = 500,
      color = 0x00aaff,
      size = 0.1,
      speed = 3,
      spread = 1.5,
      gravity = -9.8,
      lifetime = 2.0
    } = options

    // 创建粒子几何体
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    const lifetimes = new Float32Array(particleCount)

    // 初始化粒子属性
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3

      // 位置
      positions[i3] = position.x
      positions[i3 + 1] = position.y
      positions[i3 + 2] = position.z

      // 速度（球形扩散）
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const speedFactor = speed * (0.5 + Math.random() * 0.5)
      
      velocities[i3] = Math.sin(phi) * Math.cos(theta) * speedFactor * spread
      velocities[i3 + 1] = Math.abs(Math.cos(phi)) * speedFactor // 向上偏移
      velocities[i3 + 2] = Math.sin(phi) * Math.sin(theta) * speedFactor * spread

      // 颜色（带一些随机变化）
      const colorObj = new THREE.Color(color)
      colors[i3] = colorObj.r * (0.8 + Math.random() * 0.4)
      colors[i3 + 1] = colorObj.g * (0.8 + Math.random() * 0.4)
      colors[i3 + 2] = colorObj.b * (0.8 + Math.random() * 0.4)

      // 大小
      sizes[i] = size * (0.5 + Math.random() * 1.5)

      // 生命周期
      lifetimes[i] = 0
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    geometry.setAttribute('lifetime', new THREE.BufferAttribute(lifetimes, 1))

    // 创建粒子材质
    const material = new THREE.PointsMaterial({
      size: size,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    })

    // 创建粒子系统
    const particleSystem = new THREE.Points(geometry, material)
    particleSystem.name = 'ParticleSplash'
    particleSystem.userData = {
      isParticleSplash: true,
      gravity,
      maxLifetime: lifetime,
      birthTime: Date.now()
    }

    this.scene.add(particleSystem)
    this.particleSystems.push(particleSystem)

    return particleSystem
  }

  /**
   * 更新所有粒子系统
   * @param {number} deltaTime - 时间增量（秒）
   */
  update(deltaTime) {
    const systemsToRemove = []

    this.particleSystems.forEach((system, index) => {
      const positions = system.geometry.attributes.position.array
      const velocities = system.geometry.attributes.velocity.array
      const lifetimes = system.geometry.attributes.lifetime.array
      const { gravity, maxLifetime } = system.userData

      let allDead = true

      // 更新每个粒子
      for (let i = 0; i < lifetimes.length; i++) {
        const i3 = i * 3

        // 更新生命周期
        lifetimes[i] += deltaTime

        if (lifetimes[i] < maxLifetime) {
          allDead = false

          // 更新位置
          positions[i3] += velocities[i3] * deltaTime
          positions[i3 + 1] += velocities[i3 + 1] * deltaTime
          positions[i3 + 2] += velocities[i3 + 2] * deltaTime

          // 应用重力
          velocities[i3 + 1] += gravity * deltaTime

          // 地面碰撞检测（简单反弹）
          if (positions[i3 + 1] < 0) {
            positions[i3 + 1] = 0
            velocities[i3 + 1] *= -0.3 // 反弹损失能量
          }

          // 根据生命周期调整透明度
          const lifeRatio = lifetimes[i] / maxLifetime
          system.material.opacity = Math.max(0, 0.8 * (1 - lifeRatio))
        }
      }

      // 标记需要更新
      system.geometry.attributes.position.needsUpdate = true
      system.geometry.attributes.velocity.needsUpdate = true

      // 如果所有粒子都死亡，标记为待移除
      if (allDead) {
        systemsToRemove.push(index)
      }
    })

    // 移除已完成的粒子系统
    systemsToRemove.reverse().forEach(index => {
      const system = this.particleSystems[index]
      this.scene.remove(system)
      system.geometry.dispose()
      system.material.dispose()
      this.particleSystems.splice(index, 1)
    })
  }

  /**
   * 清除所有粒子系统
   */
  clearAll() {
    this.particleSystems.forEach(system => {
      this.scene.remove(system)
      system.geometry.dispose()
      system.material.dispose()
    })
    this.particleSystems = []
  }

  /**
   * 获取当前活跃的粒子系统数量
   */
  getActiveCount() {
    return this.particleSystems.length
  }
}

/**
 * 预设泼溅效果
 */
export const SplashPresets = {
  // 水花泼溅
  water: {
    color: 0x4db8ff,
    particleCount: 800,
    size: 0.08,
    speed: 4,
    spread: 1.8,
    gravity: -12,
    lifetime: 1.5
  },

  // 火花泼溅
  fire: {
    color: 0xff6600,
    particleCount: 1000,
    size: 0.05,
    speed: 5,
    spread: 1.5,
    gravity: 2, // 向上漂浮
    lifetime: 1.0
  },

  // 烟雾泼溅
  smoke: {
    color: 0x888888,
    particleCount: 300,
    size: 0.3,
    speed: 1,
    spread: 2,
    gravity: 1, // 缓慢上升
    lifetime: 3.0
  },

  // 魔法泼溅
  magic: {
    color: 0xff00ff,
    particleCount: 1200,
    size: 0.06,
    speed: 6,
    spread: 2.0,
    gravity: 0, // 无重力
    lifetime: 2.0
  },

  // 雪花泼溅
  snow: {
    color: 0xffffff,
    particleCount: 600,
    size: 0.1,
    speed: 2,
    spread: 2.5,
    gravity: -2, // 缓慢下落
    lifetime: 3.0
  }
}

