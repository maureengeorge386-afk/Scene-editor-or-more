<template>
  <div class="config-dialog" v-if="visible">
    <div class="dialog-overlay" @click="$emit('close')"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3><span v-if="showIcons">💡 </span>光源配置</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body">
        <div class="config-section">
          <div class="toolbar-section">
            <h4><span v-if="showIcons">🔧 </span>光源管理</h4>
            <div class="toolbar-buttons">
              <button class="btn-primary" @click="onOpenAddLight">
                <span v-if="showIcons">➕ </span>添加光源
              </button>
              <button class="btn-secondary" @click="onOpenManagement">
                <span v-if="showIcons">📋 </span>管理光源 ({{ customLights.length }})
              </button>
              <button class="btn-info" @click="onResetDefault">
                <span v-if="showIcons">🔄 </span>重置默认
              </button>
            </div>
          </div>
        </div>

        <div class="config-section" v-if="customLights.length > 0">
          <h4><span v-if="showIcons">✨ </span>自定义光源</h4>
          <div class="light-list">
            <div
              v-for="light in customLights"
              :key="light.id"
              class="light-item"
              :class="{ disabled: !light.enabled }"
            >
              <div class="light-info">
                <span class="light-icon">{{ lightTypes.find(t => t.id === light.type)?.icon }}</span>
                <span class="light-name">{{ light.name }}</span>
                <span class="light-type">{{ lightTypes.find(t => t.id === light.type)?.name }}</span>
              </div>
              <div class="light-controls">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    v-model="light.enabled"
                    @change="() => onUpdateCustomLight(light)"
                  />
                  <span class="slider"></span>
                </label>
                <button class="btn-edit" @click="() => onEditCustomLight(light)" title="编辑">
                  <span>✏️</span>
                </button>
                <button class="btn-delete" @click="() => onDeleteCustomLight(light.id)" title="删除">
                  <span>🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="config-section">
          <h4><span v-if="showIcons">🌅 </span>环境光</h4>
          <div class="config-item">
            <label>强度:</label>
            <input type="range" min="0" max="2" step="0.1" v-model="lightSettings.ambientIntensity" @input="onUpdateSettings" />
            <span>{{ lightSettings.ambientIntensity }}</span>
          </div>
          <div class="config-item">
            <label>颜色:</label>
            <input type="color" v-model="lightSettings.ambientColor" @change="onUpdateSettings" />
          </div>
        </div>

        <div class="config-section">
          <h4><span v-if="showIcons">☀️ </span>方向光（主光源）</h4>
          <div class="config-item">
            <label>强度:</label>
            <input type="range" min="0" max="3" step="0.1" v-model="lightSettings.directionalIntensity" @input="onUpdateSettings" />
            <span>{{ lightSettings.directionalIntensity }}</span>
          </div>
          <div class="config-item">
            <label>颜色:</label>
            <input type="color" v-model="lightSettings.directionalColor" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 X:</label>
            <input type="number" v-model="lightSettings.directionalPosition.x" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 Y:</label>
            <input type="number" v-model="lightSettings.directionalPosition.y" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 Z:</label>
            <input type="number" v-model="lightSettings.directionalPosition.z" @change="onUpdateSettings" />
          </div>
        </div>

        <div class="config-section">
          <h4><span v-if="showIcons">💡 </span>点光源</h4>
          <div class="config-item">
            <label>强度:</label>
            <input type="range" min="0" max="2" step="0.1" v-model="lightSettings.pointIntensity" @input="onUpdateSettings" />
            <span>{{ lightSettings.pointIntensity }}</span>
          </div>
          <div class="config-item">
            <label>颜色:</label>
            <input type="color" v-model="lightSettings.pointColor" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 X:</label>
            <input type="number" v-model="lightSettings.pointPosition.x" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 Y:</label>
            <input type="number" v-model="lightSettings.pointPosition.y" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 Z:</label>
            <input type="number" v-model="lightSettings.pointPosition.z" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>距离:</label>
            <input type="range" min="10" max="200" step="10" v-model="lightSettings.pointDistance" @input="onUpdateSettings" />
            <span>{{ lightSettings.pointDistance }}</span>
          </div>
        </div>

        <div class="config-section">
          <h4><span v-if="showIcons">🔦 </span>聚光灯</h4>
          <div class="config-item">
            <label>强度:</label>
            <input type="range" min="0" max="2" step="0.1" v-model="lightSettings.spotIntensity" @input="onUpdateSettings" />
            <span>{{ lightSettings.spotIntensity }}</span>
          </div>
          <div class="config-item">
            <label>颜色:</label>
            <input type="color" v-model="lightSettings.spotColor" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 X:</label>
            <input type="number" v-model="lightSettings.spotPosition.x" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 Y:</label>
            <input type="number" v-model="lightSettings.spotPosition.y" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>位置 Z:</label>
            <input type="number" v-model="lightSettings.spotPosition.z" @change="onUpdateSettings" />
          </div>
          <div class="config-item">
            <label>角度:</label>
            <input type="range" min="0" max="90" step="1" v-model="lightSettings.spotAngle" @input="onUpdateSettings" />
            <span>{{ lightSettings.spotAngle }}</span>
          </div>
          <div class="config-item">
            <label>边缘柔和度:</label>
            <input type="range" min="0" max="1" step="0.1" v-model="lightSettings.spotPenumbra" @input="onUpdateSettings" />
            <span>{{ lightSettings.spotPenumbra }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  </template>

<script setup lang="ts">
import { computed } from 'vue'

interface LightTypeDef { id: string; name: string; icon?: string }
interface LightSettings {
  ambientIntensity: number
  ambientColor: string
  directionalIntensity: number
  directionalColor: string
  directionalPosition: { x: number; y: number; z: number }
  pointIntensity: number
  pointColor: string
  pointPosition: { x: number; y: number; z: number }
  pointDistance: number
  spotIntensity: number
  spotColor: string
  spotPosition: { x: number; y: number; z: number }
  spotAngle: number
  spotPenumbra: number
}

const props = defineProps<{
  visible: boolean
  showIcons?: boolean
  customLights: any[]
  lightTypes: LightTypeDef[]
  lightSettings: LightSettings
  onOpenAddLight: () => void
  onOpenManagement: () => void
  onResetDefault: () => void
  onUpdateSettings: () => void
  onUpdateCustomLight: (light: any) => void
  onEditCustomLight: (light: any) => void
  onDeleteCustomLight: (id: string) => void
}>()

defineEmits(['close'])

const showIcons = computed(() => !!props.showIcons)
const customLights = computed(() => props.customLights)
const lightTypes = computed(() => props.lightTypes)
const lightSettings = computed({
  get: () => props.lightSettings,
  set: () => {}
})

const onOpenAddLight = () => props.onOpenAddLight && props.onOpenAddLight()
const onOpenManagement = () => props.onOpenManagement && props.onOpenManagement()
const onResetDefault = () => props.onResetDefault && props.onResetDefault()
const onUpdateSettings = () => props.onUpdateSettings && props.onUpdateSettings()
const onUpdateCustomLight = (light: any) => props.onUpdateCustomLight && props.onUpdateCustomLight(light)
const onEditCustomLight = (light: any) => props.onEditCustomLight && props.onEditCustomLight(light)
const onDeleteCustomLight = (id: string) => props.onDeleteCustomLight && props.onDeleteCustomLight(id)
</script>

<style scoped lang="scss">
.config-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;

  .dialog-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
  }

  .dialog-content {
    position: relative;
    background: #2a2a2a;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    border: 1px solid #444;

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #444;
      flex-shrink: 0;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #fff;
      }

      .close-btn {
        background: none;
        border: none;
        color: #888;
        font-size: 20px;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      }
    }

    .dialog-body {
      padding: 24px;
      overflow-y: auto;
      flex: 1;

      .config-section {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }

        h4 {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 8px;
        }

        .toolbar-buttons {
          display: flex;
          gap: 8px;

          .btn-primary,
          .btn-secondary,
          .btn-info {
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            border: 1px solid transparent;
          }

          .btn-primary { background: #007acc; border-color: #007acc; color: #fff; }
          .btn-secondary { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); color: #fff; }
          .btn-info { background: #17a2b8; border-color: #17a2b8; color: #fff; }
        }

        .light-list {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .light-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 10px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            background: rgba(255, 255, 255, 0.05);

            &.disabled { opacity: 0.6; }

            .light-info { display: flex; gap: 8px; align-items: center; color: #fff; }

            .light-controls { display: flex; gap: 6px; }

            .toggle-switch { position: relative; display: inline-block; width: 34px; height: 18px; }
            .toggle-switch input { display: none; }
            .toggle-switch .slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background: #666; transition: .2s; border-radius: 18px; }
            .toggle-switch .slider:before { position: absolute; content: ""; height: 14px; width: 14px; left: 2px; bottom: 2px; background: white; transition: .2s; border-radius: 50%; }
            .toggle-switch input:checked + .slider { background: #28a745; }
            .toggle-switch input:checked + .slider:before { transform: translateX(16px); }

            .btn-edit, .btn-delete { background: none; border: 1px solid rgba(255,255,255,0.2); color: #ccc; border-radius: 3px; padding: 3px 6px; font-size: 12px; cursor: pointer; }
          }
        }

        .config-item {
          display: flex;
          align-items: center;
          margin-bottom: 16px;
          gap: 12px;

          &:last-child {
            margin-bottom: 0;
          }

          label {
            min-width: 80px;
            font-size: 14px;
            color: #ccc;
            display: flex;
            align-items: center;
            gap: 8px;

            input[type="checkbox"] {
              margin: 0;
            }
          }

          input[type="range"] {
            flex: 1;
            height: 6px;
            background: #444;
            border-radius: 3px;
            outline: none;
            -webkit-appearance: none;
            appearance: none;

            &::-webkit-slider-thumb {
              -webkit-appearance: none;
              width: 18px;
              height: 18px;
              background: #007acc;
              border-radius: 50%;
              cursor: pointer;
              transition: all 0.2s;

              &:hover {
                background: #0099ff;
                transform: scale(1.1);
              }
            }

            &::-moz-range-thumb {
              width: 18px;
              height: 18px;
              background: #007acc;
              border-radius: 50%;
              cursor: pointer;
              border: none;
              transition: all 0.2s;

              &:hover {
                background: #0099ff;
                transform: scale(1.1);
              }
            }
          }

          input[type="color"] {
            width: 40px;
            height: 32px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            background: none;

            &::-webkit-color-swatch-wrapper {
              padding: 0;
            }

            &::-webkit-color-swatch {
              border: 1px solid #555;
              border-radius: 6px;
            }
          }

          input[type="number"] {
            width: 80px;
            padding: 6px 8px;
            background: #333;
            border: 1px solid #555;
            border-radius: 4px;
            color: #fff;
            font-size: 14px;

            &:focus {
              outline: none;
              border-color: #007acc;
              box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
            }
          }

          span {
            min-width: 40px;
            font-size: 14px;
            color: #007acc;
            font-weight: 500;
          }
        }
      }
    }
  }
}
</style>


