<template>
  <div class="viewport-gizmo-container">
    <!-- 导航立方体 -->
    <div class="viewport-gizmo" ref="viewCubeRef" :style="{ transform: cubeTransform }">
      <!-- 立方体面 -->
      <div
        class="gizmo-face front"
        :class="{ active: currentView === 'front', hover: hoveredFace === 'front' }"
        @click="setView('front', $event)"
        @mouseenter="hoveredFace = 'front'"
        @mouseleave="hoveredFace = ''"
      >
         <div class="face-label">前</div>
      </div>
      <div
        class="gizmo-face back"
        :class="{ active: currentView === 'back', hover: hoveredFace === 'back' }"
        @click="setView('back', $event)"
        @mouseenter="hoveredFace = 'back'"
        @mouseleave="hoveredFace = ''"
      >
         <div class="face-label">后</div>
      </div>
      <div
        class="gizmo-face right"
        :class="{ active: currentView === 'right', hover: hoveredFace === 'right' }"
        @click="setView('right', $event)"
        @mouseenter="hoveredFace = 'right'"
        @mouseleave="hoveredFace = ''"
      >
         <div class="face-label">右</div>
      </div>
      <div
        class="gizmo-face left"
        :class="{ active: currentView === 'left', hover: hoveredFace === 'left' }"
        @click="setView('left', $event)"
        @mouseenter="hoveredFace = 'left'"
        @mouseleave="hoveredFace = ''"
      >
         <div class="face-label">左</div>
      </div>
      <div
        class="gizmo-face top"
        :class="{ active: currentView === 'top', hover: hoveredFace === 'top' }"
        @click="setView('top', $event)"
        @mouseenter="hoveredFace = 'top'"
        @mouseleave="hoveredFace = ''"
      >
         <div class="face-label">上</div>
      </div>
      <div
        class="gizmo-face bottom"
        :class="{ active: currentView === 'bottom', hover: hoveredFace === 'bottom' }"
        @click="setView('bottom', $event)"
        @mouseenter="hoveredFace = 'bottom'"
        @mouseleave="hoveredFace = ''"
      >
         <div class="face-label">下</div>
      </div>

      <!-- 立方体边线 -->
      <div class="gizmo-edge front-right" @click.stop="setView('front-right', $event)" @mouseenter="hoveredEdge = 'front-right'" @mouseleave="hoveredEdge = ''" title="前右视角"></div>
      <div class="gizmo-edge front-left" @click.stop="setView('front-left', $event)" @mouseenter="hoveredEdge = 'front-left'" @mouseleave="hoveredEdge = ''" title="前左视角"></div>
      <div class="gizmo-edge front-top" @click.stop="setView('front-top', $event)" @mouseenter="hoveredEdge = 'front-top'" @mouseleave="hoveredEdge = ''" title="前上视角"></div>
      <div class="gizmo-edge front-bottom" @click.stop="setView('front-bottom', $event)" @mouseenter="hoveredEdge = 'front-bottom'" @mouseleave="hoveredEdge = ''" title="前下视角"></div>

      <div class="gizmo-edge back-right" @click.stop="setView('back-right', $event)" @mouseenter="hoveredEdge = 'back-right'" @mouseleave="hoveredEdge = ''" title="后右视角"></div>
      <div class="gizmo-edge back-left" @click.stop="setView('back-left', $event)" @mouseenter="hoveredEdge = 'back-left'" @mouseleave="hoveredEdge = ''" title="后左视角"></div>
      <div class="gizmo-edge back-top" @click.stop="setView('back-top', $event)" @mouseenter="hoveredEdge = 'back-top'" @mouseleave="hoveredEdge = ''" title="后上视角"></div>
      <div class="gizmo-edge back-bottom" @click.stop="setView('back-bottom', $event)" @mouseenter="hoveredEdge = 'back-bottom'" @mouseleave="hoveredEdge = ''" title="后下视角"></div>

      <div class="gizmo-edge right-top" @click.stop="setView('right-top', $event)" @mouseenter="hoveredEdge = 'right-top'" @mouseleave="hoveredEdge = ''" title="右上视角"></div>
      <div class="gizmo-edge right-bottom" @click.stop="setView('right-bottom', $event)" @mouseenter="hoveredEdge = 'right-bottom'" @mouseleave="hoveredEdge = ''" title="右下视角"></div>
      <div class="gizmo-edge left-top" @click.stop="setView('left-top', $event)" @mouseenter="hoveredEdge = 'left-top'" @mouseleave="hoveredEdge = ''" title="左上视角"></div>
      <div class="gizmo-edge left-bottom" @click.stop="setView('left-bottom', $event)" @mouseenter="hoveredEdge = 'left-bottom'" @mouseleave="hoveredEdge = ''" title="左下视角"></div>

      <!-- 立方体角点 -->
      <div class="gizmo-corner front-right-top" @click.stop="setView('front-right-top', $event)" @mouseenter="hoveredCorner = 'front-right-top'" @mouseleave="hoveredCorner = ''" title="前右上视角"></div>
      <div class="gizmo-corner front-right-bottom" @click.stop="setView('front-right-bottom', $event)" @mouseenter="hoveredCorner = 'front-right-bottom'" @mouseleave="hoveredCorner = ''" title="前右下视角"></div>
      <div class="gizmo-corner front-left-top" @click.stop="setView('front-left-top', $event)" @mouseenter="hoveredCorner = 'front-left-top'" @mouseleave="hoveredCorner = ''" title="前左上视角"></div>
      <div class="gizmo-corner front-left-bottom" @click.stop="setView('front-left-bottom', $event)" @mouseenter="hoveredCorner = 'front-left-bottom'" @mouseleave="hoveredCorner = ''" title="前左下视角"></div>

      <div class="gizmo-corner back-right-top" @click.stop="setView('back-right-top', $event)" @mouseenter="hoveredCorner = 'back-right-top'" @mouseleave="hoveredCorner = ''" title="后右上视角"></div>
      <div class="gizmo-corner back-right-bottom" @click.stop="setView('back-right-bottom', $event)" @mouseenter="hoveredCorner = 'back-right-bottom'" @mouseleave="hoveredCorner = ''" title="后右下视角"></div>
      <div class="gizmo-corner back-left-top" @click.stop="setView('back-left-top', $event)" @mouseenter="hoveredCorner = 'back-left-top'" @mouseleave="hoveredCorner = ''" title="后左上视角"></div>
      <div class="gizmo-corner back-left-bottom" @click.stop="setView('back-left-bottom', $event)" @mouseenter="hoveredCorner = 'back-left-bottom'" @mouseleave="hoveredCorner = ''" title="后左下视角"></div>
    </div>

    <!-- 中心圆点 -->
    <div class="gizmo-center" @click="setView('home', $event)" title="回到默认视角">
      <div class="center-dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

const props = defineProps<{
  camera?: any
  target?: any
  duration?: number
}>()

const emit = defineEmits<{
  viewChange: [viewType: string, cameraPosition: any, cameraTarget: any]
}>()

const viewCubeRef = ref<HTMLElement>()
const currentView = ref('perspective')
const isAnimating = ref(false)
const lastClickTime = ref(0) // 记录上次点击时间

// 悬停状态管理
const hoveredFace = ref('')
const hoveredEdge = ref('')
const hoveredCorner = ref('')

// 相机跟随相关
const cameraRotation = ref({ x: 0, y: 0, z: 0 })
const cubeRotation = ref({ x: -15, y: 45, z: 0 })

// 计算立方体变换
const cubeTransform = computed(() => {
  const { x, y, z } = cubeRotation.value
  return `rotateX(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`
})

// 视角定义
const viewDefinitions = {
  // 默认视角
  home: { position: [8, 6, 8], target: [0, 0, 0] },

  // 基本视角
  front: { position: [0, 0, 10], target: [0, 0, 0] },
  back: { position: [0, 0, -10], target: [0, 0, 0] },
  right: { position: [10, 0, 0], target: [0, 0, 0] },
  left: { position: [-10, 0, 0], target: [0, 0, 0] },
  top: { position: [0, 10, 0], target: [0, 0, 0] },
  bottom: { position: [0, -10, 0], target: [0, 0, 0] },

  // 边视角
  'front-right': { position: [7, 0, 7], target: [0, 0, 0] },
  'front-left': { position: [-7, 0, 7], target: [0, 0, 0] },
  'front-top': { position: [0, 7, 7], target: [0, 0, 0] },
  'front-bottom': { position: [0, -7, 7], target: [0, 0, 0] },
  'back-right': { position: [7, 0, -7], target: [0, 0, 0] },
  'back-left': { position: [-7, 0, -7], target: [0, 0, 0] },
  'back-top': { position: [0, 7, -7], target: [0, 0, 0] },
  'back-bottom': { position: [0, -7, -7], target: [0, 0, 0] },
  'right-top': { position: [7, 7, 0], target: [0, 0, 0] },
  'right-bottom': { position: [7, -7, 0], target: [0, 0, 0] },
  'left-top': { position: [-7, 7, 0], target: [0, 0, 0] },
  'left-bottom': { position: [-7, -7, 0], target: [0, 0, 0] },

  // 角视角
  'front-right-top': { position: [5.8, 5.8, 5.8], target: [0, 0, 0] },
  'front-right-bottom': { position: [5.8, -5.8, 5.8], target: [0, 0, 0] },
  'front-left-top': { position: [-5.8, 5.8, 5.8], target: [0, 0, 0] },
  'front-left-bottom': { position: [-5.8, -5.8, 5.8], target: [0, 0, 0] },
  'back-right-top': { position: [5.8, 5.8, -5.8], target: [0, 0, 0] },
  'back-right-bottom': { position: [5.8, -5.8, -5.8], target: [0, 0, 0] },
  'back-left-top': { position: [-5.8, 5.8, -5.8], target: [0, 0, 0] },
  'back-left-bottom': { position: [-5.8, -5.8, -5.8], target: [0, 0, 0] }
}

// 检测当前视角
const detectCurrentView = () => {
  if (!props.camera) return 'perspective'

  const camera = props.camera
  const position = camera.position
  const target = props.target || { x: 0, y: 0, z: 0 }

  // 计算相机方向向量
  const direction = {
    x: target.x - position.x,
    y: target.y - position.y,
    z: target.z - position.z
  }

  // 标准化方向向量
  const length = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2)
  if (length === 0) return 'perspective'

  const normalized = {
    x: direction.x / length,
    y: direction.y / length,
    z: direction.z / length
  }

  // 根据方向向量判断视角
  const threshold = 0.7 // 阈值，用于判断是否接近某个标准方向

  if (Math.abs(normalized.z) > threshold && normalized.z > 0) return 'front'
  if (Math.abs(normalized.z) > threshold && normalized.z < 0) return 'back'
  if (Math.abs(normalized.x) > threshold && normalized.x > 0) return 'right'
  if (Math.abs(normalized.x) > threshold && normalized.x < 0) return 'left'
  if (Math.abs(normalized.y) > threshold && normalized.y > 0) return 'top'
  if (Math.abs(normalized.y) > threshold && normalized.y < 0) return 'bottom'

  // 检查组合视角
  if (Math.abs(normalized.x) > 0.5 && Math.abs(normalized.z) > 0.5) {
    if (normalized.x > 0 && normalized.z > 0) return 'front-right'
    if (normalized.x < 0 && normalized.z > 0) return 'front-left'
    if (normalized.x > 0 && normalized.z < 0) return 'back-right'
    if (normalized.x < 0 && normalized.z < 0) return 'back-left'
  }

  if (Math.abs(normalized.y) > 0.5 && Math.abs(normalized.z) > 0.5) {
    if (normalized.y > 0 && normalized.z > 0) return 'front-top'
    if (normalized.y < 0 && normalized.z > 0) return 'front-bottom'
    if (normalized.y > 0 && normalized.z < 0) return 'back-top'
    if (normalized.y < 0 && normalized.z < 0) return 'back-bottom'
  }

  return 'perspective'
}

// 更新立方体旋转以跟随相机（只在非动画状态下）
const updateCubeRotation = () => {
  if (!props.camera || isAnimating.value) return

  const camera = props.camera
  const position = camera.position
  const target = props.target || { x: 0, y: 0, z: 0 }

  // 计算相机相对于目标的角度
  const dx = position.x - target.x
  const dy = position.y - target.y
  const dz = position.z - target.z

  // 计算Y轴旋转（水平角度）
  const yRotation = Math.atan2(dx, dz) * (180 / Math.PI)

  // 计算X轴旋转（垂直角度）
  const distance = Math.sqrt(dx * dx + dz * dz)
  const xRotation = -Math.atan2(dy, distance) * (180 / Math.PI)

  // 更新立方体旋转，但保持一定的偏移以保持可读性
  // 只有在相机角度发生显著变化时才更新，避免频繁更新
  const newRotation = {
    x: xRotation * 0.1 - 15, // 进一步减少跟随幅度，避免与手动点击冲突
    y: yRotation * 0.1 + 45,
    z: 0
  }

  // 只有角度差异较大时才更新，并且不在手动点击后的短时间内更新
  const angleDiff = Math.abs(newRotation.x - cubeRotation.value.x) +
                   Math.abs(newRotation.y - cubeRotation.value.y)

  const timeSinceLastClick = Date.now() - lastClickTime.value

  if (angleDiff > 10 && timeSinceLastClick > 2000) { // 增加角度阈值，延长禁用时间
    cubeRotation.value = newRotation
  }
}

// 设置视角
const setView = (viewType: string, event?: Event) => {
  console.log('=== ViewCube点击事件 ===')
  console.log('点击类型:', viewType)
  console.log('事件对象:', event)
  console.log('当前动画状态:', isAnimating.value)
  console.log('相机状态:', !!props.camera)
  console.log('当前视角:', currentView.value)

  // 阻止事件冒泡
  if (event) {
    event.preventDefault()
    event.stopPropagation()
  }

  // 防抖检查 - 避免快速连续点击
  const now = Date.now()
  if (now - lastClickTime.value < 200) { // 200ms内只允许一次点击
    console.log('❌ 点击过于频繁，忽略')
    return false
  }
  lastClickTime.value = now

  // 检查动画状态
  if (isAnimating.value) {
    console.log('❌ 正在动画中，忽略点击')
    return false
  }

  // 检查相机状态
  if (!props.camera) {
    console.log('❌ 相机未准备好')
    return false
  }

  // 检查视角定义
  const viewDef = viewDefinitions[viewType]
  if (!viewDef) {
    console.log('❌ 未找到视角定义:', viewType)
    return false
  }

  console.log('✅ 开始切换视角:', viewType, viewDef)

  // 设置动画状态
  isAnimating.value = true
  currentView.value = viewType

  // 计算骰子应该旋转到的角度
  const targetRotation = getCubeRotationForView(viewType)
  console.log('目标旋转角度:', targetRotation)

  // 触发视角变化事件
  emit('viewChange', viewType, viewDef.position, viewDef.target)

  // 同时旋转骰子到对应方向
  animateCubeRotation(targetRotation)

  // 动画完成后重置状态，延长动画时间确保完全完成
  setTimeout(() => {
    isAnimating.value = false
    console.log('✅ 视角切换动画完成')
  }, (props.duration || 1000) + 500) // 额外增加500ms缓冲时间

  return true
}

// 根据视角类型获取骰子应该旋转到的角度
const getCubeRotationForView = (viewType: string) => {
  const rotations: Record<string, { x: number; y: number; z: number }> = {
    // 默认视角
    home: { x: -30, y: 45, z: 0 },

    // 基本视角
    front: { x: -15, y: 0, z: 0 },
    back: { x: -15, y: 180, z: 0 },
    right: { x: -15, y: 90, z: 0 },
    left: { x: -15, y: -90, z: 0 },
    top: { x: -90, y: 45, z: 0 },
    bottom: { x: 90, y: 45, z: 0 },

    // 边视角
    'front-right': { x: -15, y: 45, z: 0 },
    'front-left': { x: -15, y: -45, z: 0 },
    'front-top': { x: -45, y: 0, z: 0 },
    'front-bottom': { x: 15, y: 0, z: 0 },
    'back-right': { x: -15, y: 135, z: 0 },
    'back-left': { x: -15, y: -135, z: 0 },
    'back-top': { x: -45, y: 180, z: 0 },
    'back-bottom': { x: 15, y: 180, z: 0 },
    'right-top': { x: -45, y: 90, z: 0 },
    'right-bottom': { x: 15, y: 90, z: 0 },
    'left-top': { x: -45, y: -90, z: 0 },
    'left-bottom': { x: 15, y: -90, z: 0 },

    // 角视角
    'front-right-top': { x: -45, y: 45, z: 0 },
    'front-right-bottom': { x: 15, y: 45, z: 0 },
    'front-left-top': { x: -45, y: -45, z: 0 },
    'front-left-bottom': { x: 15, y: -45, z: 0 },
    'back-right-top': { x: -45, y: 135, z: 0 },
    'back-right-bottom': { x: 15, y: 135, z: 0 },
    'back-left-top': { x: -45, y: -135, z: 0 },
    'back-left-bottom': { x: 15, y: -135, z: 0 }
  }

  return rotations[viewType] || { x: -15, y: 45, z: 0 }
}

// 动画旋转骰子到目标角度
const animateCubeRotation = (targetRotation: { x: number; y: number; z: number }) => {
  const startRotation = { ...cubeRotation.value }
  const duration = props.duration || 1000 // 与相机动画时间同步
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic

    // 插值旋转角度
    cubeRotation.value = {
      x: startRotation.x + (targetRotation.x - startRotation.x) * easeProgress,
      y: startRotation.y + (targetRotation.y - startRotation.y) * easeProgress,
      z: startRotation.z + (targetRotation.z - startRotation.z) * easeProgress
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      console.log('骰子旋转完成，最终角度:', cubeRotation.value)
    }
  }

  animate()
}

// 悬停效果 - 已移至响应式状态管理
// 旧的悬停函数已删除，现在使用 hoveredFace, hoveredEdge, hoveredCorner 响应式变量

// 悬停状态管理 - 使用响应式变量，无调试日志

// 监听相机变化
watch(() => props.camera, (newCamera) => {
  if (newCamera) {
    updateCubeRotation()
    currentView.value = detectCurrentView()
  }
}, { immediate: true })

watch(() => props.target, () => {
  if (props.camera) {
    updateCubeRotation()
    currentView.value = detectCurrentView()
  }
}, { immediate: true })

// 定期更新立方体状态
let updateInterval: number | null = null
let lastCameraPosition = { x: 0, y: 0, z: 0 }
let lastCameraTarget = { x: 0, y: 0, z: 0 }

onMounted(() => {
  console.log('ViewCube组件已挂载')

  // 降低更新频率，避免闪烁
  updateInterval = window.setInterval(() => {
    if (props.camera && !isAnimating.value) {
      const currentPos = props.camera.position
      const currentTarget = props.target || { x: 0, y: 0, z: 0 }

      // 只有相机位置或目标发生显著变化时才更新
      const posChanged = Math.abs(currentPos.x - lastCameraPosition.x) > 0.1 ||
                        Math.abs(currentPos.y - lastCameraPosition.y) > 0.1 ||
                        Math.abs(currentPos.z - lastCameraPosition.z) > 0.1

      const targetChanged = Math.abs(currentTarget.x - lastCameraTarget.x) > 0.1 ||
                           Math.abs(currentTarget.y - lastCameraTarget.y) > 0.1 ||
                           Math.abs(currentTarget.z - lastCameraTarget.z) > 0.1

      if (posChanged || targetChanged) {
        // 只在非动画状态下更新立方体旋转
        if (!isAnimating.value) {
          updateCubeRotation()
        }

        const detectedView = detectCurrentView()
        if (detectedView !== currentView.value && !isAnimating.value) {
          currentView.value = detectedView
        }

        // 更新记录的位置
        lastCameraPosition = { x: currentPos.x, y: currentPos.y, z: currentPos.z }
        lastCameraTarget = { x: currentTarget.x, y: currentTarget.y, z: currentTarget.z }
      }
    }
  }, 300) // 增加到300ms，减少更新频率
})

onUnmounted(() => {
  console.log('ViewCube组件已卸载')
  if (updateInterval) {
    clearInterval(updateInterval)
  }
})
</script>

<style scoped lang="scss">
// 专业ViewportGizmo容器样式
.viewport-gizmo-container {
  position: absolute;
  right: 300px;
  top: 100px;
  width: 140px;
  height: 140px;
  perspective: 1200px;
  z-index: 1000;
  user-select: none;
}

// 导航立方体主体
.viewport-gizmo {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

// 立方体面 - 专业设计
.gizmo-face {
  position: absolute;
  width: 70px;
  height: 70px;
  top: 0px;
  left: 0px;
  background: rgba(60, 60, 60, 0.8); // 半透明深灰色
  border: 2px solid rgba(100, 100, 100, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
  z-index: 5;
  backdrop-filter: blur(2px);

  .face-label {
    color: #ffffff;
    font-size: 28px;
    font-weight: bold;
    font-family: 'Arial', sans-serif;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
    pointer-events: none;
    letter-spacing: 0.5px;
  }

  &.active {
    background: rgba(0, 122, 204, 0.8);
    border-color: rgba(0, 122, 204, 1);
  }

  &.hover {
    background: rgba(100, 100, 100, 0.9);
    border-color: rgba(140, 140, 140, 0.8);
  }
}

// 立方体边线 - 专业线条设计
.gizmo-edge {
  position: absolute;
  background: rgba(255, 255, 255, 0.8); // 半透明白色线条
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease; // 过渡背景色和阴影
  z-index: 10;

  // 增加点击区域
  &::before {
    content: '';
    position: absolute;
    top: -3px;
    left: -3px;
    right: -3px;
    bottom: -3px;
    background: transparent;
    z-index: -1;
  }

  &:hover {
    background: rgba(0, 150, 255, 1); // 悬停时变为亮蓝色
    box-shadow: 0 0 8px rgba(0, 150, 255, 0.6); // 添加发光效果
  }

  &:active {
    background: rgba(0, 100, 200, 1);
    box-shadow: 0 0 12px rgba(0, 100, 200, 0.8);
  }
}

// 立方体角点 - 专业圆点设计
.gizmo-corner {
  position: absolute;
  background: rgba(255, 255, 255, 0.9); // 半透明白色圆点
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease, box-shadow 0.2s ease; // 过渡背景色和阴影
  z-index: 15;

  // 增加点击区域
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    left: -6px;
    right: -6px;
    bottom: -6px;
    background: transparent;
    border-radius: 50%;
    z-index: -1;
  }

  &:hover {
    background: rgba(0, 150, 255, 1); // 悬停时变为亮蓝色
    box-shadow: 0 0 10px rgba(0, 150, 255, 0.8); // 添加发光效果
  }

  &:active {
    background: rgba(0, 100, 200, 1);
    box-shadow: 0 0 15px rgba(0, 100, 200, 1);
  }
}

// 中心圆点
.gizmo-center {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  transform: translate(-50%, -50%);
  z-index: 20;
  cursor: pointer;

  .center-dot {
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    transition: background 0.2s ease; // 只过渡背景色
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  }

  &:hover .center-dot {
    background: rgba(0, 150, 255, 1);
    box-shadow: 0 0 12px rgba(0, 150, 255, 0.8);
  }
}

// 面的位置 - 专业尺寸
.front {
  transform: rotateY(0deg) translateZ(35px);
}

.back {
  transform: rotateY(180deg) translateZ(35px);
}

.right {
  transform: rotateY(90deg) translateZ(35px);
}

.left {
  transform: rotateY(-90deg) translateZ(35px);
}

.top {
  transform: rotateX(90deg) translateZ(35px);
}

.bottom {
  transform: rotateX(-90deg) translateZ(35px);
}

// 边的位置和尺寸 - 精确贴合立方体边缘
.front-right {
  width: 4px;
  height: 70px;
  top: 0px;
  left: 33px;
  transform: translateX(35px) translateZ(35px);
}

.front-left {
  width: 4px;
  height: 70px;
  top: 0px;
  left: 33px;
  transform: translateX(-35px) translateZ(35px);
}

.front-top {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: translateY(-35px) translateZ(35px);
}

.front-bottom {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: translateY(35px) translateZ(35px);
}

.back-right {
  width: 4px;
  height: 70px;
  top: 0px;
  left: 33px;
  transform: rotateY(180deg) translateX(35px) translateZ(35px);
}

.back-left {
  width: 4px;
  height: 70px;
  top: 0px;
  left: 33px;
  transform: rotateY(180deg) translateX(-35px) translateZ(35px);
}

.back-top {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: rotateY(180deg) translateY(-35px) translateZ(35px);
}

.back-bottom {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: rotateY(180deg) translateY(35px) translateZ(35px);
}

.right-top {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: rotateY(90deg) translateY(-35px) translateZ(35px);
}

.right-bottom {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: rotateY(90deg) translateY(35px) translateZ(35px);
}

.left-top {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: rotateY(-90deg) translateY(-35px) translateZ(35px);
}

.left-bottom {
  width: 70px;
  height: 4px;
  top: 33px;
  left: 0px;
  transform: rotateY(-90deg) translateY(35px) translateZ(35px);
}

// 角的位置和尺寸 - 精确贴合立方体顶点
.front-right-top {
  width: 6px;
  height: 6px;
  top: -3px;
  left: 32px;
  transform: translateZ(35px);
}

.front-right-bottom {
  width: 6px;
  height: 6px;
  top: 32px;
  left: 32px;
  transform: translateZ(35px);
}

.front-left-top {
  width: 6px;
  height: 6px;
  top: -3px;
  left: -3px;
  transform: translateZ(35px);
}

.front-left-bottom {
  width: 6px;
  height: 6px;
  top: 32px;
  left: -3px;
  transform: translateZ(35px);
}

.back-right-top {
  width: 6px;
  height: 6px;
  top: -3px;
  left: 32px;
  transform: translateZ(-35px);
}

.back-right-bottom {
  width: 6px;
  height: 6px;
  top: 32px;
  left: 32px;
  transform: translateZ(-35px);
}

.back-left-top {
  width: 6px;
  height: 6px;
  top: -3px;
  left: -3px;
  transform: translateZ(-35px);
}

.back-left-bottom {
  width: 6px;
  height: 6px;
  top: 32px;
  left: -3px;
  transform: translateZ(-35px);
}

// 移除旧的悬停高亮效果，使用新的设计

// 动画关键帧
@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes glow {
  0% {
    box-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
  }
  50% {
    box-shadow: 0 0 12px rgba(0, 255, 136, 0.9);
  }
  100% {
    box-shadow: 0 0 6px rgba(0, 255, 136, 0.6);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .view-cube-container {
    top: 10px;
    right: 10px;
  }

  .view-cube {
    width: 80px;
    height: 80px;
  }

  .cube-face {
    width: 40px;
    height: 40px;
    font-size: 12px;

    .face-indicator {
      width: 6px;
      height: 6px;
      top: 2px;
      right: 2px;
    }
  }

  .cube-edge {
    &.front-right, &.front-left, &.back-right, &.back-left {
      width: 1px;
      height: 40px;
    }

    &.front-top, &.front-bottom, &.back-top, &.back-bottom,
    &.right-top, &.right-bottom, &.left-top, &.left-bottom {
      width: 40px;
      height: 1px;
    }
  }

  .cube-corner {
    width: 3px;
    height: 3px;
  }
}
</style>
