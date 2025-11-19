<template>
  <div class="config-dialog" v-if="visible">
    <div class="dialog-overlay" @click="$emit('close')"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3><span v-if="showIcons">🌌 </span>天空外景配置</h3>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>

      <div class="dialog-body">
        <!-- 启用天空盒控制 -->
        <div class="config-section">
          <div class="config-item">
            <label>
              <input
                type="checkbox"
                :checked="skyboxSettings.enabled"
                @change="handleSkyboxEnableChange"
              />
              启用天空盒
            </label>
          </div>
        </div>

        <!-- 天空盒类型选择 -->
        <div class="config-section">
          <h4><span v-if="showIcons">🎨 </span>天空盒类型</h4>
          <div class="config-item">
            <label>
              <input
                type="radio"
                name="skyboxType"
                value="gradient"
                :checked="skyboxSettings.type === 'gradient'"
                @change="handleTypeChange('gradient')"
              />
              渐变天空盒
            </label>
          </div>
          <div class="config-item">
            <label>
              <input
                type="radio"
                name="skyboxType"
                value="cubemap"
                :checked="skyboxSettings.type === 'cubemap'"
                @change="handleTypeChange('cubemap')"
              />
              立方体贴图天空盒
            </label>
          </div>
          <div class="config-item">
            <label>
              <input
                type="radio"
                name="skyboxType"
                value="hdri"
                :checked="skyboxSettings.type === 'hdri'"
                @change="handleTypeChange('hdri')"
              />
              HDRI环境贴图
            </label>
          </div>
        </div>

        <!-- 预设选择 -->
        <div class="config-section" v-if="skyboxSettings.type === 'gradient' || skyboxSettings.type === 'hdri'">
          <h4><span v-if="showIcons">🌟 </span>预设选择</h4>

          <!-- 渐变预设 -->
          <div v-if="skyboxSettings.type === 'gradient'">
            <h5>渐变预设</h5>
            <div class="preset-grid">
              <button
                v-for="preset in skyboxPresets.filter(p => p.type === 'gradient')"
                :key="preset.id"
                class="preset-btn"
                :class="{ active: skyboxSettings.currentPreset === preset.id }"
                @click="$emit('apply-preset', preset.id)"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>

          <!-- 本地HDRI预设 -->
          <div v-if="skyboxSettings.type === 'hdri'">
            <!-- 一行显示所有HDRI预设 -->
            <div class="preset-grid hdri-grid">
              <button
                v-for="preset in skyboxPresets.filter(p => p.type === 'hdri')"
                :key="preset.id"
                class="preset-btn hdri-btn"
                :class="{ active: skyboxSettings.currentPreset === preset.id }"
                @click="$emit('apply-preset', preset.id)"
                :title="(preset as any).description"
              >
                {{ preset.name }}
              </button>
            </div>
          </div>
        </div>

        <!-- 渐变颜色配置 -->
        <div class="config-section" v-if="skyboxSettings.type === 'gradient'">
          <h4><span v-if="showIcons">🎨 </span>渐变颜色</h4>
          <div class="config-item">
            <label>顶部颜色:</label>
            <input
              type="color"
              :value="skyboxSettings.topColor"
              @change="handleTopColorChange"
            />
          </div>
          <div class="config-item">
            <label>地平线颜色:</label>
            <input
              type="color"
              :value="skyboxSettings.horizonColor"
              @change="handleHorizonColorChange"
            />
          </div>
          <div class="config-item">
            <label>底部颜色:</label>
            <input
              type="color"
              :value="skyboxSettings.bottomColor"
              @change="handleBottomColorChange"
            />
          </div>
        </div>

        <!-- HDRI强度控制 -->
        <div class="config-section" v-if="skyboxSettings.type === 'hdri'">
          <h4><span v-if="showIcons">⚡ </span>HDRI设置</h4>
          <div class="config-item">
            <label>强度:</label>
            <input
              type="range"
              min="0.1"
              max="3"
              step="0.1"
              :value="skyboxSettings.hdriIntensity"
              @input="handleHDRIIntensityChange"
            />
            <span>{{ skyboxSettings.hdriIntensity }}</span>
          </div>

          <!-- 本地HDRI文件上传 -->
          <div class="config-item">
            <label>上传本地HDRI文件:</label>
            <input
              type="file"
              accept=".hdr,.exr"
              @change="handleLocalHDRIUpload"
              class="file-input"
            />
            <small class="upload-tip">支持 .hdr 和 .exr 格式文件</small>
          </div>
        </div>

        <!-- 立方体贴图上传 -->
        <div class="config-section" v-if="skyboxSettings.type === 'cubemap'">
          <h4><span v-if="showIcons">📁 </span>立方体贴图上传</h4>
          <p class="upload-tip">请上传6张图片，分别对应立方体的6个面：</p>
          <div class="cubemap-upload">
            <div class="upload-face">
              <label>右面 (posx):</label>
              <input
                type="file"
                accept="image/*"
                @change="handleCubemapUpload('posx', $event)"
              />
            </div>
            <div class="upload-face">
              <label>左面 (negx):</label>
              <input
                type="file"
                accept="image/*"
                @change="handleCubemapUpload('negx', $event)"
              />
            </div>
            <div class="upload-face">
              <label>上面 (posy):</label>
              <input
                type="file"
                accept="image/*"
                @change="handleCubemapUpload('posy', $event)"
              />
            </div>
            <div class="upload-face">
              <label>下面 (negy):</label>
              <input
                type="file"
                accept="image/*"
                @change="handleCubemapUpload('negy', $event)"
              />
            </div>
            <div class="upload-face">
              <label>前面 (posz):</label>
              <input
                type="file"
                accept="image/*"
                @change="handleCubemapUpload('posz', $event)"
              />
            </div>
            <div class="upload-face">
              <label>后面 (negz):</label>
              <input
                type="file"
                accept="image/*"
                @change="handleCubemapUpload('negz', $event)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface SkyboxSettings {
  enabled: boolean
  type: 'gradient' | 'cubemap' | 'hdri'
  currentPreset: string
  topColor: string
  horizonColor: string
  bottomColor: string
  hdriIntensity: number
  hdriUrl: string
  customCubemap: {
    posx: string | null
    negx: string | null
    posy: string | null
    negy: string | null
    posz: string | null
    negz: string | null
  }
}

interface SkyboxPreset {
  id: string
  name: string
  type: string
  description?: string
  colors?: {
    top: string
    bottom: string
    horizon: string
  }
  url?: string
  category?: string
}

interface Props {
  visible: boolean
  showIcons: boolean
  skyboxSettings: SkyboxSettings
  skyboxPresets: SkyboxPreset[]
}

const props = defineProps<Props>()

const emit = defineEmits([
  'close',
  'update-skybox-settings',
  'apply-preset',
  'upload-local-hdri',
  'upload-cubemap'
])

const handleSkyboxEnableChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-skybox-settings', { ...props.skyboxSettings, enabled: target.checked })
}

const handleTypeChange = (type: 'gradient' | 'cubemap' | 'hdri') => {
  emit('update-skybox-settings', { ...props.skyboxSettings, type })
}

const handleTopColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-skybox-settings', { ...props.skyboxSettings, topColor: target.value })
}

const handleHorizonColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-skybox-settings', { ...props.skyboxSettings, horizonColor: target.value })
}

const handleBottomColorChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-skybox-settings', { ...props.skyboxSettings, bottomColor: target.value })
}

const handleHDRIIntensityChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update-skybox-settings', { ...props.skyboxSettings, hdriIntensity: parseFloat(target.value) })
}

const handleLocalHDRIUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload-local-hdri', file)
  }
}

const handleCubemapUpload = (face: string, event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    emit('upload-cubemap', { face, file })
  }
}
</script>

<style scoped lang="scss">
// 配置对话框样式
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
            text-align: right;
          }
        }
      }

      // 预设网格
      .preset-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 8px;
        margin-top: 12px;

        // HDRI预设一行显示
        &.hdri-grid {
          grid-template-columns: repeat(3, 1fr);
          max-width: 100%;
        }

        .preset-btn {
          padding: 8px 12px;
          background: #333;
          border: 1px solid #555;
          border-radius: 6px;
          color: #ccc;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;

          &:hover {
            background: #444;
            border-color: #777;
            color: #fff;
          }

          &.active {
            background: #007acc;
            border-color: #007acc;
            color: #fff;
          }

          &.hdri-btn {
            background: linear-gradient(135deg, #333 0%, #444 100%);
            border-color: #666;
            position: relative;

            &:hover {
              background: linear-gradient(135deg, #444 0%, #555 100%);
              border-color: #888;
            }

            &.active {
              background: linear-gradient(135deg, #007acc 0%, #0099ff 100%);
              border-color: #007acc;
            }
          }
        }
      }

      // 预设分类
      .preset-category {
        margin-bottom: 20px;

        h5, h6 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 4px;
        }

        h6 {
          font-size: 12px;
          color: #ccc;
          margin-bottom: 6px;
        }
      }

      // 来源链接
      .source-link {
        font-size: 10px;
        color: #888;
        font-weight: normal;

        a {
          color: #007acc;
          text-decoration: none;

          &:hover {
            color: #0099ff;
            text-decoration: underline;
          }
        }
      }

      // 立方体贴图上传
      .upload-tip {
        font-size: 12px;
        color: #888;
        margin: 0 0 16px 0;
        line-height: 1.4;
      }

      .cubemap-upload {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 12px;

        .upload-face {
          display: flex;
          flex-direction: column;
          gap: 6px;

          label {
            font-size: 12px;
            color: #ccc;
            font-weight: 500;
          }

          input[type="file"] {
            padding: 6px;
            background: #333;
            border: 1px solid #555;
            border-radius: 4px;
            color: #fff;
            font-size: 12px;
            cursor: pointer;

            &:focus {
              outline: none;
              border-color: #007acc;
              box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
            }

            &::file-selector-button {
              background: #007acc;
              border: none;
              color: #fff;
              padding: 4px 8px;
              border-radius: 3px;
              cursor: pointer;
              font-size: 11px;
              margin-right: 8px;

              &:hover {
                background: #0099ff;
              }
            }
          }
        }
      }

      // 单选按钮样式
      input[type="radio"] {
        margin-right: 8px;
        accent-color: #007acc;
      }
    }
  }

  // 反射清晰度设置样式
  .reflection-settings {
    padding: 10px 0;
  }

  .reflection-settings .setting-item {
    margin-bottom: 15px;
  }

  .reflection-settings .slider-container {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 5px;
  }

  .reflection-slider {
    flex: 1;
    height: 6px;
    background: #444;
    border-radius: 3px;
    outline: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .reflection-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 18px;
    height: 18px;
    background: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  .reflection-slider::-moz-range-thumb {
    width: 18px;
    height: 18px;
    background: #4CAF50;
    border-radius: 50%;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }
}
</style>