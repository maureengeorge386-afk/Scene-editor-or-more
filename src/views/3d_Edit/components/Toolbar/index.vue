<template>
  <div class="toolbar">
    <!-- 自定义提示框 -->
    <div
        v-if="showTooltip"
        class="custom-tooltip"
        :style="{ left: tooltipPosition.x + 'px', top: tooltipPosition.y + 'px' }"
    >
      <div class="tooltip-title">{{ tooltipData.title }}</div>
      <div class="tooltip-description">{{ tooltipData.description }}</div>
      <div class="tooltip-usage">{{ tooltipData.usage }}</div>
      <div class="tooltip-tip" v-if="tooltipData.tip">{{ tooltipData.tip }}</div>
    </div>

    <div class="toolbar-section">
      <h3><span v-if="showIcons">🛠️ </span>工具操作</h3>
      <div class="tool-grid">
        <button
            class="tool-btn"
            :class="{ active: activeTool === 'select' }"
            @click="$emit('tool-change', 'select')"
            @mouseenter="showTooltipFor('select', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🖱️ </span>选择
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeTool === 'move' }"
            @click="$emit('tool-change', 'move')"
            @mouseenter="showTooltipFor('move', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🚚 </span>移动
        </button>
        <button
            class="tool-btn"
            @click="$emit('copy-object')"
            @mouseenter="showTooltipFor('copy', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📋 </span>复制
        </button>
        <button
            class="tool-btn"
            @click="$emit('show-object-list')"
            @mouseenter="showTooltipFor('object-list', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📋 </span>对象列表
        </button>
        <button
            class="tool-btn"
            :class="{ active: showIcons }"
            @click="toggleIcons"
            @mouseenter="showTooltipFor('toggle-icons', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">👁️ </span>{{ showIcons ? '隐藏图标' : '显示图标' }}
        </button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3><span v-if="showIcons">🚗 </span>模型拆解演示</h3>
      <div class="tool-grid">
        <button
            class="tool-btn"
            @click="$emit('load-ferrari-model')"
            @mouseenter="showTooltipFor('ferrari-demo', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🏎️ </span>法拉利组装
        </button>
        <button class="tool-btn">城市建设组装x</button>
        <button class="tool-btn">骨骼模型手势x</button>
        <button class="tool-btn">骨骼模型追踪x</button>
        <button class="tool-btn">法拉利贴图X</button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3><span v-if="showIcons">📐 </span>场景添加几何体</h3>
      <div class="tool-grid">
        <button
            class="tool-btn"
            :class="{ active: activeGeometry === 'cube' }"
            @click="$emit('geometry-change', 'cube')"
            @mouseenter="showTooltipFor('cube', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📦 </span>立方体
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeGeometry === 'sphere' }"
            @click="$emit('geometry-change', 'sphere')"
            @mouseenter="showTooltipFor('sphere', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🔴 </span>球体
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeGeometry === 'cylinder' }"
            @click="$emit('geometry-change', 'cylinder')"
            @mouseenter="showTooltipFor('cylinder', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🪵 </span>圆柱体
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeGeometry === 'cone' }"
            @click="$emit('geometry-change', 'cone')"
            @mouseenter="showTooltipFor('cone', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🔺 </span>圆锥体
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeGeometry === 'plane' }"
            @click="$emit('geometry-change', 'plane')"
            @mouseenter="showTooltipFor('plane', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">⬜ </span>平面
        </button>
      </div>
    </div>

    <div class="toolbar-section">
      <h3><span v-if="showIcons">🎨 </span>几何体材质</h3>
      <div class="tool-grid">
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'basic' }"
            @click="$emit('material-change', 'basic')"
            @mouseenter="showTooltipFor('basic-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🎨 </span>基础材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'standard' }"
            @click="$emit('material-change', 'standard')"
            @mouseenter="showTooltipFor('standard-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🌟 </span>标准材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'phong' }"
            @click="$emit('material-change', 'phong')"
            @mouseenter="showTooltipFor('phong-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">💡 </span>Phong材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'lambert' }"
            @click="$emit('material-change', 'lambert')"
            @mouseenter="showTooltipFor('lambert-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">💎 </span>Lambert材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'toon' }"
            @click="$emit('material-change', 'toon')"
            @mouseenter="showTooltipFor('toon-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🎭 </span>卡通材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'normal' }"
            @click="$emit('material-change', 'normal')"
            @mouseenter="showTooltipFor('normal-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🌈 </span>法线材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'wireframe' }"
            @click="$emit('material-change', 'wireframe')"
            @mouseenter="showTooltipFor('wireframe-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🔲 </span>线框材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'mirror' }"
            @click="$emit('material-change', 'mirror')"
            @mouseenter="showTooltipFor('mirror-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🪞 </span>镜面材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'chrome' }"
            @click="$emit('material-change', 'chrome')"
            @mouseenter="showTooltipFor('chrome-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🔩 </span>铬合金材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'gold' }"
            @click="$emit('material-change', 'gold')"
            @mouseenter="showTooltipFor('gold-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🏆 </span>黄金材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'silver' }"
            @click="$emit('material-change', 'silver')"
            @mouseenter="showTooltipFor('silver-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🥈 </span>白银材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'copper' }"
            @click="$emit('material-change', 'copper')"
            @mouseenter="showTooltipFor('copper-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🪙 </span>铜质材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'glass' }"
            @click="$emit('material-change', 'glass')"
            @mouseenter="showTooltipFor('glass-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🍸 </span>玻璃材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'crystal' }"
            @click="$emit('material-change', 'crystal')"
            @mouseenter="showTooltipFor('crystal-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">💎 </span>水晶材质
        </button>
        <button
            class="tool-btn"
            :class="{ active: activeMaterial === 'physical' }"
            @click="$emit('material-change', 'physical')"
            @mouseenter="showTooltipFor('physical-material', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">⚡ </span>物理材质
        </button>
      </div>
    </div>


    <div class="toolbar-section">
      <h3><span v-if="showIcons">📁 </span>模型导入，布局备份</h3>
      <div class="tool-grid">
        <button
            class="tool-btn import-btn"
            @click="triggerFileInput"
            @mouseenter="showTooltipFor('import-file', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📁 </span>选择文件
        </button>
        <button
            class="tool-btn import-btn"
            @click="showImportPanel"
            @mouseenter="showTooltipFor('import-panel', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📋 </span>导入面板
        </button>
        <button
            class="tool-btn import-btn"
            @click="showBuiltinModels"
            @mouseenter="showTooltipFor('builtin-models', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📦 </span>内置模型
        </button>
        <button
            class="tool-btn import-btn"
            @click="$emit('export-zip')"
            @mouseenter="showTooltipFor('export-zip', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📦 </span>导出ZIP
        </button>
        <button
            class="tool-btn import-btn"
            @click="$emit('import-zip')"
            @mouseenter="showTooltipFor('import-zip', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📥 </span>导入ZIP
        </button>
      </div>

      <!-- 隐藏的文件输入 -->
      <input
          ref="fileInput"
          type="file"
          multiple
          accept=".gltf,.glb,.obj,.fbx,.stl,.dae,.3ds,.ply,.zip"
          @change="onFileSelect"
          style="display: none"
      />

    </div>

    <div class="toolbar-section">
      <h3><span v-if="showIcons">⚡ </span>其他操作</h3>
      <div class="tool-grid">
        <button
            class="tool-btn"
            @click="$emit('clear-scene')"
            @mouseenter="showTooltipFor('clear-scene', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🧹 </span>清空场景
        </button>
        <button
            class="tool-btn"
            @click="$emit('reset-camera')"
            @mouseenter="showTooltipFor('reset-camera', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📷 </span>重置相机
        </button>
        <button
            class="tool-btn"
            @click="$emit('toggle-grid-axes')"
            @mouseenter="showTooltipFor('toggle-grid-axes', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">📐 </span>网格坐标轴
        </button>
        <button
            class="tool-btn"
            @click="$emit('open-camera-tour')"
            @mouseenter="showTooltipFor('camera-tour', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🎬 </span>漫游配置
        </button>
        <button
            class="tool-btn"
            @click="$emit('open-light-config')"
            @mouseenter="showTooltipFor('light-config', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">💡 </span>光源配置
        </button>
        <button
            class="tool-btn"
            @click="$emit('open-skybox-config')"
            @mouseenter="showTooltipFor('skybox-config', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">🌌 </span>天空外景配置
        </button>
        <button
            class="tool-btn"
            :class="{ active: isKeyboardEnabled }"
            @click="$emit('toggle-keyboard-control')"
            @mouseenter="showTooltipFor('keyboard-control', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">⌨️ </span>{{ isKeyboardEnabled ? '键盘控制' : '键盘控制(已禁用)' }}
        </button>

        <button 
            class="tool-btn"
            @click="$emit('load-gaussian-splat')"
            @mouseenter="showTooltipFor('gaussian-splat', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">✨ </span>高斯泼溅模型
        </button>
        <button 
            class="tool-btn"
            @click="$emit('create-particle-splash')"
            @mouseenter="showTooltipFor('particle-splash', $event)"
            @mouseleave="hideTooltip"
        >
          <span v-if="showIcons">💧 </span>粒子泼溅效果
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive, computed, watch} from 'vue'

interface Props {
  activeTool: string
  activeGeometry: string
  activeMaterial: string
  cameraMode?: 'perspective' | 'orthographic'
  showIcons?: boolean
  isKeyboardEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showIcons: false,
  isKeyboardEnabled: true
})

const emit = defineEmits([
  'tool-change',
  'geometry-change',
  'material-change',
  'clear-scene',
  'reset-camera',
  'toggle-grid',
  'toggle-axes',
  'toggle-grid-axes',
  'import-files',
  'show-import-panel',
  'show-builtin-models',
  'load-builtin-model',
  'copy-object',
  'show-object-list',
  'toggle-icons',
  'load-gaussian-splat',
  'create-particle-splash',
  'export-zip',
  'load-ferrari-model',
  'import-zip',
  'open-camera-tour',
  'toggle-keyboard-control',
  'open-light-config',
  'open-skybox-config'
])

const fileInput = ref<HTMLInputElement>()

// 提示框状态
const showTooltip = ref(false)
const tooltipPosition = reactive({x: 0, y: 0})
const tooltipData = reactive({
  title: '',
  description: '',
  usage: '',
  tip: ''
})

// 使用 props 中的 showIcons，创建计算属性以便在模板中使用
const showIcons = computed(() => props.showIcons)
const isKeyboardEnabled = computed(() => props.isKeyboardEnabled ?? true)
const cameraMode = computed(() => props.cameraMode || 'perspective')

//（已移至 scene-info）


// 提示框数据配置
const tooltipConfig = {
  // 工具提示
  select: {
    title: '🖱️ 选择工具',
    description: '用于选择场景中的3D对象',
    usage: '点击场景中的对象进行选择，选中的对象会高亮显示',
    tip: '提示：选中的对象可以在属性编辑器中调整位置、旋转和缩放'
  },
  move: {
    title: '🚚 移动工具',
    description: '用于移动场景中的3D对象',
    usage: '选择对象后，拖拽鼠标在X轴和Z轴方向移动对象',
    tip: '提示：移动工具只能改变X轴和Z轴坐标，Y轴保持不变'
  },
  copy: {
    title: '📋 复制对象',
    description: '复制当前选中的对象',
    usage: '选中对象后点击此按钮进行复制',
    tip: '提示：复制的对象会出现在原对象附近'
  },
  'object-list': {
    title: '📋 对象列表',
    description: '显示场景中所有对象的列表',
    usage: '点击此按钮打开对象列表面板',
    tip: '提示：可以从列表中直接选择、聚焦或删除对象'
  },
  'toggle-icons': {
    title: '👁️ 切换图标显示',
    description: '显示或隐藏工具栏中的图标',
    usage: '点击切换所有工具按钮前的图标显示状态',
    tip: '提示：隐藏图标可以让工具栏更简洁，显示图标更直观'
  },
  'keyboard-control': {
    title: '⌨️ 键盘控制',
    description: '启用或禁用键盘控制对象移动',
    usage: '选择对象后，使用WASD或方向键移动对象',
    tip: '提示：W/↑向前，S/↓向后，A/←向左，D/→向右，Q向上，E向下'
  },
  'light-config': {
    title: '💡 光源配置',
    description: '配置场景中的光照效果',
    usage: '点击打开光源配置面板，调整环境光、方向光等参数',
    tip: '提示：可以调整光照强度、颜色、位置等参数来改变场景氛围'
  },
  'skybox-config': {
    title: '🌌 天空外景配置',
    description: '配置场景的背景天空盒',
    usage: '点击打开天空外景配置面板，选择不同的天空背景',
    tip: '提示：可以选择不同的天空盒纹理来改变场景背景'
  },
  'gaussian-splat': {
    title: '✨ 高斯泼溅模型',
    description: '加载 3D Gaussian Splatting 点云模型',
    usage: '点击选择 .ply 或 .splat 文件加载高斯泼溅场景',
    tip: '提示：支持神经辐射场重建的3D场景，可在场景信息面板调整点云渲染参数'
  },
  'particle-splash': {
    title: '💧 粒子泼溅效果',
    description: '在场景中创建粒子泼溅特效',
    usage: '点击在场景中心生成泼溅效果，可在场景信息面板选择预设',
    tip: '提示：支持水花、火花、烟雾、魔法、雪花等多种预设效果'
  },

  // 模型拆解演示提示
  'ferrari-demo': {
    title: '🏎️ 法拉利流水线组装',
    description: '模拟真实工厂流水线组装流程',
    usage: '点击加载法拉利模型，零件拆解到流水线，传送带运输，然后按工位顺序组装',
    tip: '提示：拆解到流水线→传送带运输→工位组装→完成，总时长约12秒'
  },

  // 几何体提示
  cube: {
    title: '📦 立方体',
    description: '创建立方体几何体',
    usage: '点击后在场景中创建默认大小的立方体',
    tip: '提示：创建后可以在属性面板中调整尺寸'
  },
  sphere: {
    title: '🔴 球体',
    description: '创建球体几何体',
    usage: '点击后在场景中创建默认大小的球体',
    tip: '提示：可以调整球体的半径和分段数'
  },
  cylinder: {
    title: '🪵 圆柱体',
    description: '创建圆柱体几何体',
    usage: '点击后在场景中创建默认大小的圆柱体',
    tip: '提示：可以调整圆柱体的半径、高度和分段数'
  },
  cone: {
    title: '🔺 圆锥体',
    description: '创建圆锥体几何体',
    usage: '点击后在场景中创建默认大小的圆锥体',
    tip: '提示：可以调整圆锥体的半径、高度和分段数'
  },
  plane: {
    title: '⬜ 平面',
    description: '创建平面几何体',
    usage: '点击后在场景中创建默认大小的平面',
    tip: '提示：平面常用于地面、墙壁等'
  },

  // 材质提示
  'basic-material': {
    title: '🎨 基础材质',
    description: '简单的单色材质，不受光照影响',
    usage: '适用于不需要光照效果的简单对象',
    tip: '提示：性能最好，适合大量对象'
  },
  'standard-material': {
    title: '🌟 标准材质',
    description: 'PBR物理渲染材质，支持光照和反射',
    usage: '适用于需要真实光照效果的对象',
    tip: '提示：效果最真实，但性能消耗较大'
  },
  'phong-material': {
    title: '💡 Phong材质',
    description: '高光反射材质，支持镜面反射',
    usage: '适用于需要高光效果的对象',
    tip: '提示：适合金属、塑料等材质'
  },
  'lambert-material': {
    title: '💎 Lambert材质',
    description: '漫反射材质，柔和的光照效果',
    usage: '适用于需要柔和光照的对象',
    tip: '提示：适合布料、木材等材质'
  },
  'toon-material': {
    title: '🎭 卡通材质',
    description: '卡通风格的材质，带有色阶效果',
    usage: '适用于卡通风格的对象渲染',
    tip: '提示：适合游戏、动画等风格化场景'
  },
  'normal-material': {
    title: '🌈 法线材质',
    description: '显示几何体法线方向的材质',
    usage: '用于调试和可视化几何体法线',
    tip: '提示：主要用于开发调试，不用于最终渲染'
  },
  'wireframe-material': {
    title: '🔲 线框材质',
    description: '只显示几何体边缘线框的材质',
    usage: '用于显示几何体的结构轮廓',
    tip: '提示：适合技术展示和结构分析'
  },

  // 镜面反射材质提示
  'mirror-material': {
    title: '🪞 镜面材质',
    description: '完全镜面反射材质，反射环境贴图',
    usage: '适用于镜子、金属表面等完全反射物体',
    tip: '提示：金属度1.0，粗糙度0.0，完美反射效果'
  },
  'chrome-material': {
    title: '🔩 铬合金材质',
    description: '铬合金金属材质，高反射度',
    usage: '适用于汽车、工业设备等金属表面',
    tip: '提示：具有高金属度和低粗糙度的金属质感'
  },
  'gold-material': {
    title: '🏆 黄金材质',
    description: '黄金金属材质，温暖的金色反射',
    usage: '适用于珠宝、装饰品等金色物体',
    tip: '提示：具有黄金色彩和金属光泽效果'
  },
  'silver-material': {
    title: '🥈 白银材质',
    description: '白银金属材质，冷色调高反射',
    usage: '适用于银器、电子设备等银色物体',
    tip: '提示：具有银白色调和强烈的金属反射'
  },
  'copper-material': {
    title: '🪙 铜质材质',
    description: '铜质金属材质，温暖的铜色反射',
    usage: '适用于铜器、管道等铜色物体',
    tip: '提示：具有铜色色彩和适中的金属反射度'
  },

  // 透明材质提示
  'glass-material': {
    title: '🍸 玻璃材质',
    description: '透明玻璃材质，支持光线透射',
    usage: '适用于玻璃制品、窗户等透明物体',
    tip: '提示：具有透明度和光线折射效果'
  },
  'crystal-material': {
    title: '💎 水晶材质',
    description: '高透明度水晶材质，完美透射',
    usage: '适用于水晶制品、宝石等透明物体',
    tip: '提示：具有极高的透明度和光线折射效果'
  },
  'physical-material': {
    title: '⚡ 物理材质',
    description: '基于物理的渲染材质，最真实的材质效果',
    usage: '适用于需要最真实材质表现的对象',
    tip: '提示：支持清漆层、透射等高级物理效果'
  },

  // 模型导入提示
  'import-file': {
    title: '📁 选择文件导入',
    description: '从本地文件系统导入3D模型',
    usage: '点击选择文件，支持GLTF、OBJ、FBX等格式',
    tip: '提示：支持拖拽文件到场景中直接导入'
  },
  'import-panel': {
    title: '📋 导入面板',
    description: '打开详细的模型导入设置面板',
    usage: '点击查看导入选项和设置',
    tip: '提示：可以调整导入的缩放、位置等参数'
  },
  'builtin-models': {
    title: '📦 内置模型库',
    description: '从内置模型库中选择和加载3D模型',
    usage: '点击打开内置模型选择面板，选择需要的模型',
    tip: '提示：包含服务器设备、空调设备、演示模型等多种类型'
  },
  'export-zip': {
    title: '📦 导出ZIP包',
    description: '导出场景数据和模型为ZIP包',
    usage: '点击导出包含所有模型和场景信息的ZIP文件',
    tip: '提示：ZIP包包含模型文件和场景数据JSON文件'
  },
  'import-zip': {
    title: '📥 导入ZIP包',
    description: '导入ZIP包中的场景数据和模型',
    usage: '点击选择ZIP文件，自动恢复场景和模型',
    tip: '提示：ZIP包必须包含scene-data.json文件'
  },
  'camera-tour': {
    title: '🎬 漫游配置',
    description: '配置相机漫游路径和模式',
    usage: '点击打开漫游配置面板，设置漫游路径和效果',
    tip: '提示：支持第一人称和第三人称漫游，可设置多种路径类型'
  },

  // 操作提示
  'clear-scene': {
    title: '🧹 清空场景',
    description: '清除场景中的所有对象',
    usage: '点击清空当前场景中的所有3D对象',
    tip: '提示：此操作不可撤销，请谨慎使用'
  },
  'reset-camera': {
    title: '📷 重置相机',
    description: '将相机重置到初始位置',
    usage: '点击将相机视角重置到默认位置',
    tip: '提示：当相机位置混乱时使用此功能'
  },
  'toggle-grid-axes': {
    title: '📐 切换网格坐标轴',
    description: '显示或隐藏网格和坐标轴',
    usage: '点击切换网格和坐标轴的显示状态',
    tip: '提示：网格有助于对齐和定位，坐标轴显示方向'
  },
}

// 移除标题中的 emoji 图标（改进版本，更健壮）
const removeIconFromTitle = (title: string): string => {
  if (!title) return title
  
  // 使用更全面的emoji正则表达式
  // 匹配各种emoji类型：基本emoji、表情符号、符号、标志、补充符号等
  const emojiRegex = /^[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{FE00}-\u{FE0F}]|[\u{200D}]/gu
  
  // 移除开头的emoji和后续空格
  let result = title.replace(emojiRegex, '')
  
  // 移除开头的空格和标点符号
  result = result.replace(/^[\s\u200B-\u200D\uFEFF]+/, '').trim()
  
  return result || title // 如果移除后为空，返回原标题
}

// 显示提示框
const showTooltipFor = (key: string, event: MouseEvent) => {
  const config = tooltipConfig[key as keyof typeof tooltipConfig]
  if (config) {
    // 保存当前提示框 key
    currentTooltipKey.value = key
    
    // 根据 showIcons 状态决定是否显示图标
    if (props.showIcons) {
      tooltipData.title = config.title
    } else {
      tooltipData.title = removeIconFromTitle(config.title)
    }
    tooltipData.description = config.description
    tooltipData.usage = config.usage
    tooltipData.tip = config.tip

    // 计算提示框位置
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    tooltipPosition.x = rect.right + 10
    tooltipPosition.y = rect.top - 10

    showTooltip.value = true
  }
}

// 隐藏提示框
const hideTooltip = () => {
  showTooltip.value = false
}

// 当前显示的提示框 key
const currentTooltipKey = ref<string>('')

// 监听 showIcons 变化，如果提示框正在显示，更新标题
watch(() => props.showIcons, () => {
  if (showTooltip.value && currentTooltipKey.value) {
    const config = tooltipConfig[currentTooltipKey.value as keyof typeof tooltipConfig]
    if (config) {
      if (props.showIcons) {
        tooltipData.title = config.title
      } else {
        tooltipData.title = removeIconFromTitle(config.title)
      }
    }
  }
})


// 触发文件选择
const triggerFileInput = () => {
  fileInput.value?.click()
}

// 文件选择事件
const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    emit('import-files', Array.from(target.files))
  }
}

// 显示导入面板
const showImportPanel = () => {
  emit('show-import-panel')
}


// 显示内置模型面板
const showBuiltinModels = () => {
  emit('show-builtin-models')
}

// 加载内置模型
const loadBuiltinModel = (model: any) => {
  emit('load-builtin-model', model)
}

// 切换图标显示
const toggleIcons = () => {
  // 直接 emit 新的状态，由父组件管理状态
  emit('toggle-icons', !props.showIcons)
}
</script>

<style scoped lang="scss">
.toolbar {
  width: 280px;
  max-width: 280px;
  background: #2a2a2a;
  border-right: 1px solid #444;
  padding: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 100vh;
  max-height: 100vh;
  box-sizing: border-box;
  position: relative;

  // 自定义提示框样式
  .custom-tooltip {
    position: fixed;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.95);
    border: 1px solid #007acc;
    border-radius: 8px;
    padding: 12px;
    max-width: 280px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    animation: tooltipFadeIn 0.2s ease-out;

    .tooltip-title {
      color: #007acc;
      font-weight: bold;
      font-size: 14px;
      margin-bottom: 8px;
      border-bottom: 1px solid #333;
      padding-bottom: 4px;
    }

    .tooltip-description {
      color: #fff;
      font-size: 12px;
      margin-bottom: 6px;
      line-height: 1.4;
    }

    .tooltip-usage {
      color: #ccc;
      font-size: 11px;
      margin-bottom: 6px;
      line-height: 1.3;
      font-style: italic;
    }

    .tooltip-tip {
      color: #ffd700;
      font-size: 11px;
      background: rgba(255, 215, 0, 0.1);
      border-left: 2px solid #ffd700;
      padding: 4px 8px;
      border-radius: 4px;
      line-height: 1.3;
    }
  }

  @keyframes tooltipFadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .toolbar-section {
    margin-bottom: 30px;

    h3 {
      color: #fff;
      font-size: 16px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 1px solid #444;
    }

    .tool-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 15px;

        .tool-status.camera-status {
          grid-column: 1 / -1;
          background: #1f1f1f;
          border: 1px solid #444;
          color: #9ad1ff;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 12px;
          text-align: center;
        }

      .tool-btn {
        background: #3a3a3a;
        border: 1px solid #555;
        color: #fff;
        padding: 5px 4px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;

        &:hover {
          background: #4a4a4a;
          border-color: #666;
          transform: translateY(-1px);
        }

        &.active {
          background: #007acc;
          border-color: #0099ff;
          color: #fff;
        }

        &:active {
          transform: scale(0.98);
        }

        &.import-btn {
          background: #28a745;
          border-color: #20c997;

          &:hover {
            background: #20c997;
            border-color: #17a2b8;
          }
        }

        .tool-select {
          background: #3a3a3a;
          border: 1px solid #555;
          color: #fff;
          padding: 6px 8px;
          border-radius: 6px;
          font-size: 12px;
        }
      }
    }
  }

}
</style>
