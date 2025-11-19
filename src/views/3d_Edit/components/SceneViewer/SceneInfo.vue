<template>
  <div class="scene-info">
    <div class="info-item clickable" @click="showObjectList">
      <span>对象数量:</span>
      <span>{{ sceneObjects.length }}</span>
      <span class="toggle-icon">展开</span>
    </div>

    <!-- 相机切换工具栏 -->
    <div class="info-item">
      <span>相机模式:</span>
      <div class="camera-mode-switch">
        <button
          :class="{ active: cameraMode === 'perspective' }"
          @click="switchToPerspective"
          title="透视相机"
        >
          透视
        </button>
        <button
          :class="{ active: cameraMode === 'orthographic' }"
          @click="switchToOrthographic"
          title="正交相机"
        >
          正交
        </button>
      </div>
    </div>

    <!-- 阴影信息与预设切换 -->
    <div class="info-item">
      <span>阴影模式:</span>
      <select class="info-select" :value="shadowType" @change="onChangeShadowType">
        <option value="Basic">Basic</option>
        <option value="PCF">PCF</option>
        <option value="PCFSoft">PCFSoft</option>
        <option value="VSM">VSM</option>
      </select>
      <select class="info-select" :value="shadowPreset" @change="onChangeShadowPreset">
        <option value="performance">性能优先</option>
        <option value="quality">效果优先</option>
      </select>
    </div>

    <!-- 后处理与雾化 -->
    <div class="info-item">
      <label>
        <input type="checkbox" :checked="fxaaEnabled" @change="onToggleFxaa" /> FXAA 抗锯齿
      </label>
    </div>
    <div class="info-item">
      <label>
        <input type="checkbox" :checked="bloomEnabled" @change="onToggleBloom" /> Bloom 辉光
      </label>
      <div style="display:flex;align-items:center;gap:6px;margin-left:8px;">
        <input type="range" min="0" max="2" step="0.05" :value="bloomStrength" @input="onUpdateBloomStrength" />
        <span>{{ bloomStrength.toFixed(2) }}</span>
      </div>
    </div>
    <div class="info-item" style="display: block">
      <label>
        <input type="checkbox" :checked="fogEnabled" @change="onToggleFog" /> 场景雾化（线性）
      </label>
      <div style="display:flex;align-items:center;gap:6px;margin-top:6px;">
        <span>近</span>
        <input type="number" style="width:70px" :value="fogNear" @input="onUpdateFogNear" />
        <span>远</span>
        <input type="number" style="width:70px" :value="fogFar" @input="onUpdateFogFar" />
        <input type="color" :value="fogColor" @input="onUpdateFogColor" />
      </div>
    </div>

    <!-- 粒子泼溅效果预设 -->
    <div class="info-item">
      <label>粒子泼溅预设</label>
      <select class="tool-select" @change="$emit('change-splash-preset', ($event.target as HTMLSelectElement).value)">
        <option value="water">💧 水花</option>
        <option value="fire">🔥 火花</option>
        <option value="smoke">💨 烟雾</option>
        <option value="magic">✨ 魔法</option>
        <option value="snow">❄️ 雪花</option>
      </select>
    </div>

    <!-- 高斯泼溅控制 -->
    <div class="info-item" v-if="gaussianSplatCount > 0">
      <label>高斯泼溅点云 ({{ gaussianSplatCount }})</label>
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
        <span>点大小</span>
        <input type="range" min="0.005" max="1.0" step="0.005" :value="gaussianPointSize" @input="onUpdateGaussianPointSize" style="flex:1" />
        <span style="min-width:40px">{{ gaussianPointSize?.toFixed(3) }}</span>
      </div>
      <div style="display:flex;gap:4px;margin-top:4px;flex-wrap:wrap;">
        <button class="preset-btn" @click="$emit('update-gaussian-point-size', 0.01)" style="font-size:11px;padding:2px 6px;">精细</button>
        <button class="preset-btn" @click="$emit('update-gaussian-point-size', 0.05)" style="font-size:11px;padding:2px 6px;">标准</button>
        <button class="preset-btn" @click="$emit('update-gaussian-point-size', 0.1)" style="font-size:11px;padding:2px 6px;">粗糙</button>
        <button class="preset-btn" @click="$emit('update-gaussian-point-size', 0.2)" style="font-size:11px;padding:2px 6px;">超粗</button>
      </div>
    </div>

    <div class="info-item">
      <label class="skybox-enable-label">
        <input
            type="checkbox"
            :checked="skyboxSettings.enabled"
            @change="handleSkyboxEnableChange"
        />
        <span>启用天空盒</span>
      </label>
      <label class="skybox-enable-label">
        <input
            type="checkbox"
            :checked="skyboxSettings.enabled"
            @change="handleSkyboxEnableChange"
        />
        <span>昼夜变化</span>
      </label>
    </div>

    <div>
      <el-radio-group style="display: grid;grid-template-columns: repeat(2, 3fr);" :model-value="radioGroup" @update:model-value="updateRadioGroup">
        <el-radio label="0" size="small">常规自转</el-radio>
        <el-radio label="1" size="small">南回归线</el-radio>
        <el-radio label="2" size="small">北回归线</el-radio>
        <el-radio label="2" size="small">极昼</el-radio>
        <el-radio label="2" size="small">极夜</el-radio>
      </el-radio-group>
    </div>

    <!-- 灯光控制 -->
    <div class="light-controls">
      <h4><span v-if="showIcons">💡 </span>默认光控制</h4>
      <div class="light-item">
        <label>环境光:</label>
        <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            :value="lightIntensities.ambient"
            @input="updateAmbientLight"
        />
        <span>{{ lightIntensities.ambient.toFixed(1) }}</span>
      </div>
      <div class="light-item">
        <label>主光源:</label>
        <input
            type="range"
            min="0"
            max="3"
            step="0.1"
            :value="lightIntensities.directional"
            @input="updateDirectionalLight"
        />
        <span>{{ lightIntensities.directional.toFixed(1) }}</span>
      </div>
      <div class="light-item">
        <label>点光源:</label>
        <input
            type="range"
            min="0"
            max="2"
            step="0.1"
            :value="lightIntensities.point"
            @input="updatePointLight"
        />
        <span>{{ lightIntensities.point.toFixed(1) }}</span>
      </div>
    </div>

    <!-- 漫游配置列表 -->
    <div class="tour-configs-list" v-if="savedTourConfigs.length > 0">
      <h4><span v-if="showIcons">🎬 </span>漫游配置</h4>
      <div class="config-list-content">
        <div
            v-for="(config, index) in savedTourConfigs"
            :key="config.id"
            class="config-item"
        >
          <div class="config-info">
            <span class="config-name">{{ config.name }}</span>
            <span class="config-details">
              {{ config.points?.length || 0 }}个路径点 |
              {{ config.duration || 10 }}s |
              {{ config.mode === 'first-person' ? '第一人称' : '第三人称' }}
            </span>
          </div>
          <div class="config-actions">
            <button
                class="action-btn play-btn"
                :class="{ 'playing': currentPlayingConfig?.id === config.id && !isTourPaused, 'paused': currentPlayingConfig?.id === config.id && isTourPaused }"
                @click="toggleTourPlayback(config)"
                :title="getPlayButtonTitle(config)"
            >
              {{ getPlayButtonIcon(config) }}
            </button>
            <button
                class="action-btn replay-btn"
                @click="replayTourConfig(config)"
                :disabled="currentPlayingConfig?.id === config.id && !isTourPaused"
                title="重播漫游"
            >
              🔄
            </button>
            <button
                class="action-btn edit-btn"
                @click="editSavedTourConfig(config)"
                title="编辑配置"
            >
              ✏️
            </button>
            <button
                class="action-btn delete-btn"
                @click="deleteSavedTourConfig(config)"
                title="删除配置"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

interface Props {
  sceneObjects: any[]
  cameraMode: 'perspective' | 'orthographic'
  shadowType: string
  shadowPreset: 'performance' | 'quality'
  fxaaEnabled: boolean
  bloomEnabled: boolean
  bloomStrength: number
  fogEnabled: boolean
  fogNear: number
  gaussianSplatCount?: number
  gaussianPointSize?: number
  fogFar: number
  fogColor: string
  skyboxSettings: {
    enabled: boolean
  }
  radioGroup: string
  lightIntensities: {
    ambient: number
    directional: number
    point: number
  }
  savedTourConfigs: any[]
  currentPlayingConfig: any
  isTourPaused: boolean
  showIcons: boolean
}

const props = defineProps<Props>()

const emit = defineEmits([
  'show-object-list',
  'switch-to-perspective',
  'switch-to-orthographic',
  'change-shadow-type',
  'toggle-shadow-preset',
  'toggle-fxaa',
  'toggle-bloom',
  'update-bloom-strength',
  'toggle-fog',
  'update-fog-near',
  'update-fog-far',
  'update-fog-color',
  'change-splash-preset',
  'update-gaussian-point-size',
  'skybox-enable-change',
  'update-lights',
  'update-radio-group',
  'update-ambient-light',
  'update-directional-light',
  'update-point-light',
  'toggle-tour-playback',
  'replay-tour-config',
  'edit-saved-tour-config',
  'delete-saved-tour-config'
])

const showObjectList = () => {
  emit('show-object-list')
}

const switchToPerspective = () => {
  emit('switch-to-perspective')
}

const switchToOrthographic = () => {
  emit('switch-to-orthographic')
}

const onChangeShadowPreset = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value as 'performance' | 'quality'
  emit('toggle-shadow-preset')
  // 直接上抛更准确：
  // emit('apply-shadow-preset', val)
}

const onChangeShadowType = (e: Event) => {
  const val = (e.target as HTMLSelectElement).value
  const map: Record<string, string> = {
    Basic: 'BasicShadowMap',
    PCF: 'PCFShadowMap',
    PCFSoft: 'PCFSoftShadowMap',
    VSM: 'VSMShadowMap'
  }
  emit('change-shadow-type', map[val] || 'PCFSoftShadowMap')
}

// FXAA / Bloom / Fog 事件
const onToggleFxaa = (e: Event) => emit('toggle-fxaa', (e.target as HTMLInputElement).checked)
const onToggleBloom = (e: Event) => emit('toggle-bloom', (e.target as HTMLInputElement).checked)
const onUpdateBloomStrength = (e: Event) => emit('update-bloom-strength', parseFloat((e.target as HTMLInputElement).value))
const onToggleFog = (e: Event) => emit('toggle-fog', (e.target as HTMLInputElement).checked)
const onUpdateFogNear = (e: Event) => emit('update-fog-near', parseFloat((e.target as HTMLInputElement).value))
const onUpdateFogFar = (e: Event) => emit('update-fog-far', parseFloat((e.target as HTMLInputElement).value))
const onUpdateFogColor = (e: Event) => emit('update-fog-color', (e.target as HTMLInputElement).value)

const onUpdateGaussianPointSize = (e: Event) => {
  const value = parseFloat((e.target as HTMLInputElement).value)
  emit('update-gaussian-point-size', value)
}

const handleSkyboxEnableChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('skybox-enable-change', target.checked)
}

const updateLights = () => {
  emit('update-lights', props.lightIntensities)
}

const updateRadioGroup = (value: string) => {
  emit('update-radio-group', value)
}

const updateAmbientLight = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-ambient-light', parseFloat(target.value))
}

const updateDirectionalLight = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-directional-light', parseFloat(target.value))
}

const updatePointLight = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-point-light', parseFloat(target.value))
}

const toggleTourPlayback = (config: any) => {
  emit('toggle-tour-playback', config)
}

const replayTourConfig = (config: any) => {
  emit('replay-tour-config', config)
}

const editSavedTourConfig = (config: any) => {
  emit('edit-saved-tour-config', config)
}

const deleteSavedTourConfig = (config: any) => {
  emit('delete-saved-tour-config', config)
}

const getPlayButtonIcon = (config: any) => {
  if (props.currentPlayingConfig?.id === config.id) {
    return props.isTourPaused ? '⏸️' : '⏹️'
  }
  return '▶️'
}

const getPlayButtonTitle = (config: any) => {
  if (props.currentPlayingConfig?.id === config.id) {
    return props.isTourPaused ? '继续播放' : '暂停播放'
  }
  return '开始播放'
}
</script>

<style scoped lang="scss">
.scene-info {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  padding: 15px;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;

  .info-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;

    &:last-child {
      margin-bottom: 0;
    }

    span:first-child {
      color: #ccc;
      margin-right: 15px;
    }

    span:last-child {
      color: #fff;
      font-weight: 500;
    }

    &.clickable {
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
      }

      .toggle-icon {
        margin-left: 8px;
        color: #ffd700;
        font-size: 12px;
      }
    }
  }

  // 相机切换按钮样式
  .camera-mode-switch {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 2px;

    button {
      flex: 1;
      padding: 4px 8px;
      background: transparent;
      border: none;
      border-radius: 4px;
      color: #ccc;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      &.active {
        background: #409eff;
        color: #fff;
        box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
      }

      span {
        pointer-events: none;
      }
    }
  }

  .skybox-enable-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;

    input[type="checkbox"] {
      margin: 0;
    }
  }

  // 灯光控制样式
  .light-controls {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);

    h4 {
      margin: 0 0 15px 0;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }

    .light-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      gap: 10px;

      &:last-child {
        margin-bottom: 0;
      }

      label {
        color: #ccc;
        font-size: 12px;
        min-width: 60px;
      }

      input[type="range"] {
        flex: 1;
        height: 4px;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 2px;
        outline: none;
        -webkit-appearance: none;

        &::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: #409eff;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
        }

        &::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #409eff;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
        }
      }

      span:last-child {
        color: #409eff;
        font-weight: 600;
        min-width: 30px;
        text-align: right;
      }
    }
  }

  // 漫游配置列表样式
  .tour-configs-list {
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.2);

    h4 {
      margin: 0 0 15px 0;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
    }

    .config-list-content {
      max-height: 200px;
      overflow-y: auto;
    }

    .config-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 6px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: rgba(64, 158, 255, 0.3);
      }

      &:last-child {
        margin-bottom: 0;
      }

      .config-info {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 4px;

        .config-name {
          color: #fff;
          font-weight: 500;
          font-size: 13px;
        }

        .config-details {
          color: #ccc;
          font-size: 11px;
        }
      }

      .config-actions {
        display: flex;
        gap: 4px;

        .action-btn {
          width: 24px;
          height: 24px;
          border: none;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.1);
          color: #ccc;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: all 0.2s ease;

          &:hover {
            background: rgba(255, 255, 255, 0.2);
            color: #fff;
          }

          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;

            &:hover {
              background: rgba(255, 255, 255, 0.1);
              color: #ccc;
            }
          }

          &.play-btn {
            &.playing {
              background: #f56c6c;
              color: #fff;
            }

            &.paused {
              background: #e6a23c;
              color: #fff;
            }
          }

          &.edit-btn:hover {
            background: #409eff;
            color: #fff;
          }

          &.delete-btn:hover {
            background: #f56c6c;
            color: #fff;
          }

          &.replay-btn:hover {
            background: #67c23a;
            color: #fff;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .scene-info {
    position: relative;
    top: auto;
    right: auto;
    margin: 20px;
    width: auto;
  }
}
</style>
