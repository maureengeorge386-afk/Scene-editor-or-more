<template>
  <div class="three-editor">
    <div class="editor-container">
      <!-- 左侧工具栏 -->
      <Toolbar
        :activeTool="activeTool"
        :activeGeometry="activeGeometry"
        :activeMaterial="activeMaterial"
        :showIcons="showIcons"
        :isKeyboardEnabled="isKeyboardEnabled"
        @tool-change="handleToolChange"
        @geometry-change="handleGeometryChange"
        @material-change="handleMaterialChange"
        @clear-scene="clearScene"
        @reset-camera="resetCamera"
        @toggle-grid-axes="toggleGridAxes"
        @import-files="handleImportFiles"
        @show-import-panel="handleShowImportPanel"
        @show-builtin-models="handleShowBuiltinModels"
        @load-builtin-model="handleLoadBuiltinModel"
        @copy-object="handleCopyObject"
        @show-object-list="handleShowObjectList"
        @toggle-icons="handleToggleIcons"
        @export-zip="handleExportZip"
        @import-zip="handleImportZip"
        @open-camera-tour="handleOpenCameraTour"
        @toggle-keyboard-control="handleToggleKeyboardControl"
        @open-light-config="handleOpenLightConfig"
        @open-skybox-config="handleOpenSkyboxConfig"
        @change-shadow-type="handleChangeShadowType"
        @apply-shadow-preset="handleApplyShadowPreset"
        @load-ferrari-model="handleLoadFerrariModel"
        @load-gaussian-splat="handleLoadGaussianSplat"
        @create-particle-splash="handleCreateParticleSplash"
      />

      <!-- 右侧场景视图 -->
      <SceneViewer
        ref="sceneViewer"
        :activeTool="activeTool"
        :activeGeometry="activeGeometry"
        :activeMaterial="activeMaterial"
        :showIcons="showIcons"
        @object-selected="handleObjectSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Toolbar from './components/Toolbar/index.vue'
import SceneViewer from './components/SceneViewer/index.vue'

// 当前激活的工具
const activeTool = ref('select') // 选择工具和移动工具
const activeGeometry = ref('') // cube, sphere, cylinder, cone, plane
const activeMaterial = ref('basic') // basic, standard, phong, lambert
const showIcons = ref(false) // 图标显示状态

// 场景视图引用
const sceneViewer = ref()

// 处理工具切换（选择工具和移动工具）
const handleToolChange = (tool: string) => {
  activeTool.value = tool
  activeGeometry.value = ''
}

// 处理几何体选择
const handleGeometryChange = (geometry: string) => {
  activeGeometry.value = geometry
  activeTool.value = 'select'
}

// 处理材质选择
const handleMaterialChange = (material: string) => {
  activeMaterial.value = material
}

// 处理对象选择
const handleObjectSelected = (object: any) => {
  console.log('Selected object:', object)
}

// 清空场景
const clearScene = () => {
  sceneViewer.value?.clearScene()
}

// 重置相机
const resetCamera = () => {
  sceneViewer.value?.resetCamera()
}

// 切换网格坐标轴显示
const toggleGridAxes = () => {
  sceneViewer.value?.toggleGridAxes()
}

// 处理文件导入
const handleImportFiles = (files: File[]) => {
  // 将文件传递给SceneViewer组件
  if (sceneViewer.value) {
    // 直接调用SceneViewer的导入方法
    files.forEach(file => {
      console.log('导入文件:', file.name)
      // 调用SceneViewer的导入方法
      sceneViewer.value.importModel(file)
    })
  }
}

// 显示导入面板
const handleShowImportPanel = () => {
  if (sceneViewer.value) {
    sceneViewer.value.toggleImportPanel()
  }
}

// 显示内置模型面板
const handleShowBuiltinModels = () => {
  if (sceneViewer.value) {
    sceneViewer.value.toggleBuiltinModelsPanel()
  }
}



// 加载内置模型
const handleLoadBuiltinModel = (model: any) => {
  if (sceneViewer.value) {
    sceneViewer.value.loadBuiltinModel(model)
  }
}

// 复制对象
const handleCopyObject = () => {
  if (sceneViewer.value) {
    sceneViewer.value.duplicateObject()
  }
}

// 处理显示对象列表
const handleShowObjectList = () => {
  if (sceneViewer.value) {
    sceneViewer.value.showObjectList()
  }
}

// 切换图标显示
const handleToggleIcons = (iconState: boolean) => {
  showIcons.value = iconState
  console.log('图标显示状态:', iconState ? '显示' : '隐藏')
}

// 导出ZIP包
const handleExportZip = () => {
  if (sceneViewer.value) {
    sceneViewer.value.exportSceneAsZip()
  }
}

// 导入ZIP包
const handleImportZip = () => {
  if (sceneViewer.value) {
    // 触发文件选择，只选择ZIP文件
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.zip'
    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement
      if (target.files && target.files.length > 0) {
        const file = target.files[0]
        await sceneViewer.value.importSceneFromZip(file)
      }
    }
    input.click()
  }
}

// 打开漫游配置
const handleOpenCameraTour = () => {
  if (sceneViewer.value) {
    sceneViewer.value.openCameraTourDialog()
  }
}

// 键盘控制状态
const isKeyboardEnabled = ref(true)

// 切换键盘控制
const handleToggleKeyboardControl = () => {
  if (sceneViewer.value) {
    sceneViewer.value.toggleKeyboardControl()
    // 同步状态
    isKeyboardEnabled.value = sceneViewer.value.isKeyboardEnabled?.value ?? true
  }
}

// 监听键盘控制状态变化
watch(() => sceneViewer.value?.isKeyboardEnabled, (newVal) => {
  if (newVal !== undefined) {
    isKeyboardEnabled.value = newVal.value
  }
}, { immediate: true })

// 打开光源配置
const handleOpenLightConfig = () => {
  if (sceneViewer.value) {
    sceneViewer.value.openLightConfigDialog()
  }
}

// 打开天空外景配置
const handleOpenSkyboxConfig = () => {
  if (sceneViewer.value) {
    sceneViewer.value.openSkyboxConfigDialog()
  }
}

// 加载法拉利模型
const handleLoadFerrariModel = () => {
  if (sceneViewer.value) {
    // 创建法拉利模型对象
    const ferrariModel = {
      id: 'demo-3',
      name: '法拉利',
      path: '/model/法拉利.glb',
      format: 'glb',
      icon: '🏎️',
      category: '演示模型'
    }
    // 加载法拉利模型并启动组装动画
    sceneViewer.value.loadFerrariWithAssemblyAnimation(ferrariModel)
  }
}

// 阴影模式切换
const handleChangeShadowType = (shadowType: string) => {
  sceneViewer.value?.setShadowType(shadowType)
}

// 阴影预设应用
const handleApplyShadowPreset = (preset: 'performance' | 'quality') => {
  sceneViewer.value?.applyShadowPreset(preset)
}

// 加载高斯泼溅模型
const handleLoadGaussianSplat = () => {
  if (sceneViewer.value) {
    sceneViewer.value.loadGaussianSplatModel()
  }
}

// 创建粒子泼溅效果
const handleCreateParticleSplash = () => {
  if (sceneViewer.value) {
    sceneViewer.value.createParticleSplashEffect()
  }
}

</script>

<style lang="scss">
@import './index.scss';
</style>

