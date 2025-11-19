<template>
  <div class="scene-viewer">
    <div ref="container" class="scene-container"></div>

    <!-- 3D导航立方体 -->
    <ViewCube
        :camera="camera"
        :target="controls?.target"
        :duration="1000"
        @view-change="handleViewChange"
    />

    <!-- 场景信息显示 -->
    <SceneInfo
        :scene-objects="sceneObjects"
        :camera-mode="cameraMode"
        :shadow-type="shadowTypeLabel"
        :shadow-preset="shadowPreset"
        :fxaa-enabled="fxaaEnabled"
        :bloom-enabled="bloomEnabled"
        :bloom-strength="bloomStrength"
        :fog-enabled="fogEnabled"
        :fog-near="fogNear"
        :fog-far="fogFar"
        :fog-color="fogColor"
        :gaussian-splat-count="gaussianSplatControllers.length"
        :gaussian-point-size="gaussianPointSize"
        :skybox-settings="skyboxSettings"
        :radio-group="radioGroup"
        :light-intensities="lightIntensities"
        :saved-tour-configs="savedTourConfigs"
        :current-playing-config="currentPlayingConfig"
        :is-tour-paused="isTourPaused"
        :show-icons="props.showIcons"
        @show-object-list="showObjectList"
        @switch-to-perspective="switchToPerspective"
        @switch-to-orthographic="switchToOrthographic"
        @change-shadow-type="setShadowType"
        @toggle-shadow-preset="toggleShadowPresetInInfo"
        @toggle-fxaa="toggleFxaa"
        @toggle-bloom="toggleBloom"
        @update-bloom-strength="updateBloomStrength"
        @toggle-fog="toggleFog"
        @update-fog-near="updateFogNear"
        @update-fog-far="updateFogFar"
        @update-fog-color="updateFogColor"
        @change-splash-preset="changeSplashPreset"
        @update-gaussian-point-size="updateGaussianPointSize"
        @skybox-enable-change="handleSkyboxEnableChange"
        @update-lights="updateLights"
        @update-radio-group="updateRadioGroup"
        @update-ambient-light="updateAmbientLight"
        @update-directional-light="updateDirectionalLight"
        @update-point-light="updatePointLight"
        @toggle-tour-playback="toggleTourPlayback"
        @replay-tour-config="replayTourConfig"
        @edit-saved-tour-config="editSavedTourConfig"
        @delete-saved-tour-config="deleteSavedTourConfig"
    />

    <!-- 漫游配置弹窗 -->
    <CameraTourDialog
        :visible="showCameraTourDialog"
        :camera-position="cameraPosition"
        :camera-rotation="cameraRotation"
        :editing-config="editingConfigId ? savedTourConfigs.find(c => c.id === editingConfigId) : null"
        :scene-objects="sceneObjects"
        :show-icons="props.showIcons"
        @close="closeCameraTourDialog"
        @save-config="saveCameraTourConfig"
        @add-path-point="addCameraPathPoint"
        @update-path-point="updateCameraPathPoint"
        @locate-path-point="locateCameraPathPoint"
    />

    <!-- 光源配置对话框（模块化组件） -->
    <LightConfigDialog
      v-if="showLightConfigDialog"
      :visible="showLightConfigDialog"
      :show-icons="props.showIcons"
      :custom-lights="customLights"
      :light-types="lightTypes"
      :light-settings="lightSettings"
      :on-open-add-light="openAddLightDialog"
      :on-open-management="openLightManagementDialog"
      :on-reset-default="resetToDefaultLights"
      :on-update-settings="updateLightSettings"
      :on-update-custom-light="updateCustomLight"
      :on-edit-custom-light="editCustomLight"
      :on-delete-custom-light="deleteCustomLight"
      @close="closeLightConfigDialog"
    />

    <!-- 天空盒配置对话框 -->
    <SkyboxConfigDialog
        :visible="showSkyboxConfigDialog"
        :show-icons="props.showIcons"
        :skybox-settings="skyboxSettings"
        :skybox-presets="skyboxPresets"
        @close="closeSkyboxConfigDialog"
        @update-skybox-settings="updateSkyboxSettings"
        @apply-preset="applySkyboxPreset"
        @upload-local-hdri="handleLocalHDRIUpload"
        @upload-cubemap="handleCubemapUpload"
    />

    <!-- 属性编辑器 -->
    <div class="property-editor" v-if="selectedObject">
      <div class="editor-header">
        <h3><span v-if="props.showIcons">📐 </span>属性编辑器</h3>
        <button class="close-btn" @click="clearSelection">✕</button>
      </div>

      <div class="editor-content">
        <!-- 对象信息编辑 -->
        <div class="property-group">
          <h4><span v-if="props.showIcons">📝 </span>对象信息</h4>
          <div class="name-editor">
            <div class="property-row">
              <label>对象名称:</label>
              <input
                  type="text"
                  v-model="objectName"
                  @blur="updateObjectName"
                  @keyup.enter="updateObjectName"
                  class="name-input"
                  placeholder="输入对象名称"
                  maxlength="50"
              />
            </div>
          </div>
        </div>

        <!-- 位置编辑 -->
        <div class="property-group">
          <div class="property-group-header">
            <h4><span v-if="props.showIcons">📍 </span>位置</h4>
            <div class="max-value-setting">
              <div class="property-row">
                <label>滑块最大值:</label>
                <div class="max-input-container">
                  <input
                      type="number"
                      min="1"
                      max="1000"
                      step="1"
                      v-model.number="positionMax"
                      @input="updatePositionMax"
                      class="max-value-input"
                  />
                  <span class="max-value-unit">m</span>
                </div>
              </div>
            </div>
          </div>
          <div class="position-controls">
            <div class="position-slider">
              <div class="property-row">
                <label>X轴位置:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      :min="-positionMax"
                      :max="positionMax"
                      step="0.1"
                      v-model.number="position.x"
                      @input="updatePosition"
                      class="position-slider-input"
                  />
                  <input
                      type="number"
                      :min="-positionMax"
                      :max="positionMax"
                      step="0.1"
                      v-model.number="position.x"
                      @input="updatePosition"
                      @blur="validatePosition"
                      class="position-input"
                  />
                  <span class="position-unit">m</span>
                </div>
              </div>
            </div>
            <div class="position-slider">
              <div class="property-row">
                <label>Y轴位置:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      :min="-positionMax"
                      :max="positionMax"
                      step="0.1"
                      v-model.number="position.y"
                      @input="updatePosition"
                      class="position-slider-input"
                  />
                  <input
                      type="number"
                      :min="-positionMax"
                      :max="positionMax"
                      step="0.1"
                      v-model.number="position.y"
                      @input="updatePosition"
                      @blur="validatePosition"
                      class="position-input"
                  />
                  <span class="position-unit">m</span>
                </div>
              </div>
            </div>
            <div class="position-slider">
              <div class="property-row">
                <label>Z轴位置:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      :min="-positionMax"
                      :max="positionMax"
                      step="0.1"
                      v-model.number="position.z"
                      @input="updatePosition"
                      class="position-slider-input"
                  />
                  <input
                      type="number"
                      :min="-positionMax"
                      :max="positionMax"
                      step="0.1"
                      v-model.number="position.z"
                      @input="updatePosition"
                      @blur="validatePosition"
                      class="position-input"
                  />
                  <span class="position-unit">m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 旋转编辑 -->
        <div class="property-group">
          <h4><span v-if="props.showIcons">🔄 </span>旋转 (度)</h4>
          <div class="rotation-controls">
            <div class="rotation-slider">
              <div class="property-row">
                <label>X轴旋转:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      v-model.number="rotation.x"
                      @input="updateRotation"
                      class="rotation-slider-input"
                  />
                  <input
                      type="number"
                      min="-180"
                      max="180"
                      step="1"
                      v-model.number="rotation.x"
                      @input="updateRotation"
                      @blur="validateRotation"
                      class="rotation-input"
                  />
                  <span class="rotation-unit">°</span>
                </div>
              </div>
            </div>
            <div class="rotation-slider">
              <div class="property-row">
                <label>Y轴旋转:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      v-model.number="rotation.y"
                      @input="updateRotation"
                      class="rotation-slider-input"
                  />
                  <input
                      type="number"
                      min="-180"
                      max="180"
                      step="1"
                      v-model.number="rotation.y"
                      @input="updateRotation"
                      @blur="validateRotation"
                      class="rotation-input"
                  />
                  <span class="rotation-unit">°</span>
                </div>
              </div>
            </div>
            <div class="rotation-slider">
              <div class="property-row">
                <label>Z轴旋转:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      min="-180"
                      max="180"
                      step="1"
                      v-model.number="rotation.z"
                      @input="updateRotation"
                      class="rotation-slider-input"
                  />
                  <input
                      type="number"
                      min="-180"
                      max="180"
                      step="1"
                      v-model.number="rotation.z"
                      @input="updateRotation"
                      @blur="validateRotation"
                      class="rotation-input"
                  />
                  <span class="rotation-unit">°</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 缩放编辑 -->
        <div class="property-group">
          <div class="property-group-header">
            <h4><span v-if="props.showIcons">📏 </span>缩放</h4>

            <div class="max-value-setting">
              <div class="property-row">
                <label>滑块最大值:</label>
                <div class="max-input-container">
                  <input
                      type="number"
                      min="1"
                      max="100"
                      step="0.1"
                      v-model.number="scaleMax"
                      @input="updateScaleMax"
                      class="max-value-input"
                  />
                  <span class="max-value-unit">x</span>
                </div>
              </div>
            </div>
          </div>
          <div class="uniform-scale">
            <label>
              <input
                  type="checkbox"
                  v-model="uniformScale"
                  @change="toggleUniformScale"
              />
              统一缩放
            </label>
          </div>
          <div class="scale-controls">
            <div class="scale-slider">
              <div class="property-row">
                <label>X轴缩放:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      min="0.1"
                      :max="scaleMax"
                      step="0.1"
                      v-model.number="scale.x"
                      @input="updateScale"
                      class="scale-slider-input"
                  />
                  <input
                      type="number"
                      min="0.1"
                      :max="scaleMax"
                      step="0.1"
                      v-model.number="scale.x"
                      @input="updateScale"
                      @blur="validateScale"
                      class="scale-input"
                  />
                  <span class="scale-unit">x</span>
                </div>
              </div>
            </div>
            <div class="scale-slider">
              <div class="property-row">
                <label>Y轴缩放:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      min="0.1"
                      :max="scaleMax"
                      step="0.1"
                      v-model.number="scale.y"
                      @input="updateScale"
                      class="scale-slider-input"
                  />
                  <input
                      type="number"
                      min="0.1"
                      :max="scaleMax"
                      step="0.1"
                      v-model.number="scale.y"
                      @input="updateScale"
                      @blur="validateScale"
                      class="scale-input"
                  />
                  <span class="scale-unit">x</span>
                </div>
              </div>
            </div>
            <div class="scale-slider">
              <div class="property-row">
                <label>Z轴缩放:</label>
                <div class="slider-container">
                  <input
                      type="range"
                      min="0.1"
                      :max="scaleMax"
                      step="0.1"
                      v-model.number="scale.z"
                      @input="updateScale"
                      class="scale-slider-input"
                  />
                  <input
                      type="number"
                      min="0.1"
                      :max="scaleMax"
                      step="0.1"
                      v-model.number="scale.z"
                      @input="updateScale"
                      @blur="validateScale"
                      class="scale-input"
                  />
                  <span class="scale-unit">x</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 动画控制 -->
        <div class="property-group" v-if="hasAnimations">
          <h4><span v-if="props.showIcons">🎬 </span>动画控制</h4>
          <div class="animation-controls">
            <!-- 动画概览 -->
            <div class="animation-overview">
              <div class="overview-item">
                <span>动画数量:</span>
                <span class="highlight">{{ modelAnimations.length }}</span>
              </div>
              <div class="overview-item" v-if="currentAnimation >= 0">
                <span>当前动画:</span>
                <span class="highlight">{{ modelAnimations[currentAnimation]?.name || `动画 ${currentAnimation + 1}` }}</span>
              </div>
              <div class="overview-item" v-if="isPlaying">
                <span>状态:</span>
                <span class="highlight playing">播放中</span>
              </div>
            </div>

            <div class="animation-list">
              <div
                  v-for="(animation, index) in modelAnimations"
                  :key="index"
                  class="animation-item"
                  :class="{ 'active': currentAnimation === index && isPlaying }"
              >
                <div class="animation-info">
                  <div class="animation-header">
                    <span class="animation-name">{{ animation.name || `动画 ${index + 1}` }}</span>
                    <span class="animation-index">#{{ index + 1 }}</span>
                  </div>
                  <div class="animation-details">
                    <span class="animation-duration">⏱️ {{ formatDuration(animation.duration) }}</span>
                    <span class="animation-tracks">🎯 {{ animation.tracks?.length || 0 }} 轨道</span>
                  </div>
                </div>
                <div class="animation-actions">
                  <button
                      @click="playAnimation(index)"
                      class="animation-btn play"
                      :class="{ 'playing': currentAnimation === index && isPlaying }"
                      :title="currentAnimation === index && isPlaying ? '暂停' : '播放'"
                  >
                    {{ currentAnimation === index && isPlaying ? '⏸️' : '▶️' }}
                  </button>
                  <button
                      @click="stopAnimation(index)"
                      class="animation-btn stop"
                      title="停止"
                  >
                    ⏹️
                  </button>
                </div>
              </div>
            </div>

            <div class="animation-settings">
              <div class="setting-item">
                <label>播放速度:</label>
                <input
                    type="range"
                    min="0.1"
                    max="3"
                    step="0.1"
                    v-model.number="animationSpeed"
                    @input="updateAnimationSpeed"
                />
                <span class="speed-value">{{ animationSpeed.toFixed(1) }}x</span>
              </div>

              <div class="setting-item">
                <label>
                  <input
                      type="checkbox"
                      v-model="loopAnimation"
                      @change="toggleLoopAnimation"
                  />
                  循环播放
                </label>
              </div>

              <div class="setting-item">
                <button
                    @click="stopAllAnimations"
                    class="stop-all-btn"
                    title="停止所有动画"
                >
                  ⏹️ 停止所有
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 反射清晰度设置 -->
        <div class="property-group" v-if="isReflectionMaterial">
          <h4><span v-if="props.showIcons">🔍 </span>反射清晰度</h4>
          <div class="reflection-settings">
            <div class="setting-item">
              <label>反射分辨率:</label>
              <div class="slider-container">
                <input
                    type="range"
                    min="256"
                    max="2048"
                    step="256"
                    v-model.number="reflectionSettings.resolution"
                    @input="updateReflectionClarity({ resolution: reflectionSettings.resolution })"
                    class="reflection-slider"
                />
                <span class="value-display">{{ reflectionSettings.resolution }}px</span>
              </div>
              <div class="setting-description">
                分辨率越高，反射越清晰，但性能消耗越大
              </div>
            </div>

            <div class="setting-item">
              <label>表面粗糙度:</label>
              <div class="slider-container">
                <input
                    type="range"
                    min="0"
                    max="0.5"
                    step="0.01"
                    v-model.number="reflectionSettings.roughness"
                    @input="updateReflectionClarity({ roughness: reflectionSettings.roughness })"
                    class="reflection-slider"
                />
                <span class="value-display">{{ reflectionSettings.roughness.toFixed(2) }}</span>
              </div>
              <div class="setting-description">
                0为完全光滑，值越大反射越模糊
              </div>
            </div>

            <div class="setting-item">
              <label>反射强度:</label>
              <div class="slider-container">
                <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    v-model.number="reflectionSettings.envMapIntensity"
                    @input="updateReflectionClarity({ envMapIntensity: reflectionSettings.envMapIntensity })"
                    class="reflection-slider"
                />
                <span class="value-display">{{ reflectionSettings.envMapIntensity.toFixed(1) }}</span>
              </div>
              <div class="setting-description">
                控制反射的亮度强度
              </div>
            </div>

            <div class="setting-item">
              <label>清漆粗糙度:</label>
              <div class="slider-container">
                <input
                    type="range"
                    min="0"
                    max="0.3"
                    step="0.01"
                    v-model.number="reflectionSettings.clearcoatRoughness"
                    @input="updateReflectionClarity({ clearcoatRoughness: reflectionSettings.clearcoatRoughness })"
                    class="reflection-slider"
                />
                <span class="value-display">{{ reflectionSettings.clearcoatRoughness.toFixed(2) }}</span>
              </div>
              <div class="setting-description">
                控制清漆层的表面粗糙度
              </div>
            </div>

            <div class="setting-item">
              <button @click="recreateAllReflectionProbes" class="action-btn">
                <span v-if="props.showIcons">🔄 </span>重新生成反射
              </button>
            </div>

            <div class="setting-item">
              <button @click="resetReflectionSettings" class="action-btn reset-btn">
                <span v-if="props.showIcons">↩️ </span>重置为默认值
              </button>
            </div>
          </div>
        </div>

        <!-- 高亮设置 -->
        <div class="property-group">
          <h4><span v-if="props.showIcons">✨ </span>高亮设置</h4>
          <div class="highlight-settings">
            <label class="setting-item">
              <input
                  type="checkbox"
                  v-model="highlightSettings.enableHighlight"
                  @change="onHighlightEnableChange"
              />
              启用高亮效果
            </label>
            <label class="setting-item" v-if="highlightSettings.enableHighlight">
              <input
                  type="checkbox"
                  v-model="highlightSettings.useSimpleHighlight"
                  @change="onHighlightModeChange"
              />
              简单高亮模式（推荐，性能更好）
            </label>
            <div class="setting-item" v-if="highlightSettings.enableHighlight">
              <label>高亮颜色:</label>
              <input
                  type="color"
                  :value="'#' + highlightSettings.highlightColor.toString(16).padStart(6, '0')"
                  @change="onHighlightColorChange"
              />
            </div>
          </div>
        </div>

        <!-- 快速操作按钮 -->
        <div class="quick-actions">
          <button @click="resetTransform" class="action-btn">
            <span v-if="props.showIcons">🔄 </span>重置变换
          </button>
          <button @click="centerObject" class="action-btn">
            <span v-if="props.showIcons">🎯 </span>居中对象
          </button>
          <button @click="duplicateObject" class="action-btn">
            <span v-if="props.showIcons">📋 </span>复制对象
          </button>
          <button @click="toggleHighlight" class="action-btn" :class="{ 'active': highlightSettings.enableHighlight }">
            <span v-if="props.showIcons">{{ highlightSettings.enableHighlight ? '🔴 ' : '🟢 ' }}</span>{{ highlightSettings.enableHighlight ? '关闭高亮' : '开启高亮' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 添加光源对话框 -->
    <div class="config-dialog" v-if="showAddLightDialog">
      <div class="dialog-overlay" @click="closeAddLightDialog"></div>
      <div class="dialog-content">
        <div class="dialog-header">
          <h3><span v-if="props.showIcons">➕ </span>{{ editingLightId ? '编辑光源' : '添加光源' }}</h3>
          <button class="close-btn" @click="closeAddLightDialog">✕</button>
        </div>

        <div class="dialog-body">
          <div class="config-section">
            <div class="config-item">
              <label>光源名称:</label>
              <input
                  type="text"
                  v-model="newLightForm.name"
                  placeholder="输入光源名称"
                  class="text-input"
              />
            </div>

            <div class="config-item">
              <label>光源类型:</label>
              <select v-model="newLightForm.type" class="select-input">
                <option v-for="type in lightTypes" :key="type.id" :value="type.id">
                  {{ type.icon }} {{ type.name }}
                </option>
              </select>
            </div>

            <div class="config-item">
              <label>强度:</label>
              <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  v-model="newLightForm.intensity"
              />
              <span>{{ newLightForm.intensity.toFixed(1) }}</span>
            </div>

            <div class="config-item">
              <label>颜色:</label>
              <input
                  type="color"
                  v-model="newLightForm.color"
              />
            </div>

            <!-- 位置设置 -->
            <div class="config-section" v-if="newLightForm.type !== 'ambient'">
              <h5>位置设置</h5>
              <div class="config-item">
                <label>X:</label>
                <input
                    type="number"
                    v-model="newLightForm.position.x"
                    step="0.1"
                />
              </div>
              <div class="config-item">
                <label>Y:</label>
                <input
                    type="number"
                    v-model="newLightForm.position.y"
                    step="0.1"
                />
              </div>
              <div class="config-item">
                <label>Z:</label>
                <input
                    type="number"
                    v-model="newLightForm.position.z"
                    step="0.1"
                />
              </div>
            </div>

            <!-- 目标设置（方向光和聚光灯） -->
            <div class="config-section" v-if="newLightForm.type === 'directional' || newLightForm.type === 'spot'">
              <h5>目标设置</h5>
              <div class="config-item">
                <label>目标X:</label>
                <input
                    type="number"
                    v-model="newLightForm.target.x"
                    step="0.1"
                />
              </div>
              <div class="config-item">
                <label>目标Y:</label>
                <input
                    type="number"
                    v-model="newLightForm.target.y"
                    step="0.1"
                />
              </div>
              <div class="config-item">
                <label>目标Z:</label>
                <input
                    type="number"
                    v-model="newLightForm.target.z"
                    step="0.1"
                />
              </div>
            </div>

            <!-- 距离设置（点光源和聚光灯） -->
            <div class="config-section" v-if="newLightForm.type === 'point' || newLightForm.type === 'spot'">
              <div class="config-item">
                <label>距离:</label>
                <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    v-model="newLightForm.distance"
                />
                <span>{{ newLightForm.distance }}</span>
              </div>
            </div>

            <!-- 角度设置（聚光灯） -->
            <div class="config-section" v-if="newLightForm.type === 'spot'">
              <div class="config-item">
                <label>角度:</label>
                <input
                    type="range"
                    min="5"
                    max="60"
                    step="1"
                    v-model="newLightForm.angle"
                />
                <span>{{ newLightForm.angle }}°</span>
              </div>
              <div class="config-item">
                <label>边缘柔和度:</label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    v-model="newLightForm.penumbra"
                />
                <span>{{ newLightForm.penumbra.toFixed(1) }}</span>
              </div>
            </div>

            <!-- 颜色设置（半球光） -->
            <div class="config-section" v-if="newLightForm.type === 'hemisphere'">
              <div class="config-item">
                <label>天空颜色:</label>
                <input
                    type="color"
                    v-model="newLightForm.skyColor"
                />
              </div>
              <div class="config-item">
                <label>地面颜色:</label>
                <input
                    type="color"
                    v-model="newLightForm.groundColor"
                />
              </div>
            </div>

            <!-- 阴影设置 -->
            <div class="config-section" v-if="newLightForm.type !== 'ambient'">
              <div class="config-item">
                <label>
                  <input
                      type="checkbox"
                      v-model="newLightForm.castShadow"
                  />
                  投射阴影
                </label>
              </div>
              <div class="config-item" v-if="newLightForm.castShadow">
                <label>阴影贴图大小:</label>
                <select v-model="newLightForm.shadowMapSize">
                  <option value="512">512</option>
                  <option value="1024">1024</option>
                  <option value="2048">2048</option>
                  <option value="4096">4096</option>
                </select>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="config-section">
              <div class="dialog-actions">
                <button class="btn-primary" @click="saveCustomLight">
                  {{ editingLightId ? '更新光源' : '添加光源' }}
                </button>
                <button class="btn-secondary" @click="closeAddLightDialog">
                  取消
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 对象列表面板 -->
    <div class="object-list-panel" v-if="showObjectListPanel">
      <div class="panel-header">
        <h3><span v-if="props.showIcons">📋 </span>对象列表</h3>
        <button class="close-btn" @click="hideObjectListPanel">✕</button>
      </div>

      <div class="panel-content">
        <div class="object-list">
          <div
              v-for="(object, index) in sceneObjects"
              :key="object.uuid || index"
              class="object-list-item"
              :class="{ active: selectedObject && selectedObject.uuid === object.uuid }"
              @click="selectObjectFromList(object)"
          >
            <div class="object-info">
              <div class="object-name">{{ object.name || `对象 ${index + 1}` }}</div>
              <div class="object-type">{{ object.type }}</div>
            </div>
            <div class="object-actions">
              <button
                  class="action-btn focus-btn"
                  @click.stop="focusOnObject(object)"
                  title="聚焦到对象"
              >
                🔍
              </button>
              <button
                  class="action-btn delete-btn"
                  @click.stop="deleteObject(object)"
                  title="删除对象"
              >
                🗑️
              </button>
            </div>
          </div>

          <div v-if="sceneObjects.length === 0" class="empty-list">
            <p>场景中没有对象</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 模型导入面板 -->
    <div class="import-panel" v-if="showImportPanel">
      <div class="panel-header">
        <h3><span v-if="props.showIcons">📁 </span>模型导入</h3>
        <button class="close-btn" @click="hideImportPanel">✕</button>
      </div>

      <div class="panel-content">
        <!-- 文件拖拽区域 -->
        <div
            class="drop-zone"
            :class="{ 'drag-over': isDragOver }"
            @drop="onFileDrop"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @click="triggerFileInput"
        >
          <div class="drop-content">
            <div class="drop-icon">📁</div>
            <div class="drop-text">
              <p>拖拽模型文件到此处</p>
              <p>或点击选择文件</p>
            </div>
            <div class="supported-formats">
              支持格式: GLTF, GLB, OBJ, FBX, STL
            </div>
          </div>
        </div>

        <!-- 隐藏的文件输入 -->
        <input
            ref="fileInput"
            type="file"
            multiple
            accept=".gltf,.glb,.obj,.fbx,.stl,.dae,.3ds,.ply"
            @change="onFileSelect"
            style="display: none"
        />

        <!-- 导入选项 -->
        <div class="import-options">
          <div class="option-group">
            <label>
              <input
                  type="checkbox"
                  v-model="importOptions.autoScale"
              />
              自动缩放
            </label>
            <label>
              <input
                  type="checkbox"
                  v-model="importOptions.autoCenter"
              />
              自动居中
            </label>
            <label>
              <input
                  type="checkbox"
                  v-model="importOptions.generateShadows"
              />
              生成阴影
            </label>
          </div>

        </div>

        <!-- 导入历史 -->
        <div class="import-history" v-if="importHistory.length > 0">
          <h4>📋 导入历史</h4>
          <div class="history-list">
            <div
                v-for="(item, index) in importHistory"
                :key="index"
                class="history-item"
            >
              <span class="file-name">{{ item.name }}</span>
              <span class="file-size">{{ formatFileSize(item.size) }}</span>
              <button @click="removeImportedModel(item)" class="remove-btn">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 内置模型面板 -->
    <div class="import-panel" v-if="showBuiltinModelsPanel">
      <div class="panel-header">
        <h3><span v-if="props.showIcons">📦 </span>内置模型库</h3>
        <button class="close-btn" @click="hideBuiltinModelsPanel">✕</button>
      </div>

      <div class="panel-content">
        <!-- 模型列表 -->
        <div class="model-list">
          <div
              v-for="model in builtinModels"
              :key="model.id"
              class="model-list-item"
              @click="loadBuiltinModel(model)"
          >
            <div class="model-name">{{ model.name }}</div>
            <div class="model-format">{{ model.format.toUpperCase() }}</div>
            <div class="model-category">{{ model.category }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, shallowRef, computed } from 'vue'
import LightConfigDialog from './LightConfigDialog.vue'
import SceneInfo from './SceneInfo.vue'
import SkyboxConfigDialog from './SkyboxConfigDialog.vue'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { createScene, createCamera, createRenderer, createControls, createLights, createMaterial, createMesh } from '../../utils/threeConfig.js'
import { SceneManager, CameraController, MaterialManager, GeometryManager } from '../../utils/threeHelpers.js'
import { modelLoaderManager, formatFileSize, isSupportedFormat, getFileExtension } from '../../utils/modelLoaders.js'
import { GaussianSplattingLoader, GaussianSplattingController } from '../../utils/gaussianSplatting.js'
import { ParticleSplashSystem, SplashPresets } from '../../utils/particleSplash.js'
import JSZip from 'jszip'
import { ElMessage } from 'element-plus'
import CameraTourDialog from './CameraTourDialog.vue'
import ViewCube from '../ViewCube/index.vue'

import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js'

interface Props {
  activeTool: string
  activeGeometry: string
  activeMaterial: string
  showIcons?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['object-selected'])

// DOM引用
const container = ref<HTMLDivElement>()

const radioGroup = ref('0')

// Three.js相关变量 - 使用 shallowRef 避免深度响应式包装
const scene = shallowRef<THREE.Scene>()
const camera = shallowRef<THREE.Camera>()
const cameraMode = ref<'perspective' | 'orthographic'>('perspective')
const renderer = shallowRef<THREE.WebGLRenderer>()
const controls = shallowRef<OrbitControls>()
const raycaster = shallowRef<THREE.Raycaster>()
const mouse = shallowRef<THREE.Vector2>()
// 后处理组件
let composer: EffectComposer | null = null
let renderPass: RenderPass | null = null
let fxaaPass: ShaderPass | null = null
let bloomPass: UnrealBloomPass | null = null
const currentOrthoFrustumSize = ref(20)
const shadowPreset = ref<'performance' | 'quality'>('performance')

// 高斯泼溅和粒子系统
const gaussianSplatLoader = new GaussianSplattingLoader()
let gaussianSplatControllers: GaussianSplattingController[] = []
let particleSplashSystem: ParticleSplashSystem | null = null
const selectedSplashPreset = ref('water')
const gaussianPointSize = ref(0.08) // 增加默认点大小，减少"马赛克"效果
const shadowTypeLabel = computed(() => {
  if (!renderer.value) return '未知'
  const type = renderer.value.shadowMap.type
  if (type === THREE.BasicShadowMap) return 'Basic'
  if (type === THREE.PCFShadowMap) return 'PCF'
  if (type === THREE.PCFSoftShadowMap) return 'PCFSoft'
  if (type === THREE.VSMShadowMap) return 'VSM'
  return '未知'
})

// 后处理与雾状态（占位：FXAA/Bloom 需接入后处理管线）
const fxaaEnabled = ref(false)
const bloomEnabled = ref(false)
const bloomStrength = ref(0.6)
const fogEnabled = ref(false)
const fogNear = ref(5)
const fogFar = ref(50)
const fogColor = ref('#1a1a1a')

// 管理器
let sceneManager: SceneManager
let cameraController: CameraController
let materialManager: MaterialManager
let geometryManager: GeometryManager

// 光源对象
const ambientLight = shallowRef<THREE.AmbientLight>()
const directionalLight = shallowRef<THREE.DirectionalLight>()
const pointLight = shallowRef<THREE.PointLight>()
const spotLight = shallowRef<THREE.SpotLight>()
const hemisphereLight = shallowRef<THREE.HemisphereLight>()
const skybox = shallowRef<THREE.Mesh>()

// 场景状态
const sceneObjects = shallowRef<any[]>([])
const selectedObject = shallowRef<any>(null)
const isGridVisible = ref(true)
const isAxesVisible = ref(true)

// 漫游配置状态
const showCameraTourDialog = ref(false)
const cameraPosition = ref({ x: 0, y: 0, z: 0 })
const cameraRotation = ref({ x: 0, y: 0, z: 0 })
const cameraTarget = ref({ x: 0, y: 0, z: 0 })
const cameraTourConfig = ref<any>(null)
const isCameraTouring = ref(false)
const savedTourConfigs = ref<any[]>([])
const editingConfigId = ref<string | null>(null)

// 光源配置状态
const showLightConfigDialog = ref(false)
const showLightManagementDialog = ref(false)
const showAddLightDialog = ref(false)
const editingLightId = ref(null)

// 自定义光源列表
const customLights = ref([])

// 光源类型定义
const lightTypes = [
  { id: 'ambient', name: '环境光', icon: '🌅' },
  { id: 'directional', name: '方向光', icon: '☀️' },
  { id: 'point', name: '点光源', icon: '💡' },
  { id: 'spot', name: '聚光灯', icon: '🔦' },
  { id: 'hemisphere', name: '半球光', icon: '🌌' }
]

// 新建光源表单
const newLightForm = ref({
  id: '',
  name: '',
  type: 'directional',
  enabled: true,
  intensity: 1.0,
  color: '#ffffff',
  position: { x: 0, y: 10, z: 0 },
  target: { x: 0, y: 0, z: 0 },
  distance: 100,
  angle: 30,
  penumbra: 0.1,
  skyColor: '#87CEEB',
  groundColor: '#98FB98',
  castShadow: false,
  shadowMapSize: 1024
})

// 基础光源设置（保持兼容性）
const lightSettings = ref({
  // 环境光
  ambientIntensity: 0.4,
  ambientColor: '#ffffff',

  // 方向光（主光源）
  directionalIntensity: 1.0,
  directionalColor: '#ffffff',
  directionalPosition: { x: 10, y: 10, z: 5 },
  directionalTarget: { x: 0, y: 0, z: 0 },

  // 点光源
  pointIntensity: 0.8,
  pointColor: '#ffffff',
  pointPosition: { x: 0, y: 5, z: 0 },
  pointDistance: 100,

  // 聚光灯
  spotIntensity: 1.0,
  spotColor: '#ffffff',
  spotPosition: { x: 0, y: 10, z: 0 },
  spotTarget: { x: 0, y: 0, z: 0 },
  spotAngle: 30,
  spotPenumbra: 0.1,
  spotDistance: 100,

  // 半球光
  hemisphereIntensity: 0.6,
  hemisphereSkyColor: '#87CEEB',
  hemisphereGroundColor: '#98FB98',
  hemispherePosition: { x: 0, y: 10, z: 0 }
})

// 天空盒配置状态
const showSkyboxConfigDialog = ref(false)
// 保存默认背景
const defaultBackground = ref<THREE.Color | THREE.Texture | null>(null)
const defaultEnvironment = ref<THREE.Texture | null>(null)

const skyboxSettings = ref({
  enabled: false,
  type: 'hdri' as 'gradient' | 'cubemap' | 'hdri',
  topColor: '#87CEEB',
  bottomColor: '#98FB98',
  horizonColor: '#F0F8FF',
  currentPreset: '',
  customCubemap: {
    posx: null as string | null, // 右
    negx: null as string | null, // 左
    posy: null as string | null, // 上
    negy: null as string | null, // 下
    posz: null as string | null, // 前
    negz: null as string | null  // 后
  },
  hdriUrl: '',
  hdriIntensity: 1.0
})

// 天空盒预设
const skyboxPresets = ref<any[]>([
  // 渐变预设
  {
    id: 'default',
    name: '默认渐变',
    type: 'gradient',
    colors: {
      top: '#87CEEB',    // 天蓝色 - 天空
      bottom: '#98FB98', // 浅绿色 - 地面
      horizon: '#F0F8FF' // 淡蓝色 - 地平线
    }
  },
  {
    id: 'sunset',
    name: '日落',
    type: 'gradient',
    colors: {
      top: '#FF6B6B',    // 橙红色 - 天空
      bottom: '#4ECDC4', // 青蓝色 - 地面
      horizon: '#FFE66D' // 金黄色 - 地平线
    }
  },
  {
    id: 'night',
    name: '夜晚',
    type: 'gradient',
    colors: {
      top: '#1a1a2e',    // 深蓝色 - 天空
      bottom: '#16213e', // 深色 - 地面
      horizon: '#0f3460' // 深蓝色 - 地平线
    }
  },
  {
    id: 'forest',
    name: '森林',
    type: 'gradient',
    colors: {
      top: '#87CEEB',    // 天蓝色 - 天空
      bottom: '#228B22', // 森林绿 - 地面
      horizon: '#90EE90' // 浅绿色 - 地平线
    }
  },
  {
    id: 'desert',
    name: '沙漠',
    type: 'gradient',
    colors: {
      top: '#FFD700',    // 金黄色 - 天空
      bottom: '#CD853F', // 棕色 - 地面
      horizon: '#F4A460' // 沙黄色 - 地平线
    }
  },
  // 本地HDRI预设 - 从public/HDRI目录加载
  {
    id: 'citrus_garden',
    name: '柑橘园天空',
    type: 'hdri',
    url: '/HDRI/柑橘园_纯净天空.exr',
    category: '自然',
    description: '柑橘园的纯净天空，清新自然光照'
  },
  {
    id: 'clear_sky',
    name: '晴朗天空',
    type: 'hdri',
    url: '/HDRI/晴朗天空.exr',
    category: '天空',
    description: '阳光明媚的晴朗天空，适合户外场景'
  },
  {
    id: 'parsendorf_snow',
    name: '帕森多夫雪景',
    type: 'hdri',
    url: '/HDRI/帕森多夫雪景.exr',
    category: '雪景',
    description: '帕森多夫的雪景环境，纯净的冬日氛围'
  }
])

// 漫游播放控制状态
const currentPlayingConfig = ref<any>(null)
const isTourPaused = ref(false)
const tourStartTime = ref(0)
const tourPauseTime = ref(0)
const tourTotalDuration = ref(0)

// 属性编辑器动画控制状态
const originalAnimationTimeScale = ref(1.0)
const wasAnimationPlayingBeforeEditor = ref(false)

// 多模型动画管理
const modelAnimationStates = ref<Map<string, any>>(new Map())
const modelAnimationMixers = ref<Map<string, THREE.AnimationMixer>>(new Map())

// 停止其他模型的动画（已废弃，现在支持多模型同时播放）
const stopOtherModelAnimations = (currentModelId: string) => {
  // 不再停止其他模型的动画，允许多模型同时播放
  console.log(`模型 ${currentModelId} 开始播放动画，其他模型动画继续播放`)
}

// 获取所有正在播放动画的模型信息
const getPlayingAnimationsInfo = () => {
  const playingInfo: any[] = []

  modelAnimationStates.value.forEach((state, modelId) => {
    if (state.isPlaying && state.currentAnimation >= 0) {
      const mixer = modelAnimationMixers.value.get(modelId)
      if (mixer) {
        playingInfo.push({
          modelId,
          modelName: state.modelName || modelId,
          currentAnimation: state.currentAnimation,
          animationName: state.modelAnimations[state.currentAnimation]?.name || '未命名',
          isPlaying: state.isPlaying,
          animationSpeed: state.animationSpeed,
          loopAnimation: state.loopAnimation
        })
      }
    }
  })

  return playingInfo
}

// 保存模型动画状态
const saveModelAnimationState = (model: any) => {
  if (!model) return

  const modelId = model.uuid

  // 保存当前模型的动画混合器
  if (animationMixer) {
    modelAnimationMixers.value.set(modelId, animationMixer)
  }

  const state = {
    modelName: model.name || modelId,
    hasAnimations: hasAnimations.value,
    modelAnimations: [...modelAnimations.value],
    currentAnimation: currentAnimation.value,
    isPlaying: isPlaying.value,
    animationSpeed: animationSpeed.value,
    loopAnimation: loopAnimation.value
  }

  modelAnimationStates.value.set(modelId, state)
  console.log(`保存模型 ${model.name || modelId} 的动画状态:`, {
    hasAnimations: state.hasAnimations,
    currentAnimation: state.currentAnimation,
    isPlaying: state.isPlaying
  })
}

// 恢复模型动画状态
const restoreModelAnimationState = (model: any) => {
  if (!model) return false

  const modelId = model.uuid
  const state = modelAnimationStates.value.get(modelId)
  const savedMixer = modelAnimationMixers.value.get(modelId)

  if (state && savedMixer) {
    // 恢复动画混合器
    animationMixer = savedMixer

    // 恢复动画状态
    hasAnimations.value = state.hasAnimations
    modelAnimations.value = [...state.modelAnimations]
    currentAnimation.value = state.currentAnimation
    isPlaying.value = state.isPlaying
    animationSpeed.value = state.animationSpeed
    loopAnimation.value = state.loopAnimation

    console.log(`恢复模型 ${model.name || modelId} 的动画状态:`, {
      hasAnimations: hasAnimations.value,
      currentAnimation: currentAnimation.value,
      isPlaying: isPlaying.value,
      animationCount: modelAnimations.value.length
    })

    // 如果动画正在播放，重新启动
    if (isPlaying.value && currentAnimation.value >= 0 && animationMixer) {
      const animation = modelAnimations.value[currentAnimation.value]
      const action = animationMixer.clipAction(animation)

      // 重新设置动画参数
      action.timeScale = animationSpeed.value
      if (loopAnimation.value) {
        action.setLoop(THREE.LoopRepeat, Infinity)
      } else {
        action.setLoop(THREE.LoopOnce, 1)
      }

      if (!action.isRunning()) {
        action.play()
        console.log('重新启动动画播放:', animation.name)
      } else {
        console.log('动画已在播放中:', animation.name)
      }
    }

    return true // 表示成功恢复了状态
  }

  return false // 表示没有找到保存的状态
}

// 获取播放按钮图标
const getPlayButtonIcon = (config: any) => {
  if (currentPlayingConfig.value?.id === config.id) {
    return isTourPaused.value ? '▶️' : '⏸️'
  }
  return '▶️'
}

// 获取播放按钮标题
const getPlayButtonTitle = (config: any) => {
  if (currentPlayingConfig.value?.id === config.id) {
    return isTourPaused.value ? '继续播放' : '暂停'
  }
  return '播放漫游'
}

// 监听属性编辑器状态变化
watch(selectedObject, (newSelectedObject, oldSelectedObject) => {
  // 当属性编辑器打开时（选中对象），暂停动画
  if (newSelectedObject && !oldSelectedObject) {
    // 暂停模型动画
    if (isPlaying.value && animationMixer && animationMixer.timeScale > 0) {
      pauseAnimationForPropertyEditor()
    }
    // 暂停漫游动画
    if (isCameraTouring.value && !isTourPaused.value) {
      pauseTourForPropertyEditor()
    }
  }
  // 当属性编辑器关闭时（取消选中），恢复动画
  else if (!newSelectedObject && oldSelectedObject) {
    // 恢复模型动画
    if (wasAnimationPlayingBeforeEditor.value && animationMixer) {
      resumeAnimationFromPropertyEditor()
    }
    // 恢复漫游动画
    if (isCameraTouring.value && !isTourPaused.value) {
      resumeTourFromPropertyEditor()
    }
  }
})

// 暂停动画（用于属性编辑器）
const pauseAnimationForPropertyEditor = () => {
  if (!animationMixer || !isPlaying.value) return

  // 保存原始时间缩放
  originalAnimationTimeScale.value = animationMixer.timeScale
  wasAnimationPlayingBeforeEditor.value = true

  // 暂停所有动画动作
  animationMixer.timeScale = 0
  console.log('属性编辑器打开，暂停动画，原始时间缩放:', originalAnimationTimeScale.value)
}

// 恢复动画（用于属性编辑器）
const resumeAnimationFromPropertyEditor = () => {
  if (!animationMixer || !wasAnimationPlayingBeforeEditor.value) return

  // 恢复原始时间缩放
  animationMixer.timeScale = originalAnimationTimeScale.value
  wasAnimationPlayingBeforeEditor.value = false
  console.log('属性编辑器关闭，恢复动画，时间缩放:', originalAnimationTimeScale.value)

  // 确保当前动画继续播放
  if (currentAnimation.value >= 0 && isPlaying.value) {
    const animation = modelAnimations.value[currentAnimation.value]
    const action = animationMixer.clipAction(animation)
    if (!action.isRunning()) {
      action.play()
      console.log('重新启动动画播放')
    }
  }
}

// 暂停漫游（用于属性编辑器）
const pauseTourForPropertyEditor = () => {
  if (!isCameraTouring.value || isTourPaused.value) return

  // 暂停漫游动画循环
  if (tourAnimation.value) {
    cancelAnimationFrame(tourAnimation.value)
    tourAnimation.value = null
  }
  console.log('属性编辑器打开，暂停漫游')
}

// 恢复漫游（用于属性编辑器）
const resumeTourFromPropertyEditor = () => {
  if (!isCameraTouring.value || isTourPaused.value) return

  // 重新开始漫游动画循环
  startTourAnimation()
  console.log('属性编辑器关闭，恢复漫游')
}

// 重播漫游配置
const replayTourConfig = (config: any) => {
  console.log('重播漫游配置:', config)

  if (config.points && config.points.length >= 2) {
    // 停止当前播放的漫游
    if (currentPlayingConfig.value) {
      stopTourPlayback()
    }

    // 设置当前播放配置
    currentPlayingConfig.value = config
    isTourPaused.value = false
    tourTotalDuration.value = config.duration || 10

    // 创建路径可视化
    createPathVisualization(config.points, config.pathType)

    // 开始漫游
    const tourData = {
      points: config.points,
      pathType: config.pathType,
      mode: config.mode,
      duration: config.duration,
      speed: config.speed,
      loop: config.loop,
      isPlaying: true
    }

    playCameraTour(tourData)

    ElMessage.success('开始重播漫游')
  } else {
    ElMessage.warning('配置中没有足够的路径点')
  }
}

// 漫游路径可视化 - 使用shallowRef避免深度响应式包装
const pathPoints = shallowRef<any[]>([])
const pathLine = shallowRef<any>(null)
const tourAnimation = shallowRef<any>(null)

// 高亮设置
const highlightSettings = ref({
  useSimpleHighlight: true, // 使用简单高亮（推荐，性能更好）
  highlightColor: 0x888888, // 高亮颜色（改为灰色，不那么刺眼）
  highlightOpacity: 0.3, // 高亮透明度（降低透明度）
  enableHighlight: true // 是否启用高亮效果
})

// 属性编辑器状态
const objectName = ref('')
const position = ref({ x: 0, y: 0, z: 0 })
const rotation = ref({ x: 0, y: 0, z: 0 })
const scale = ref({ x: 1, y: 1, z: 1 })
const uniformScale = ref(true)

// 滑块最大值设置
const positionMax = ref(20)
const scaleMax = ref(20)

// 模型导入状态
const isDragOver = ref(false)
const importOptions = ref({
  autoScale: true,
  autoCenter: true,
  generateShadows: true
})
const importHistory = ref<any[]>([])
const fileInput = ref<HTMLInputElement>()
const showImportPanel = ref(false)
const showBuiltinModelsPanel = ref(false)

// 对象列表面板状态
const showObjectListPanel = ref(false)

// 内置模型列表
const builtinModels = ref([
  // 服务器设备
  // { id: 'server-1', name: '服务器机柜', path: '/model/1服务器机柜.glb', format: 'glb', icon: '🖥️', category: '服务器设备' },
  // { id: 'power-1', name: '配电柜', path: '/model/2配电柜.glb', format: 'glb', icon: '⚡', category: '电力设备' },
  // { id: 'power-2', name: '配电柜1', path: '/model/2配电柜1.glb', format: 'glb', icon: '⚡', category: '电力设备' },
  // { id: 'power-3', name: '配电柜2', path: '/model/2配电柜2.glb', format: 'glb', icon: '⚡', category: '电力设备' },
  // { id: 'ac-1', name: '空调柜', path: '/model/3空调柜.glb', format: 'glb', icon: '❄️', category: '空调设备' },
  // { id: 'ac-2', name: '精密空调模组', path: '/model/4精密空调模组.glb', format: 'glb', icon: '🌡️', category: '空调设备' },
  // { id: 'ac-3', name: '精密空调模组嵌入', path: '/model/5精密空调模组嵌入.glb', format: 'glb', icon: '🌡️', category: '空调设备' },
  // { id: 'channel-1', name: '冷通道框架', path: '/model/6冷通道框架.glb', format: 'glb', icon: '🏗️', category: '基础设施' },
  // { id: 'channel-2', name: '冷通道框架半个', path: '/model/6冷通道框架半个.glb', format: 'glb', icon: '🏗️', category: '基础设施' },
  // { id: 'channel-3', name: '冷通道框架半个1', path: '/model/6冷通道框架半个1.glb', format: 'glb', icon: '🏗️', category: '基础设施' },
  // { id: 'sensor-1', name: '温湿度计', path: '/model/温湿度计.glb', format: 'glb', icon: '🌡️', category: '传感器' },

  // 演示模型
  { id: 'demo-3', name: '法拉利', path: '/model/法拉利.glb', format: 'glb', icon: '🏎️', category: '演示模型' },
  { id: 'demo-3', name: '星际飞船-（FBX 7.4二进制）', path: '/model/星际飞船-（FBX 7.4二进制）.fbx', format: 'fbx', icon: '🏎️', category: '演示模型' },
  { id: 'demo-3', name: '杂货铺卡通小房子', path: '/model/杂货铺卡通小房子.fbx', format: 'fbx', icon: '🏙️', category: '演示模型' },
  { id: 'demo-1', name: '机器人', path: '/model/机器人.glb', format: 'glb', icon: '🤖', category: '演示模型' },
  { id: 'demo-2', name: 'X机器人', path: '/model/X机器人.glb', format: 'glb', icon: '🤖', category: '演示模型' },
  { id: 'demo-4', name: '火烈鸟', path: '/model/火烈鸟.glb', format: 'glb', icon: '🦩', category: '演示模型' },
  { id: 'demo-5', name: '小东京', path: '/model/小东京.glb', format: 'glb', icon: '🏙️', category: '演示模型' },
  { id: 'demo-6', name: '李·佩里·史密斯', path: '/model/李·佩里·史密斯.glb', format: 'glb', icon: '👤', category: '演示模型' },
  { id: 'demo-7', name: '头盔损坏', path: '/model/头盔损坏.gltf', format: 'gltf', icon: '🪖', category: '演示模型' },
  { id: 'demo-8', name: '冲锋队员', path: '/model/冲锋队员.dae', format: 'dae', icon: '👨‍🚀', category: '演示模型' },
  { id: 'demo-9', name: '桑巴舞', path: '/model/桑巴舞.fbx', format: 'fbx', icon: '💃', category: '演示模型' },
  { id: 'demo-10', name: '卡车', path: '/model/卡车.3mf', format: '3mf', icon: '🚛', category: '演示模型' },

  // 新增模型
  { id: 'demo-11', name: '变形金刚', path: '/model/变形金刚.glb', format: 'glb', icon: '🤖', category: '演示模型' },
])

// 灯光控制状态
const lightIntensities = ref({
  ambient: 0.8,
  directional: 1.2,
  point: 0.8
})

// 点光源引用（已移动到shallowRef）

// 动画控制状态
const hasAnimations = ref(false)
const modelAnimations = ref<any[]>([])
const currentAnimation = ref(-1)
const isPlaying = ref(false)
const animationSpeed = ref(1.0)
const loopAnimation = ref(true)

// 动画相关引用
let animationMixer: THREE.AnimationMixer | null = null
let clock = new THREE.Clock()

// 鼠标事件状态
let isMouseDown = false
let mouseStartPosition = new THREE.Vector2()
let selectedObjectStartPosition = new THREE.Vector3()
let selectedObjectStartRotation = new THREE.Euler()
let selectedObjectStartScale = new THREE.Vector3()

// 移动工具状态
let isMoving = false
let moveStartPosition = { x: 0, z: 0 }

// 三轴控制器状态
let transformControls = null
let isDraggingAxis = false
let draggedAxis = null
let dragStartPosition = new THREE.Vector3()
let axisMaterials = { X: null, Y: null, Z: null }
let axisLines = { X: null, Y: null, Z: null }

// 创建三轴控制器
const createTransformControls = () => {
  if (transformControls) {
    scene.value.remove(transformControls)
  }

  // 创建自定义的三轴控制器
  transformControls = new THREE.Group()
  transformControls.name = 'TransformControls'

  // 创建X轴（红色）
  const xAxis = createAxis('X', 0xff0000, new THREE.Vector3(1, 0, 0))
  // 创建Y轴（绿色）
  const yAxis = createAxis('Y', 0x00ff00, new THREE.Vector3(0, 1, 0))
  // 创建Z轴（蓝色）
  const zAxis = createAxis('Z', 0x0000ff, new THREE.Vector3(0, 0, 1))

  transformControls.add(xAxis, yAxis, zAxis)
  transformControls.visible = false

  scene.value.add(transformControls)
}

// 创建单个轴
const createAxis = (name, color, direction) => {
  const group = new THREE.Group()
  group.name = `Axis_${name}`

  // 创建轴线的几何体（使用线条而不是圆柱体）
  const points = [
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3().copy(direction).multiplyScalar(2)
  ]
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points)

  // 创建轴线的材质
  const lineMaterial = new THREE.LineBasicMaterial({
    color: color,
    linewidth: 3,
    transparent: true,
    opacity: 0.8
  })

  // 创建轴线
  const line = new THREE.Line(lineGeometry, lineMaterial)
  line.name = `AxisLine_${name}`

  // 创建箭头几何体（更细长的箭头）
  const arrowGeometry = new THREE.ConeGeometry(0.08, 0.4, 12)
  const arrowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.9
  })
  const arrow = new THREE.Mesh(arrowGeometry, arrowMaterial)
  arrow.name = `AxisArrow_${name}`

  // 设置箭头位置和旋转
  arrow.position.copy(direction).multiplyScalar(2.2)
  arrow.lookAt(direction)

  // 创建轴端点的球体（更小更精致）
  const sphereGeometry = new THREE.SphereGeometry(0.05, 8, 6)
  const sphereMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.7
  })
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
  sphere.name = `AxisSphere_${name}`
  sphere.position.copy(direction).multiplyScalar(2)

  // 添加文字标签（更清晰的样式）
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const context = canvas.getContext('2d')

  // 绘制背景圆形
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'
  context.beginPath()
  context.arc(64, 64, 30, 0, Math.PI * 2)
  context.fill()

  // 绘制文字
  context.fillStyle = '#ffffff'
  context.font = 'bold 48px Arial'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(name, 64, 64)

  const texture = new THREE.CanvasTexture(canvas)
  const labelMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    alphaTest: 0.1
  })
  const label = new THREE.Sprite(labelMaterial)
  label.name = `AxisLabel_${name}`
  label.position.copy(direction).multiplyScalar(2.5)
  label.scale.setScalar(0.4)

  // 创建交互区域（不可见的圆柱体，用于鼠标检测）
  const interactionGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8)
  const interactionMaterial = new THREE.MeshBasicMaterial({
    visible: false,
    transparent: true,
    opacity: 0
  })
  const interaction = new THREE.Mesh(interactionGeometry, interactionMaterial)
  interaction.name = `AxisInteraction_${name}`
  interaction.position.copy(direction).multiplyScalar(1.25)
  interaction.lookAt(direction)

  group.add(line, arrow, sphere, label, interaction)

  // 存储材质引用，用于变色
  axisMaterials[name] = { line: lineMaterial, arrow: arrowMaterial, sphere: sphereMaterial }
  axisLines[name] = line

  // 添加交互检测
  group.userData = {
    axis: name,
    direction: direction.clone(),
    originalColor: color,
    isHovered: false,
    isSelected: false
  }

  return group
}

// 更新三轴控制器位置
const updateTransformControls = () => {
  if (transformControls && selectedObject.value) {
    transformControls.position.copy(selectedObject.value.position)
    transformControls.visible = props.activeTool === 'move'
  } else if (transformControls) {
    transformControls.visible = false
  }
}

// 设置轴的颜色状态
const setAxisColor = (axisName, state) => {
  if (!axisMaterials[axisName]) return

  const materials = axisMaterials[axisName]
  const axisGroup = transformControls?.children.find(child => child.name === `Axis_${axisName}`)
  if (!axisGroup) return

  let targetColor
  let opacity = 0.8

  switch (state) {
    case 'normal':
      targetColor = axisGroup.userData.originalColor
      opacity = 0.8
      axisGroup.userData.isHovered = false
      axisGroup.userData.isSelected = false
      break
    case 'hover':
      targetColor = 0xffff00 // 黄色高亮
      opacity = 1.0
      axisGroup.userData.isHovered = true
      break
    case 'selected':
      targetColor = 0xff8800 // 橙色选中
      opacity = 1.0
      axisGroup.userData.isSelected = true
      break
  }

  // 更新所有材质颜色
  materials.line.color.setHex(targetColor)
  materials.line.opacity = opacity
  materials.arrow.color.setHex(targetColor)
  materials.arrow.opacity = opacity
  materials.sphere.color.setHex(targetColor)
  materials.sphere.opacity = opacity
}

// 重置所有轴颜色
const resetAllAxisColors = () => {
  if (!transformControls) return

  transformControls.children.forEach(child => {
    if (child.name.startsWith('Axis_')) {
      const axisName = child.name.replace('Axis_', '')
      setAxisColor(axisName, 'normal')
    }
  })
}

// 获取鼠标点击的相交对象
const getMouseIntersections = (event: MouseEvent) => {
  if (!camera.value || !scene.value) return []

  // 计算鼠标位置
  const rect = renderer.value.domElement.getBoundingClientRect()
  const mouse = new THREE.Vector2()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // 创建射线
  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera.value)

  // 获取相交对象
  const intersects = raycaster.intersectObjects(scene.value.children, true)
  return intersects
}

// 初始化场景
const initScene = () => {
  if (!container.value) return

  // 创建场景
  scene.value = createScene()

  // 创建相机
  const aspect = container.value.clientWidth / container.value.clientHeight
  camera.value = createCamera(aspect)
  cameraMode.value = 'perspective'

  // 创建渲染器
  renderer.value = createRenderer(container.value)
  container.value.appendChild(renderer.value.domElement)

  // 创建控制器
  controls.value = createControls(camera.value, renderer.value)

  // 初始化后处理
  composer = new EffectComposer(renderer.value)
  renderPass = new RenderPass(scene.value, camera.value as THREE.Camera)
  composer.addPass(renderPass)
  
  // FXAA Pass（默认禁用，仅在开启时使用）
  fxaaPass = new ShaderPass(FXAAShader)
  const pixelRatio = renderer.value.getPixelRatio()
  fxaaPass.material.uniforms['resolution'].value.x = 1 / (container.value.clientWidth * pixelRatio)
  fxaaPass.material.uniforms['resolution'].value.y = 1 / (container.value.clientHeight * pixelRatio)
  
  // Bloom Pass（默认禁用，仅在开启时使用）
  const bloomResolution = new THREE.Vector2(container.value.clientWidth, container.value.clientHeight)
  bloomPass = new UnrealBloomPass(bloomResolution, bloomStrength.value, 0.4, 0.85)

  // 创建三轴控制器
  createTransformControls()

  // 监听工具变化，控制相机操作
  watch(() => props.activeTool, (newTool) => {
    if (controls.value) {
      if (newTool === 'move') {
        // 移动工具时禁用左键旋转
        controls.value.enableRotate = false
        controls.value.mouseButtons = {
          LEFT: null, // 禁用左键
          MIDDLE: THREE.MOUSE.DOLLY, // 中键缩放
          RIGHT: THREE.MOUSE.ROTATE // 右键旋转
        }
      } else {
        // 其他工具时恢复默认设置
        controls.value.enableRotate = true
        controls.value.mouseButtons = {
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.DOLLY,
          RIGHT: THREE.MOUSE.PAN
        }
      }
    }
  })

  // 创建基础光源
  const lights = createLights()
  lights.forEach((light, index) => {
    scene.value.add(light)
    // 保存灯光引用以便控制
    if (index === 0) ambientLight.value = light as THREE.AmbientLight
    else if (index === 1) directionalLight.value = light as THREE.DirectionalLight
    else if (index === 2) pointLight.value = light as THREE.PointLight
  })

  // 创建额外的光源
  initAdditionalLights()

  // 保存默认背景
  if (scene.value) {
    defaultBackground.value = scene.value.background
    defaultEnvironment.value = scene.value.environment
  }

  // 初始化天空盒
  initSkybox()

  // 初始化粒子泼溅系统
  particleSplashSystem = new ParticleSplashSystem(scene.value)

  // 创建管理器
  sceneManager = new SceneManager(scene.value)
  cameraController = new CameraController(camera.value, controls.value)
  materialManager = new MaterialManager()
  geometryManager = new GeometryManager()

  // 创建网格和坐标轴
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222)
  gridHelper.name = 'grid'
  gridHelper.receiveShadow = true // 网格接收阴影
  scene.value.add(gridHelper)

  const axesHelper = new THREE.AxesHelper(5)
  axesHelper.name = 'axes'
  scene.value.add(axesHelper)

  // 添加地面平面以增强阴影效果
  const groundGeometry = new THREE.PlaneGeometry(40, 40)
  const groundMaterial = new THREE.MeshLambertMaterial({
    color: 0x2a2a2a,
    transparent: true,
    opacity: 0.8
  })
  const ground = new THREE.Mesh(groundGeometry, groundMaterial)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.01 // 稍微低于网格
  ground.receiveShadow = true
  ground.name = 'ground'
  scene.value.add(ground)

  // 创建射线检测器
  raycaster.value = new THREE.Raycaster()
  mouse.value = new THREE.Vector2()

  // 添加事件监听器
  addEventListeners()

  // 开始渲染循环
  animate()
}



// 添加事件监听器
const addEventListeners = () => {
  if (!renderer.value.domElement) return

  renderer.value.domElement.addEventListener('mousedown', onMouseDown)
  renderer.value.domElement.addEventListener('mousemove', onMouseMove)
  renderer.value.domElement.addEventListener('mouseup', onMouseUp)
  renderer.value.domElement.addEventListener('click', onMouseClick)
  window.addEventListener('resize', onWindowResize)
}

// 鼠标按下事件（支持选择和移动工具）
const onMouseDown = (event: MouseEvent) => {
  isMouseDown = true
  mouseStartPosition.set(event.clientX, event.clientY)

  // 如果是移动工具，检查是否点击了三轴控制器
  if (props.activeTool === 'move' && selectedObject.value && transformControls) {
    const intersects = getMouseIntersections(event)

    // 检查是否点击了轴
    for (const intersect of intersects) {
      if (intersect.object.parent && intersect.object.parent.userData.axis) {
        event.preventDefault()
        isDraggingAxis = true
        draggedAxis = intersect.object.parent.userData.axis

        // 设置选中状态
        resetAllAxisColors()
        setAxisColor(draggedAxis, 'selected')

        dragStartPosition.copy(selectedObject.value.position)
        return
      }
    }

    // 如果没有点击轴，重置所有轴颜色
    resetAllAxisColors()
    // 在移动模式下不自动开始移动，需要用户拖拽空白区域
  }
}

// 鼠标移动事件（支持移动工具）
const onMouseMove = (event: MouseEvent) => {
  // 如果是移动工具，检查悬停效果
  if (props.activeTool === 'move' && selectedObject.value && transformControls && !isDraggingAxis) {
    const intersects = getMouseIntersections(event)
    let hoveredAxis = null

    // 检查是否悬停在轴上
    for (const intersect of intersects) {
      if (intersect.object.parent && intersect.object.parent.userData.axis) {
        hoveredAxis = intersect.object.parent.userData.axis
        break
      }
    }

    // 更新悬停状态
    if (hoveredAxis) {
      resetAllAxisColors()
      setAxisColor(hoveredAxis, 'hover')
    } else {
      resetAllAxisColors()
    }
  }

  // 如果是移动工具且鼠标按下，开始自由移动
  if (props.activeTool === 'move' && isMouseDown && selectedObject.value && !isDraggingAxis && !isMoving) {
    // 检查是否点击了有效对象（不是轴）
    const intersects = getMouseIntersections(event)
    let clickedOnAxis = false

    for (const intersect of intersects) {
      if (intersect.object.parent && intersect.object.parent.userData.axis) {
        clickedOnAxis = true
        break
      }
    }

    // 如果没有点击轴，开始自由移动
    if (!clickedOnAxis) {
      isMoving = true
      moveStartPosition = {
        x: selectedObject.value.position.x,
        z: selectedObject.value.position.z
      }
    }
  }

  // 如果是移动工具且正在拖拽轴
  if (props.activeTool === 'move' && isDraggingAxis && selectedObject.value && draggedAxis) {
    event.preventDefault()

    // 计算鼠标移动距离
    const deltaX = event.clientX - mouseStartPosition.x
    const deltaY = event.clientY - mouseStartPosition.y

    // 根据拖拽的轴计算移动
    const moveSpeed = 0.01
    let moveVector = new THREE.Vector3()

    if (draggedAxis === 'X') {
      // X轴移动：使用世界坐标系X轴
      moveVector.set(deltaX * moveSpeed, 0, 0)
    } else if (draggedAxis === 'Y') {
      // Y轴移动：使用世界坐标系Y轴
      moveVector.set(0, -deltaY * moveSpeed, 0)
    } else if (draggedAxis === 'Z') {
      // Z轴移动：使用世界坐标系Z轴（修正方向）
      moveVector.set(0, 0, deltaY * moveSpeed)
    }

    // 更新对象位置
    selectedObject.value.position.copy(dragStartPosition).add(moveVector)

    // 更新三轴控制器位置
    updateTransformControls()

    // 更新属性编辑器中的位置值
    position.value.x = selectedObject.value.position.x
    position.value.y = selectedObject.value.position.y
    position.value.z = selectedObject.value.position.z

  } else if (props.activeTool === 'move' && isMoving && selectedObject.value) {
    // 原来的移动方式（自由移动）
    event.preventDefault() // 阻止默认行为

    // 计算鼠标移动距离
    const deltaX = event.clientX - mouseStartPosition.x
    const deltaY = event.clientY - mouseStartPosition.y

    // 根据相机朝向计算正确的移动方向
    const moveSpeed = 0.01 // 移动速度系数

    // 获取相机的方向向量
    const cameraDirection = new THREE.Vector3()
    camera.value.getWorldDirection(cameraDirection)

    // 计算相机的右向量（相机朝向的右方向）
    const cameraRight = new THREE.Vector3()
    cameraRight.crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize()

    // 计算相机的上向量（相机朝向的上方向）
    const cameraUp = new THREE.Vector3()
    cameraUp.crossVectors(cameraRight, cameraDirection).normalize()

    // 计算移动向量
    const moveVector = new THREE.Vector3()
    moveVector.addScaledVector(cameraRight, deltaX * moveSpeed) // 左移对应右向量
    moveVector.addScaledVector(cameraUp, -deltaY * moveSpeed) // 上移对应上向量反向

    // 只保留X和Z轴分量，Y轴设为0
    const newX = moveStartPosition.x + moveVector.x
    const newZ = moveStartPosition.z + moveVector.z

    // 更新对象位置（只改变X和Z轴）
    selectedObject.value.position.x = newX
    selectedObject.value.position.z = newZ

    // 更新三轴控制器位置
    updateTransformControls()

    // 更新属性编辑器中的位置值
    position.value.x = newX
    position.value.z = newZ

    // 高亮对象位置会自动跟随选中对象
  }
}

// 鼠标释放事件
const onMouseUp = () => {
  isMouseDown = false
  isMoving = false
  isDraggingAxis = false
  draggedAxis = null

  // 重置所有轴颜色
  resetAllAxisColors()
}

// 查找模型的根对象
const findRootModel = (object: THREE.Object3D): THREE.Object3D => {
  // 如果对象有父级且父级不是场景，继续向上查找
  if (object.parent && object.parent !== scene.value && object.parent.type !== 'Scene') {
    return findRootModel(object.parent)
  }
  return object
}

// 简化高亮 - 只对根对象进行颜色高亮，避免性能问题
const highlightModel = (object: THREE.Object3D) => {
  try {
    // 如果高亮被禁用，直接返回
    if (!highlightSettings.value.enableHighlight) {
      return
    }

    if (highlightSettings.value.useSimpleHighlight) {
      // 简单高亮模式 - 只处理根对象
      if (object.type === 'Mesh' && (object as any).material) {
        // 保存原始颜色
        if (!object.userData.originalColor) {
          object.userData.originalColor = (object as any).material.color.getHex()
        }
        // 设置高亮颜色
        (object as any).material.color.setHex(highlightSettings.value.highlightColor)
      } else if (object.type === 'Group' || object.type === 'Object3D') {
        // 对于组对象，只高亮第一个可见的网格子对象
        const firstMesh = findFirstMesh(object)
        if (firstMesh && (firstMesh as any).material) {
          if (!firstMesh.userData.originalColor) {
            firstMesh.userData.originalColor = (firstMesh as any).material.color.getHex()
          }
          (firstMesh as any).material.color.setHex(highlightSettings.value.highlightColor)
        }
      }
    } else {
      // 高级高亮模式 - 递归处理所有子对象（性能较低）
      highlightModelAdvanced(object)
    }
  } catch (error) {
    console.warn('高亮对象时出错:', error, object)
  }
}

// 高级高亮模式（性能较低，不推荐）
const highlightModelAdvanced = (object: THREE.Object3D) => {
  const highlightObject = (obj: THREE.Object3D, depth: number = 0) => {
    if (depth > 20) return // 限制递归深度

    if (obj.type === 'Mesh' && (obj as any).material) {
      if (!obj.userData.originalColor) {
        obj.userData.originalColor = (obj as any).material.color.getHex()
      }
      (obj as any).material.color.setHex(highlightSettings.value.highlightColor)
    }

    obj.children.forEach(child => {
      highlightObject(child, depth + 1)
    })
  }

  highlightObject(object)
}

// 高亮设置事件处理
const onHighlightModeChange = () => {
  // 如果当前有选中的对象，重新应用高亮
  if (selectedObject.value) {
    clearModelHighlight(selectedObject.value)
    highlightModel(selectedObject.value)
  }
}

const onHighlightColorChange = (event: Event) => {
  // 从color input获取颜色值并转换为十六进制数字
  const target = event.target as HTMLInputElement
  if (target && target.value) {
    const colorHex = target.value.replace('#', '')
    highlightSettings.value.highlightColor = parseInt(colorHex, 16)
  }

  // 如果当前有选中的对象，重新应用高亮
  if (selectedObject.value) {
    clearModelHighlight(selectedObject.value)
    highlightModel(selectedObject.value)
  }
}

const onHighlightEnableChange = () => {
  // 如果当前有选中的对象，根据设置决定是否高亮
  if (selectedObject.value) {
    if (highlightSettings.value.enableHighlight) {
      highlightModel(selectedObject.value)
    } else {
      clearModelHighlight(selectedObject.value)
    }
  }
}

const toggleHighlight = () => {
  highlightSettings.value.enableHighlight = !highlightSettings.value.enableHighlight
  onHighlightEnableChange()
}

// 查找第一个网格对象
const findFirstMesh = (object: THREE.Object3D): THREE.Mesh | null => {
  if (object.type === 'Mesh') {
    return object as THREE.Mesh
  }

  for (const child of object.children) {
    const mesh = findFirstMesh(child)
    if (mesh) return mesh
  }

  return null
}

// 简化清除高亮 - 只处理根对象
const clearModelHighlight = (object: THREE.Object3D) => {
  try {
    // 只处理根对象，不递归处理子对象
    if (object.type === 'Mesh' && (object as any).material) {
      // 恢复原始颜色
      if (object.userData.originalColor !== undefined) {
        (object as any).material.color.setHex(object.userData.originalColor)
        delete object.userData.originalColor
      }
    } else if (object.type === 'Group' || object.type === 'Object3D') {
      // 对于组对象，清除第一个网格子对象的高亮
      const firstMesh = findFirstMesh(object)
      if (firstMesh && (firstMesh as any).material && firstMesh.userData.originalColor !== undefined) {
        (firstMesh as any).material.color.setHex(firstMesh.userData.originalColor)
        delete firstMesh.userData.originalColor
      }
    }
  } catch (error) {
    console.warn('清除高亮时出错:', error, object)
  }
}

// 鼠标点击事件
const onMouseClick = (event: MouseEvent) => {
  // 在所有工具下都允许选择对象，但只有在选择工具下才清除选择

  // 计算鼠标位置
  const rect = renderer.value.domElement.getBoundingClientRect()
  mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

  // 射线检测
  raycaster.value.setFromCamera(mouse.value, camera.value)
  const intersects = raycaster.value.intersectObjects(scene.value.children, true)

  if (intersects.length > 0) {
    const object = intersects[0].object

    // 检查是否点击了三轴控制器
    if (object.parent && object.parent.userData.axis) {
      // 如果点击了轴，不进行对象选择
      return
    }

    // 检查是否点击了天空盒
    if (object === skybox.value) {
      // 点击天空盒时不进行任何选择操作
      return
    }

    // 检查是否点击了有效对象
    if (object.name !== 'grid' && object.name !== 'axes' && object.name !== 'TransformControls') {
      // 查找整个模型（向上查找根对象）
      const rootModel = findRootModel(object)
      selectObject(rootModel)
    }
  } else {
    // 只有在选择工具下才清除选择
    if (props.activeTool === 'select') {
      clearSelection()
    }
  }
}

/**
 * 选择3D对象
 * 高亮显示选中的对象，并更新相关状态
 * @param object - 要选择的Three.js对象，null表示取消选择
 */
const selectObject = (object: any) => {
  // 保存当前模型的动画状态
  if (selectedObject.value && animationMixer) {
    saveModelAnimationState(selectedObject.value)
  }

  clearSelection()
  selectedObject.value = object

  // 高亮整个模型（包括所有子对象）
  highlightModel(object)

  // 更新三轴控制器
  updateTransformControls()

  // 检查模型动画
  checkModelAnimations(object)

  // 更新属性编辑器显示
  updatePropertyEditor()

  // 同步反射设置（如果是反射材质）
  nextTick(() => {
    syncReflectionSettings()
  })

  emit('object-selected', object)
}

// 清除选择
const clearSelection = () => {
  if (selectedObject.value) {
    // 清除整个模型的高亮
    clearModelHighlight(selectedObject.value)
  }

  selectedObject.value = null

  // 重置所有轴颜色
  resetAllAxisColors()

  // 更新三轴控制器
  updateTransformControls()
}

// 清除所有动画状态（仅在需要时调用）
const clearAllAnimations = () => {
  // 清除动画状态
  if (animationMixer) {
    animationMixer.stopAllAction()
    animationMixer = null
  }
  hasAnimations.value = false
  modelAnimations.value = []
  currentAnimation.value = -1
  isPlaying.value = false
}


// 漫游配置相关方法
const openCameraTourDialog = () => {
  // 更新相机位置和旋转
  cameraPosition.value = {
    x: camera.value.position.x,
    y: camera.value.position.y,
    z: camera.value.position.z
  }
  cameraRotation.value = {
    x: camera.value.rotation.x,
    y: camera.value.rotation.y,
    z: camera.value.rotation.z
  }

  showCameraTourDialog.value = true
}

const closeCameraTourDialog = () => {
  showCameraTourDialog.value = false
  editingConfigId.value = null
}

// 光源配置相关方法
const openLightConfigDialog = () => {
  showLightConfigDialog.value = true
}

const closeLightConfigDialog = () => {
  showLightConfigDialog.value = false
}

// 天空盒配置相关方法
const openSkyboxConfigDialog = () => {
  showSkyboxConfigDialog.value = true
}

const closeSkyboxConfigDialog = () => {
  showSkyboxConfigDialog.value = false
}

// 初始化额外光源
const initAdditionalLights = () => {
  if (!scene.value) return

  // 创建聚光灯
  const spot = new THREE.SpotLight(
      lightSettings.value.spotColor,
      lightSettings.value.spotIntensity,
      lightSettings.value.spotDistance,
      THREE.MathUtils.degToRad(lightSettings.value.spotAngle),
      lightSettings.value.spotPenumbra
  )
  spot.position.set(
      lightSettings.value.spotPosition.x,
      lightSettings.value.spotPosition.y,
      lightSettings.value.spotPosition.z
  )
  spot.target.position.set(
      lightSettings.value.spotTarget.x,
      lightSettings.value.spotTarget.y,
      lightSettings.value.spotTarget.z
  )
  spot.castShadow = true
  spot.shadow.mapSize.width = 2048
  spot.shadow.mapSize.height = 2048
  spot.shadow.camera.near = 0.1
  spot.shadow.camera.far = 100
  spot.shadow.camera.fov = 30
  spotLight.value = spot
  scene.value.add(spot)
  scene.value.add(spot.target)

  // 创建半球光
  const hemisphere = new THREE.HemisphereLight(
      lightSettings.value.hemisphereSkyColor,
      lightSettings.value.hemisphereGroundColor,
      lightSettings.value.hemisphereIntensity
  )
  hemisphere.position.set(
      lightSettings.value.hemispherePosition.x,
      lightSettings.value.hemispherePosition.y,
      lightSettings.value.hemispherePosition.z
  )
  hemisphereLight.value = hemisphere
  scene.value.add(hemisphere)
}

// 初始化天空盒
const initSkybox = () => {
  console.log('initSkybox 被调用:', { scene: !!scene.value, enabled: skyboxSettings.value.enabled })
  if (!scene.value || !skyboxSettings.value.enabled) return

  // 创建天空盒几何体
  const skyboxGeometry = new THREE.SphereGeometry(200, 32, 32)

  let skyboxMaterial: THREE.Material

  if (skyboxSettings.value.type === 'cubemap') {
    // 立方体贴图天空盒
    if (skyboxSettings.value.customCubemap.posx) {
      const loader = new THREE.CubeTextureLoader()
      const cubeTexture = loader.load([
        skyboxSettings.value.customCubemap.posx, // 右
        skyboxSettings.value.customCubemap.negx, // 左
        skyboxSettings.value.customCubemap.posy, // 上
        skyboxSettings.value.customCubemap.negy, // 下
        skyboxSettings.value.customCubemap.posz, // 前
        skyboxSettings.value.customCubemap.negz  // 后
      ])
      skyboxMaterial = new THREE.MeshBasicMaterial({
        envMap: cubeTexture,
        side: THREE.BackSide
      })

      // 设置场景背景和环境
      if (scene.value) {
        scene.value.background = cubeTexture
        scene.value.environment = cubeTexture
        updateObjectsEnvironmentMap()
      }
    } else {
      // 如果没有自定义贴图，使用默认渐变
      skyboxMaterial = createGradientSkyboxMaterial()

      // 为渐变天空盒创建环境贴图
      const gradientTexture = createGradientEnvironmentTexture()
      if (scene.value) {
        scene.value.background = gradientTexture
        scene.value.environment = gradientTexture
        updateObjectsEnvironmentMap()
      }
    }
  } else if (skyboxSettings.value.type === 'hdri') {
    // HDRI天空盒
    if (skyboxSettings.value.hdriUrl) {
      console.log('开始加载本地HDRI:', skyboxSettings.value.hdriUrl)

      // 设置加载超时（本地文件加载应该更快）
      const loadTimeout = setTimeout(() => {
        console.warn('本地HDRI加载超时，使用程序化纹理')
        useProceduralHDRI()
      }, 5000) // 5秒超时（本地文件）

      // 使用通用HDRI加载函数
      loadHDRI(skyboxSettings.value.hdriUrl)
          .then((texture) => {
            clearTimeout(loadTimeout)
            console.log('本地HDRI纹理加载成功:', texture)
            applyHDRI(texture)
          })
          .catch((error) => {
            clearTimeout(loadTimeout)
            console.error('本地HDRI加载失败:', error)
            console.log('使用程序化HDRI作为备选方案')
            useProceduralHDRI()
          })
      return // 异步加载，提前返回

      // 应用HDRI纹理的辅助函数
      function applyHDRI(texture) {
        // 为天空盒背景使用正确的映射
        texture.mapping = THREE.EquirectangularReflectionMapping
        texture.colorSpace = THREE.SRGBColorSpace
        // 翻转纹理以修正方向 - 改为false来修正上下颠倒
        texture.flipY = false

        // 设置场景背景和环境
        if (scene.value) {
          scene.value.background = texture
          scene.value.environment = texture

          // 更新场景中所有对象的环境贴图
          updateObjectsEnvironmentMap()
          // 重新创建反射探针以确保反射正常
          recreateAllReflectionProbes()
        }

        // 创建天空盒材质
        skyboxMaterial = new THREE.MeshBasicMaterial({
          envMap: texture,
          side: THREE.BackSide
        })

        if (skybox.value) {
          skybox.value.material = skyboxMaterial
        } else {
          skybox.value = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
          scene.value?.add(skybox.value)
        }

        console.log('HDRI天空盒创建完成')
      }

      // 使用程序化HDRI的辅助函数
      function useProceduralHDRI() {
        const proceduralTexture = createProceduralHDRI()
        proceduralTexture.colorSpace = THREE.SRGBColorSpace

        // 设置场景背景和环境
        if (scene.value) {
          scene.value.background = proceduralTexture
          scene.value.environment = proceduralTexture
          // 重新创建反射探针以确保反射正常
          recreateAllReflectionProbes()
        }

        // 创建天空盒材质
        skyboxMaterial = new THREE.MeshBasicMaterial({
          envMap: proceduralTexture,
          side: THREE.BackSide
        })

        if (skybox.value) {
          skybox.value.material = skyboxMaterial
        } else {
          skybox.value = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
          scene.value?.add(skybox.value)
        }

        console.log('程序化HDRI天空盒创建完成')
      }
    } else {
      // 如果没有HDRI URL，使用默认渐变
      skyboxMaterial = createGradientSkyboxMaterial()
      
      // 为渐变天空盒创建环境贴图
      const gradientTexture = createGradientEnvironmentTexture()
      if (scene.value) {
        scene.value.background = gradientTexture
        scene.value.environment = gradientTexture
        updateObjectsEnvironmentMap()
      }
    }
  } else {
    // 渐变天空盒
    skyboxMaterial = createGradientSkyboxMaterial()

    // 为渐变天空盒创建环境贴图
    const gradientTexture = createGradientEnvironmentTexture()
    if (scene.value) {
      scene.value.background = gradientTexture
      scene.value.environment = gradientTexture
      // 更新场景中所有对象的环境贴图
      updateObjectsEnvironmentMap()
    }
  }

  // 只有在非HDRI类型或HDRI URL为空时才创建天空盒
  if (skyboxSettings.value.type !== 'hdri' || !skyboxSettings.value.hdriUrl) {
    skybox.value = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
    scene.value.add(skybox.value)
  }
}

// 创建渐变环境贴图纹理
const createGradientEnvironmentTexture = () => {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size * 2
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, size)
  gradient.addColorStop(0, skyboxSettings.value.topColor)
  gradient.addColorStop(0.5, skyboxSettings.value.horizonColor)
  gradient.addColorStop(1, skyboxSettings.value.bottomColor)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size * 2, size)

  // 添加一些云朵效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size * 2
    const y = Math.random() * size * 0.5
    const radius = Math.random() * 50 + 20
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// 创建程序化HDRI纹理
const createProceduralHDRI = () => {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size * 2
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // 创建渐变背景
  const gradient = ctx.createLinearGradient(0, 0, 0, size)
  gradient.addColorStop(0, skyboxSettings.value.topColor)
  gradient.addColorStop(0.5, skyboxSettings.value.horizonColor)
  gradient.addColorStop(1, skyboxSettings.value.bottomColor)

  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, size * 2, size)

  // 添加一些云朵效果
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size * 2
    const y = Math.random() * size * 0.5
    const radius = Math.random() * 50 + 20
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.mapping = THREE.EquirectangularReflectionMapping
  return texture
}

// 创建渐变天空盒材质
const createGradientSkyboxMaterial = () => {
  return new THREE.ShaderMaterial({
    uniforms: {
      topColor: { value: new THREE.Color(skyboxSettings.value.topColor) },
      bottomColor: { value: new THREE.Color(skyboxSettings.value.bottomColor) },
      horizonColor: { value: new THREE.Color(skyboxSettings.value.horizonColor) }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 bottomColor;
      uniform vec3 horizonColor;
      varying vec3 vWorldPosition;

      void main() {
        float h = normalize(vWorldPosition).y;
        // 重新修正颜色映射逻辑
        // h > 0 表示上方（天空），h < 0 表示下方（地面）
        vec3 color;
        if (h > 0.0) {
          // 上方区域：从地平线颜色渐变到天空颜色
          color = mix(horizonColor, topColor, h);
        } else {
          // 下方区域：从地平线颜色渐变到地面颜色
          color = mix(horizonColor, bottomColor, -h);
        }
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    side: THREE.BackSide
  })
}

// 更新光源设置
const updateLightSettings = () => {
  // 环境光
  if (ambientLight.value) {
    ambientLight.value.intensity = lightSettings.value.ambientIntensity
    ambientLight.value.color.setHex(parseInt(lightSettings.value.ambientColor.replace('#', '0x')))
  }

  // 方向光
  if (directionalLight.value) {
    directionalLight.value.intensity = lightSettings.value.directionalIntensity
    directionalLight.value.color.setHex(parseInt(lightSettings.value.directionalColor.replace('#', '0x')))
    directionalLight.value.position.set(
        lightSettings.value.directionalPosition.x,
        lightSettings.value.directionalPosition.y,
        lightSettings.value.directionalPosition.z
    )
    directionalLight.value.target.position.set(
        lightSettings.value.directionalTarget.x,
        lightSettings.value.directionalTarget.y,
        lightSettings.value.directionalTarget.z
    )
  }

  // 点光源
  if (pointLight.value) {
    pointLight.value.intensity = lightSettings.value.pointIntensity
    pointLight.value.color.setHex(parseInt(lightSettings.value.pointColor.replace('#', '0x')))
    pointLight.value.position.set(
        lightSettings.value.pointPosition.x,
        lightSettings.value.pointPosition.y,
        lightSettings.value.pointPosition.z
    )
    pointLight.value.distance = lightSettings.value.pointDistance
  }

  // 聚光灯
  if (spotLight.value) {
    spotLight.value.intensity = lightSettings.value.spotIntensity
    spotLight.value.color.setHex(parseInt(lightSettings.value.spotColor.replace('#', '0x')))
    spotLight.value.position.set(
        lightSettings.value.spotPosition.x,
        lightSettings.value.spotPosition.y,
        lightSettings.value.spotPosition.z
    )
    spotLight.value.target.position.set(
        lightSettings.value.spotTarget.x,
        lightSettings.value.spotTarget.y,
        lightSettings.value.spotTarget.z
    )
    spotLight.value.angle = THREE.MathUtils.degToRad(lightSettings.value.spotAngle)
    spotLight.value.penumbra = lightSettings.value.spotPenumbra
    spotLight.value.distance = lightSettings.value.spotDistance
  }

  // 半球光
  if (hemisphereLight.value) {
    hemisphereLight.value.intensity = lightSettings.value.hemisphereIntensity
    hemisphereLight.value.color.setHex(parseInt(lightSettings.value.hemisphereSkyColor.replace('#', '0x')))
    hemisphereLight.value.groundColor.setHex(parseInt(lightSettings.value.hemisphereGroundColor.replace('#', '0x')))
    hemisphereLight.value.position.set(
        lightSettings.value.hemispherePosition.x,
        lightSettings.value.hemispherePosition.y,
        lightSettings.value.hemispherePosition.z
    )
  }

  // 更新自定义光源
  updateCustomLights()
}

// 光源管理相关函数
const openAddLightDialog = () => {
  resetNewLightForm()
  showAddLightDialog.value = true
}

const closeAddLightDialog = () => {
  showAddLightDialog.value = false
  editingLightId.value = null
  resetNewLightForm()
}

const openLightManagementDialog = () => {
  showLightManagementDialog.value = true
}

const closeLightManagementDialog = () => {
  showLightManagementDialog.value = false
}

const resetNewLightForm = () => {
  newLightForm.value = {
    id: '',
    name: '',
    type: 'directional',
    enabled: true,
    intensity: 1.0,
    color: '#ffffff',
    position: { x: 0, y: 10, z: 0 },
    target: { x: 0, y: 0, z: 0 },
    distance: 100,
    angle: 30,
    penumbra: 0.1,
    skyColor: '#87CEEB',
    groundColor: '#98FB98',
    castShadow: false,
    shadowMapSize: 1024
  }
}

const saveCustomLight = () => {
  if (!newLightForm.value.name.trim()) {
    alert('请输入光源名称')
    return
  }

  const lightData = { ...newLightForm.value }

  if (editingLightId.value) {
    // 编辑现有光源
    const index = customLights.value.findIndex(light => light.id === editingLightId.value)
    if (index !== -1) {
      lightData.id = editingLightId.value
      customLights.value[index] = lightData
      updateCustomLight(lightData)
    }
  } else {
    // 添加新光源
    lightData.id = `custom_light_${Date.now()}`
    customLights.value.push(lightData)
    createCustomLight(lightData)
  }

  closeAddLightDialog()
}

const editCustomLight = (light) => {
  newLightForm.value = { ...light }
  editingLightId.value = light.id
  showAddLightDialog.value = true
}

const deleteCustomLight = (lightId) => {
  if (confirm('确定要删除这个光源吗？')) {
    const index = customLights.value.findIndex(light => light.id === lightId)
    if (index !== -1) {
      const light = customLights.value[index]
      removeCustomLightFromScene(light)
      customLights.value.splice(index, 1)
    }
  }
}

const updateCustomLight = (light) => {
  const lightObject = scene.value?.getObjectByName(`custom_light_${light.id}`) as any
  if (lightObject) {
    lightObject.visible = light.enabled
    if (light.enabled) {
      lightObject.intensity = light.intensity
      lightObject.color.setHex(parseInt(light.color.replace('#', '0x')))

      if (light.type !== 'ambient') {
        lightObject.position.set(light.position.x, light.position.y, light.position.z)
      }

      if (light.type === 'directional' || light.type === 'spot') {
        if (lightObject.target) {
          lightObject.target.position.set(light.target.x, light.target.y, light.target.z)
        }
      }

      if (light.type === 'point' || light.type === 'spot') {
        lightObject.distance = light.distance
      }

      if (light.type === 'spot') {
        lightObject.angle = (light.angle * Math.PI) / 180
        lightObject.penumbra = light.penumbra
      }

      if (light.type === 'hemisphere') {
        lightObject.color.setHex(parseInt(light.skyColor.replace('#', '0x')))
        lightObject.groundColor.setHex(parseInt(light.groundColor.replace('#', '0x')))
      }
    }
  }
}

const createCustomLight = (lightData) => {
  if (!scene.value) return

  let light
  let lightTarget = null

  switch (lightData.type) {
    case 'ambient':
      light = new THREE.AmbientLight(
          parseInt(lightData.color.replace('#', '0x')),
          lightData.intensity
      )
      break

    case 'directional':
      light = new THREE.DirectionalLight(
          parseInt(lightData.color.replace('#', '0x')),
          lightData.intensity
      )
      light.position.set(lightData.position.x, lightData.position.y, lightData.position.z)
      lightTarget = new THREE.Object3D()
      lightTarget.position.set(lightData.target.x, lightData.target.y, lightData.target.z)
      light.target = lightTarget
      scene.value.add(lightTarget)
      break

    case 'point':
      light = new THREE.PointLight(
          parseInt(lightData.color.replace('#', '0x')),
          lightData.intensity,
          lightData.distance
      )
      light.position.set(lightData.position.x, lightData.position.y, lightData.position.z)
      break

    case 'spot':
      light = new THREE.SpotLight(
          parseInt(lightData.color.replace('#', '0x')),
          lightData.intensity,
          lightData.distance,
          (lightData.angle * Math.PI) / 180,
          lightData.penumbra
      )
      light.position.set(lightData.position.x, lightData.position.y, lightData.position.z)
      lightTarget = new THREE.Object3D()
      lightTarget.position.set(lightData.target.x, lightData.target.y, lightData.target.z)
      light.target = lightTarget
      scene.value.add(lightTarget)
      break

    case 'hemisphere':
      light = new THREE.HemisphereLight(
          parseInt(lightData.skyColor.replace('#', '0x')),
          parseInt(lightData.groundColor.replace('#', '0x')),
          lightData.intensity
      )
      light.position.set(lightData.position.x, lightData.position.y, lightData.position.z)
      break
  }

  if (light) {
    light.name = `custom_light_${lightData.id}`
    light.castShadow = lightData.castShadow

    if (lightData.castShadow && light.shadow) {
      light.shadow.mapSize.width = lightData.shadowMapSize
      light.shadow.mapSize.height = lightData.shadowMapSize
    }

    scene.value.add(light)
    light.visible = lightData.enabled
  }
}

const removeCustomLightFromScene = (light) => {
  if (!scene.value) return

  const lightObject = scene.value.getObjectByName(`custom_light_${light.id}`) as any
  if (lightObject) {
    scene.value.remove(lightObject)

    // 如果有点光源或聚光灯的目标，也要移除
    if (lightObject.target && lightObject.target.name) {
      scene.value.remove(lightObject.target)
    }
  }
}

const updateCustomLights = () => {
  customLights.value.forEach(light => {
    updateCustomLight(light)
  })
}

const resetToDefaultLights = () => {
  if (confirm('确定要重置为默认光源配置吗？这将删除所有自定义光源。')) {
    customLights.value.forEach(light => {
      removeCustomLightFromScene(light)
    })
    customLights.value = []
    updateLightSettings()
  }
}

// 处理天空盒启用状态变化
const handleSkyboxEnableChange = (enabled?: boolean) => {
  // 如果传递了参数，更新启用状态
  if (enabled !== undefined) {
    skyboxSettings.value.enabled = enabled
  }
  console.log('天空盒启用状态变化:', skyboxSettings.value.enabled)
  if (skyboxSettings.value.enabled) {
    // 启用天空盒时，如果有预设则加载，否则使用默认渐变
    if (skyboxSettings.value.currentPreset) {
      applySkyboxPreset(skyboxSettings.value.currentPreset)
    } else {
      // 使用默认渐变天空盒
      skyboxSettings.value.type = 'gradient'
      skyboxSettings.value.currentPreset = 'default'
      initSkybox()
      updateSkyboxSettings()
    }
  } else {
    // 禁用天空盒时，恢复默认背景和环境
    if (scene.value) {
      scene.value.background = defaultBackground.value
      scene.value.environment = defaultEnvironment.value
      // 移除天空盒对象
      if (skybox.value) {
        scene.value.remove(skybox.value)
        skybox.value = null
      }
      // 更新所有对象的环境贴图（反射探针会保持独立）
      updateObjectsEnvironmentMap()
    }
  }
}

// 更新天空盒设置
const updateSkyboxSettings = (newSettings?: any) => {
  if (newSettings) {
    const oldEnabled = skyboxSettings.value.enabled
    Object.assign(skyboxSettings.value, newSettings)
    
    // 如果启用状态发生变化，调用相应的处理函数
    if (oldEnabled !== skyboxSettings.value.enabled) {
      handleSkyboxEnableChange()
      return
    }
  }
  
  // 如果启用天空盒但天空盒不存在，则创建它
  if (skyboxSettings.value.enabled && !skybox.value) {
    initSkybox()
    return
  }
  
  if (skybox.value) {
    skybox.value.visible = skyboxSettings.value.enabled

    if (skyboxSettings.value.type === 'gradient' && skybox.value.material instanceof THREE.ShaderMaterial) {
      const material = skybox.value.material as THREE.ShaderMaterial
      material.uniforms.topColor.value.setHex(parseInt(skyboxSettings.value.topColor.replace('#', '0x')))
      material.uniforms.bottomColor.value.setHex(parseInt(skyboxSettings.value.bottomColor.replace('#', '0x')))
      material.uniforms.horizonColor.value.setHex(parseInt(skyboxSettings.value.horizonColor.replace('#', '0x')))
      material.needsUpdate = true

      // 更新渐变环境贴图
      const gradientTexture = createGradientEnvironmentTexture()
      if (scene.value) {
        scene.value.background = gradientTexture
        scene.value.environment = gradientTexture
        updateObjectsEnvironmentMap()
        // 重新创建反射探针以确保反射正常
        recreateAllReflectionProbes()
      }
    } else if (skyboxSettings.value.type === 'hdri' && skybox.value.material instanceof THREE.MeshBasicMaterial) {
      const material = skybox.value.material as THREE.MeshBasicMaterial
      if (material.envMap && 'intensity' in material.envMap) {
        (material.envMap as any).intensity = skyboxSettings.value.hdriIntensity
        material.needsUpdate = true
      }
    }
  }

  // 更新场景环境贴图强度
  if (scene.value && scene.value.environment && 'intensity' in scene.value.environment) {
    (scene.value.environment as any).intensity = skyboxSettings.value.hdriIntensity
  }
}

// 应用天空盒预设
const applySkyboxPreset = (presetId: string) => {
  // 只有在启用天空盒时才应用预设
  if (!skyboxSettings.value.enabled) {
    console.log('天空盒未启用，忽略预设应用')
    return
  }

  const preset = skyboxPresets.value.find(p => p.id === presetId)
  if (preset) {
    skyboxSettings.value.currentPreset = presetId
    skyboxSettings.value.type = preset.type

    if (preset.type === 'gradient' && preset.colors) {
      skyboxSettings.value.topColor = (preset.colors as any).top
      skyboxSettings.value.bottomColor = (preset.colors as any).bottom
      skyboxSettings.value.horizonColor = (preset.colors as any).horizon
    } else if (preset.type === 'hdri' && preset.url) {
      // 处理本地HDRI文件路径
      const url = preset.url as string
      const hdriUrl = url.startsWith('/') ? url : `/HDRI/${url}`
      skyboxSettings.value.hdriUrl = hdriUrl
      console.log('设置本地HDRI URL:', hdriUrl)
    }

    // 重新创建天空盒
    if (skybox.value) {
      scene.value?.remove(skybox.value)
    }
    initSkybox()
    updateSkyboxSettings()
  }
}

// 获取HDRI分类
const getHdriCategories = () => {
  const categories = [...new Set(skyboxPresets.value
      .filter(p => p.type === 'hdri')
      .map(p => p.category)
  )]
  return categories.sort()
}

// 动态检测本地HDRI文件
const detectLocalHDRI = async () => {
  try {
    console.log('本地HDRI文件检测完成，当前可用文件:')
    skyboxPresets.value.filter(p => p.type === 'hdri').forEach(preset => {
      console.log(`- ${preset.name}: ${preset.url}`)
    })
  } catch (error) {
    console.warn('检测本地HDRI文件时出错:', error)
  }
}

// 通用HDRI加载函数
const loadHDRI = (url: string) => {
  return new Promise((resolve, reject) => {
    const fileExtension = url.toLowerCase().split('.').pop()
    let loader

    if (fileExtension === 'exr') {
      loader = new EXRLoader()
      console.log('使用EXRLoader加载EXR文件:', url)
    } else if (fileExtension === 'hdr') {
      loader = new RGBELoader()
      console.log('使用RGBELoader加载HDR文件:', url)
    } else {
      reject(new Error(`不支持的文件格式: ${fileExtension}`))
      return
    }

    loader.load(
        url,
        (texture) => {
          console.log('HDRI文件加载成功:', url)
          resolve(texture)
        },
        (progress) => {
          if (progress.total > 0) {
            console.log('HDRI加载进度:', (progress.loaded / progress.total * 100).toFixed(1) + '%')
          }
        },
        (error) => {
          console.error('HDRI文件加载失败:', url, error)
          reject(error)
        }
    )
  })
}

// 处理本地HDRI文件上传
const handleLocalHDRIUpload = (file: File) => {
  if (!file) return

  // 只有在启用天空盒时才处理上传
  if (!skyboxSettings.value.enabled) {
    alert('请先启用天空盒功能')
    return
  }

  // 检查文件类型
  const validTypes = ['.hdr', '.exr']
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))

  if (!validTypes.includes(fileExtension)) {
    alert('请选择 .hdr 或 .exr 格式的HDRI文件')
    return
  }

  console.log('开始上传本地HDRI文件:', file.name)

  // 创建文件URL
  const fileURL = URL.createObjectURL(file)

  // 设置天空盒类型为HDRI
  skyboxSettings.value.type = 'hdri'
  skyboxSettings.value.hdriUrl = fileURL
  skyboxSettings.value.currentPreset = 'custom'

  // 使用通用HDRI加载函数加载上传的文件
  loadHDRI(fileURL)
      .then((texture: any) => {
        console.log('上传的HDRI文件加载成功:', texture)

        // 应用HDRI纹理
        texture.mapping = THREE.EquirectangularReflectionMapping
        texture.colorSpace = THREE.SRGBColorSpace
        // 翻转纹理以修正方向 - 改为false来修正上下颠倒
        texture.flipY = false

        // 设置场景背景和环境
        if (scene.value) {
          scene.value.background = texture
          scene.value.environment = texture
        }

        // 创建或更新天空盒
        const skyboxGeometry = new THREE.SphereGeometry(200, 32, 32)
        const skyboxMaterial = new THREE.MeshBasicMaterial({
          envMap: texture,
          side: THREE.BackSide
        })

        if (skybox.value) {
          skybox.value.material = skyboxMaterial
        } else {
          skybox.value = new THREE.Mesh(skyboxGeometry, skyboxMaterial)
          scene.value?.add(skybox.value)
        }

        console.log('自定义HDRI天空盒创建完成')
        ElMessage.success(`HDRI文件加载成功: ${file.name}`)

      })
      .catch((error) => {
        console.error('上传的HDRI文件加载失败:', error)
        alert('HDRI文件加载失败，请检查文件格式是否正确')
      })
}

// 处理立方体贴图文件上传
const handleCubemapUpload = (data: { face: string, file: File }) => {
  const { face, file } = data
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      skyboxSettings.value.customCubemap[face as keyof typeof skyboxSettings.value.customCubemap] = result

      // 检查是否所有6个面都已上传
      const faces = Object.values(skyboxSettings.value.customCubemap)
      if (faces.every(face => face !== null)) {
        skyboxSettings.value.type = 'cubemap'
        // 重新创建天空盒
        if (skybox.value) {
          scene.value?.remove(skybox.value)
        }
        initSkybox()
        updateSkyboxSettings()
      }
    }
    reader.readAsDataURL(file)
}

const saveCameraTourConfig = (config: any) => {
  // 检查是否是编辑模式
  if (editingConfigId.value) {
    // 编辑现有配置
    const index = savedTourConfigs.value.findIndex(c => c.id === editingConfigId.value)
    if (index > -1) {
      // 更新现有配置
      savedTourConfigs.value[index] = {
        ...savedTourConfigs.value[index],
        ...config,
        saveTime: new Date().toISOString()
      }
      cameraTourConfig.value = savedTourConfigs.value[index]
      editingConfigId.value = null
      ElMessage.success('漫游配置已更新')
      console.log('更新漫游配置:', savedTourConfigs.value[index])
    } else {
      ElMessage.error('找不到要编辑的配置')
    }
  } else {
    // 创建新配置
    const configId = `tour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    const savedConfig = {
      id: configId,
      name: config.name || `漫游配置_${savedTourConfigs.value.length + 1}`,
      ...config,
      saveTime: new Date().toISOString()
    }

    savedTourConfigs.value.push(savedConfig)
    cameraTourConfig.value = savedConfig

    ElMessage.success('漫游配置已保存')
    console.log('保存漫游配置:', savedConfig)
  }
}


const addCameraPathPoint = (point: any) => {
  console.log('添加相机路径点:', point)

  // 在场景中显示路径点
  const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16)
  const pointMaterial = new THREE.MeshBasicMaterial({
    color: pathPoints.value.length === 0 ? 0x00ff00 : 0xff0000, // 起点绿色，其他点红色
    transparent: true,
    opacity: 0.8
  })
  const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial)
  pointMesh.position.set(point.position.x, point.position.y, point.position.z)
  pointMesh.userData.isPathPoint = true
  pointMesh.userData.pointId = point.id

  scene.value.add(pointMesh)
  pathPoints.value.push(pointMesh)

  // 更新路径线
  updatePathLine()
}

const updateCameraPathPoint = (data: any) => {
  const { index, point } = data
  console.log('更新相机路径点:', index, point)

  // 更新场景中的路径点
  if (pathPoints.value[index]) {
    pathPoints.value[index].position.set(point.position.x, point.position.y, point.position.z)
  }

  // 更新路径线
  updatePathLine()
}

const locateCameraPathPoint = (data: any) => {
  const { index, point } = data
  console.log('定位到相机路径点:', index, point)

  // 将相机移动到路径点位置
  camera.value.position.set(point.position.x, point.position.y, point.position.z)

  // 如果有旋转信息，设置相机旋转
  if (point.rotation) {
    camera.value.rotation.set(point.rotation.x, point.rotation.y, point.rotation.z)
  }

  // 更新控制器
  if (controls.value) {
    controls.value.update()
  }

  // 聚焦到路径点
  if (pathPoints.value[index]) {
    const target = pathPoints.value[index].position
    camera.value.lookAt(target)
    if (controls.value) {
      controls.value.target.copy(target)
      controls.value.update()
    }
  }
}

// 切换漫游播放/暂停
const toggleTourPlayback = (config: any) => {
  console.log('切换漫游播放状态:', config)

  if (currentPlayingConfig.value?.id === config.id) {
    // 当前配置正在播放，切换暂停/恢复
    if (isTourPaused.value) {
      resumeTourPlayback()
    } else {
      pauseTourPlayback()
    }
  } else {
    // 播放新配置
    playSavedTourConfig(config)
  }
}

// 播放保存的漫游配置
const playSavedTourConfig = (config: any) => {
  console.log('播放保存的漫游配置:', config)

  if (config.points && config.points.length >= 2) {
    // 停止当前播放的漫游
    if (currentPlayingConfig.value) {
      stopTourPlayback()
    }

    // 设置当前播放配置
    currentPlayingConfig.value = config
    isTourPaused.value = false
    tourTotalDuration.value = config.duration || 10

    // 创建路径可视化
    createPathVisualization(config.points, config.pathType)

    // 开始漫游
    const tourData = {
      points: config.points,
      pathType: config.pathType,
      mode: config.mode,
      duration: config.duration,
      speed: config.speed,
      loop: config.loop,
      isPlaying: true
    }

    playCameraTour(tourData)
  } else {
    ElMessage.warning('配置中没有足够的路径点')
  }
}

// 暂停漫游播放
const pauseTourPlayback = () => {
  if (!currentPlayingConfig.value || isTourPaused.value) return

  isTourPaused.value = true
  tourPauseTime.value = Date.now()

  // 停止动画循环
  if (tourAnimation.value) {
    cancelAnimationFrame(tourAnimation.value)
    tourAnimation.value = null
  }

  console.log('漫游已暂停')
}

// 恢复漫游播放
const resumeTourPlayback = () => {
  if (!currentPlayingConfig.value || !isTourPaused.value) return

  isTourPaused.value = false

  // 调整开始时间以补偿暂停时间
  const pauseDuration = Date.now() - tourPauseTime.value
  tourStartTime.value += pauseDuration

  // 重新开始动画循环
  startTourAnimation()

  console.log('漫游已恢复')
}

// 停止漫游播放
const stopTourPlayback = () => {
  if (!currentPlayingConfig.value) return

  // 停止动画
  if (tourAnimation.value) {
    cancelAnimationFrame(tourAnimation.value)
    tourAnimation.value = null
  }

  // 重置状态
  currentPlayingConfig.value = null
  isTourPaused.value = false
  isCameraTouring.value = false

  // 清除路径可视化
  clearPathVisualization()

  console.log('漫游已停止')
}


// 编辑保存的漫游配置
const editSavedTourConfig = (config: any) => {
  console.log('编辑保存的漫游配置:', config)
  console.log('当前场景对象数量:', sceneObjects.value.length)

  editingConfigId.value = config.id

  // 打开编辑对话框
  showCameraTourDialog.value = true
}

// 删除保存的漫游配置
const deleteSavedTourConfig = (configId: string) => {
  const index = savedTourConfigs.value.findIndex(config => config.id === configId)
  if (index > -1) {
    savedTourConfigs.value.splice(index, 1)
    ElMessage.success('漫游配置已删除')
    console.log('删除漫游配置:', configId)
  }
}

// 创建路径可视化
const createPathVisualization = (points: any[], pathType: string) => {
  clearPathVisualization()

  if (points.length < 2) return

  // 创建路径点
  points.forEach((point, index) => {
    const pointGeometry = new THREE.SphereGeometry(0.1, 16, 16)
    const pointMaterial = new THREE.MeshBasicMaterial({
      color: index === 0 ? 0x00ff00 : 0xff0000, // 起点绿色，其他点红色
      transparent: true,
      opacity: 0.8
    })
    const pointMesh = new THREE.Mesh(pointGeometry, pointMaterial)
    pointMesh.position.set(point.position.x, point.position.y, point.position.z)
    pointMesh.userData.isPathPoint = true
    pointMesh.userData.pointId = point.id

    scene.value.add(pointMesh)
    pathPoints.value.push(pointMesh)
  })

  // 创建路径线
  updatePathLine()
}

// 更新路径线
const updatePathLine = () => {
  if (pathLine.value) {
    scene.value.remove(pathLine.value)
  }

  if (pathPoints.value.length < 2) return

  const points = pathPoints.value.map(mesh => mesh.position)
  const geometry = new THREE.BufferGeometry().setFromPoints(points)

  const material = new THREE.LineBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.6,
    linewidth: 2
  })

  pathLine.value = new THREE.Line(geometry, material)
  scene.value.add(pathLine.value)
}

// 清除路径可视化
const clearPathVisualization = () => {
  // 清除路径点
  pathPoints.value.forEach(point => {
    scene.value.remove(point)
    point.geometry.dispose()
    if (point.material instanceof THREE.Material) {
      point.material.dispose()
    }
  })
  pathPoints.value = []

  // 清除路径线
  if (pathLine.value) {
    scene.value.remove(pathLine.value)
    pathLine.value.geometry.dispose()
    pathLine.value.material.dispose()
    pathLine.value = null
  }
}

// 播放相机漫游
const playCameraTour = async (data: any) => {
  console.log('播放相机漫游:', data)
  isCameraTouring.value = data.isPlaying

  if (data.isPlaying) {
    // 开始漫游
    await startCameraTour(data)
  } else {
    // 停止漫游
    stopCameraTour()
  }
}

// 开始相机漫游
const startCameraTour = async (data: any) => {
  const { points, pathType, duration, speed, loop } = data

  if (points.length < 2) {
    ElMessage.warning('至少需要2个路径点才能开始漫游')
    return
  }

  // 创建路径插值
  const pathPoints = points.map(p => new THREE.Vector3(p.position.x, p.position.y, p.position.z))
  const path = createPathFromPoints(pathPoints, pathType)

  // 设置漫游状态
  tourStartTime.value = Date.now()
  tourTotalDuration.value = duration / speed

  // 开始动画循环
  startTourAnimation()
}

// 开始漫游动画循环
const startTourAnimation = () => {
  if (!currentPlayingConfig.value) return

  const { points, pathType, duration, speed } = currentPlayingConfig.value
  const pathPoints = points.map(p => new THREE.Vector3(p.position.x, p.position.y, p.position.z))
  const path = createPathFromPoints(pathPoints, pathType)

  const animate = () => {
    if (!isCameraTouring.value || isTourPaused.value) return

    const elapsed = Date.now() - tourStartTime.value
    const progress = elapsed / (tourTotalDuration.value * 1000)

    // 每10%进度输出一次调试信息
    if (Math.floor(progress * 10) !== Math.floor((progress - 0.01) * 10)) {
      console.log(`漫游进度: ${(progress * 100).toFixed(1)}%`)
    }

    // 如果进度超过1，停止动画
    if (progress >= 1) {
      console.log('漫游播放完成')
      stopTourPlayback()
      return
    }

    // 获取路径上的位置
    const position = path.getPointAt(progress)
    camera.value.position.copy(position)

    // 计算相机朝向（看向路径切线方向）
    const tangent = path.getTangentAt(progress)
    tangent.normalize()

    // 计算相机朝向，让相机沿着路径方向移动
    const lookAtPosition = new THREE.Vector3(
        position.x + tangent.x,
        position.y + tangent.y,
        position.z + tangent.z
    )

    // 设置相机朝向（看向路径切线方向）
    camera.value.lookAt(lookAtPosition)

    // 更新相机控制器目标点，使控制器也跟随路径方向
    if (controls.value) {
      controls.value.target.copy(lookAtPosition)
    }

    // 更新控制器
    if (controls.value) {
      controls.value.update()
    }

    // 继续动画循环
    tourAnimation.value = requestAnimationFrame(animate)
  }

  // 开始动画循环
  tourAnimation.value = requestAnimationFrame(animate)
}

// 停止相机漫游
const stopCameraTour = () => {
  isCameraTouring.value = false
  if (tourAnimation.value) {
    cancelAnimationFrame(tourAnimation.value)
    tourAnimation.value = null
  }
  ElMessage.success('漫游播放完成')
}

// 根据路径类型创建路径
const createPathFromPoints = (points: THREE.Vector3[], pathType: string) => {
  console.log('创建路径，类型:', pathType, '点数:', points.length)

  switch (pathType) {
    case 'linear':
      // 线性路径：连接所有点
      if (points.length === 2) {
        return new THREE.LineCurve3(points[0], points[1])
      } else {
        // 多个点时，使用CatmullRom曲线连接所有点
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom')
      }

    case 'polyline':
      // 折线：连接所有点
      return new THREE.CatmullRomCurve3(points, false, 'catmullrom')

    case 'bezier':
      // 贝塞尔曲线：需要4个点
      if (points.length >= 4) {
        return new THREE.CubicBezierCurve3(points[0], points[1], points[2], points[3])
      } else {
        // 点数不足时，使用CatmullRom曲线
        return new THREE.CatmullRomCurve3(points, false, 'catmullrom')
      }

    case 'spline':
      // 样条曲线：连接所有点
      return new THREE.CatmullRomCurve3(points, false, 'catmullrom')

    default:
      // 默认使用CatmullRom曲线连接所有点
      return new THREE.CatmullRomCurve3(points, false, 'catmullrom')
  }
}

// 窗口大小改变
const onWindowResize = () => {
  if (!container.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  const aspect = width / height

  if ((camera.value as any).isPerspectiveCamera) {
    ;(camera.value as THREE.PerspectiveCamera).aspect = aspect
    ;(camera.value as THREE.PerspectiveCamera).updateProjectionMatrix()
  } else if ((camera.value as any).isOrthographicCamera) {
    const frustumSize = currentOrthoFrustumSize.value
    const halfH = frustumSize / 2
    const halfW = halfH * aspect
    const ortho = camera.value as THREE.OrthographicCamera
    ortho.left = -halfW
    ortho.right = halfW
    ortho.top = halfH
    ortho.bottom = -halfH
    ortho.updateProjectionMatrix()
  }

  renderer.value.setSize(width, height)
  // 更新后处理分辨率
  if (fxaaPass && renderer.value) {
    const pixelRatio = renderer.value.getPixelRatio()
    fxaaPass.material.uniforms['resolution'].value.x = 1 / (width * pixelRatio)
    fxaaPass.material.uniforms['resolution'].value.y = 1 / (height * pixelRatio)
  }
  if (bloomPass) {
    bloomPass.setSize(width, height)
  }
}

// 切换为正交相机
const switchToOrthographic = () => {
  if (!container.value || !scene.value || !renderer.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  const aspect = width / height

  const frustumSize = currentOrthoFrustumSize.value
  const halfH = frustumSize / 2
  const halfW = halfH * aspect

  const oldCam = camera.value
  const ortho = new THREE.OrthographicCamera(-halfW, halfW, halfH, -halfH, 0.1, 1000)
  ortho.position.copy(oldCam.position)
  ;(ortho as any).lookAt(controls.value.target)

  camera.value = ortho
  cameraMode.value = 'orthographic'

  // 重新绑定控制器
  controls.value.object = camera.value
  controls.value.update()
}

// 切换为透视相机
const switchToPerspective = () => {
  if (!container.value || !scene.value || !renderer.value) return

  const width = container.value.clientWidth
  const height = container.value.clientHeight
  const aspect = width / height

  const oldCam = camera.value
  const persp = new THREE.PerspectiveCamera(50, aspect, 0.1, 1000)
  persp.position.copy(oldCam.position)
  ;(persp as any).lookAt(controls.value.target)

  camera.value = persp
  cameraMode.value = 'perspective'

  // 重新绑定控制器
  controls.value.object = camera.value
  controls.value.update()
}

// 阴影类型切换
const setShadowType = (shadowType: string) => {
  if (!renderer.value) return
  const map = {
    BasicShadowMap: THREE.BasicShadowMap,
    PCFShadowMap: THREE.PCFShadowMap,
    PCFSoftShadowMap: THREE.PCFSoftShadowMap,
    VSMShadowMap: THREE.VSMShadowMap
  } as Record<string, any>
  const type = map[shadowType] ?? THREE.PCFSoftShadowMap
  renderer.value.shadowMap.type = type
  renderer.value.shadowMap.needsUpdate = true
}

// 阴影预设：性能/效果
const applyShadowPreset = (preset: 'performance' | 'quality') => {
  if (!directionalLight.value || !renderer.value) return
  // 保护当前阴影类型，不被预设改动
  const currentType = renderer.value.shadowMap.type

  if (preset === 'performance') {
    directionalLight.value.shadow.mapSize.width = 1024
    directionalLight.value.shadow.mapSize.height = 1024
    directionalLight.value.shadow.bias = -0.0005
    directionalLight.value.shadow.normalBias = 0.02
  } else {
    directionalLight.value.shadow.mapSize.width = 4096
    directionalLight.value.shadow.mapSize.height = 4096
    directionalLight.value.shadow.bias = -0.0001
    directionalLight.value.shadow.normalBias = 0.02
  }

  // 强制恢复为原先类型，避免其他逻辑意外覆盖
  renderer.value.shadowMap.type = currentType
  renderer.value.shadowMap.needsUpdate = true
  shadowPreset.value = preset
}

// FXAA（占位：渲染路径待接入 EffectComposer，这里仅记录状态）
const toggleFxaa = (enabled: boolean) => {
  fxaaEnabled.value = enabled
}

// Bloom（占位：同上）
const toggleBloom = (enabled: boolean) => {
  bloomEnabled.value = enabled
}
const updateBloomStrength = (strength: number) => {
  bloomStrength.value = strength
}

// Fog 线性雾
const toggleFog = (enabled: boolean) => {
  fogEnabled.value = enabled
  if (!scene.value) return
  if (enabled) {
    const color = new THREE.Color(fogColor.value)
    scene.value.fog = new THREE.Fog(color, fogNear.value, fogFar.value)
    scene.value.background = color
  } else {
    scene.value.fog = null
    // 背景交由原配置（skybox 或颜色），不强制改回
  }
}
const updateFogNear = (near: number) => {
  fogNear.value = near
  if (scene.value?.fog) (scene.value.fog as THREE.Fog).near = near
}
const updateFogFar = (far: number) => {
  fogFar.value = far
  if (scene.value?.fog) (scene.value.fog as THREE.Fog).far = far
}
const updateFogColor = (hex: string) => {
  fogColor.value = hex
  if (scene.value?.fog) (scene.value.fog as THREE.Fog).color.set(hex)
  // 若无 skybox，背景色同步
  if (scene.value && !skyboxSettings.value.enabled) {
    scene.value.background = new THREE.Color(hex)
  }
}

const toggleShadowPresetInInfo = () => {
  const next = shadowPreset.value === 'performance' ? 'quality' : 'performance'
  applyShadowPreset(next)
}

// 渲染循环
const animate = () => {
  requestAnimationFrame(animate)

  // 更新所有模型的动画混合器
  const deltaTime = clock.getDelta()
  modelAnimationMixers.value.forEach((mixer, modelId) => {
    if (mixer) {
      mixer.update(deltaTime)
    }
  })

  // 更新当前选中模型的动画混合器（向后兼容）
  if (animationMixer) {
    animationMixer.update(deltaTime)
  }

  // 更新反射探针
  updateReflectionProbes()

  // 更新粒子泼溅系统
  if (particleSplashSystem) {
    particleSplashSystem.update(deltaTime)
  }

  controls.value.update()
  if (composer) {
    // 根据开关动态拼装 Pass 列表
    composer.passes = []
    if (renderPass) composer.addPass(renderPass)
    if (fxaaEnabled.value && fxaaPass) composer.addPass(fxaaPass)
    if (bloomEnabled.value && bloomPass) {
      bloomPass.strength = bloomStrength.value
      composer.addPass(bloomPass)
    }
    composer.render()
  } else {
  renderer.value.render(scene.value, camera.value)
  }
}

// 更新所有反射探针
const updateReflectionProbes = () => {
  if (!scene.value) return

  scene.value.traverse((object) => {
    if (object instanceof THREE.Mesh && object.userData.reflectionProbe) {
      const probe = object.userData.reflectionProbe
      // 更新反射探针位置
      probe.camera.position.copy(object.position)
      // 更新反射贴图
      probe.update()
    }
  })
}

// 更新场景中所有对象的环境贴图
const updateObjectsEnvironmentMap = () => {
  if (!scene.value) return

  const environmentMap = scene.value.environment

  scene.value.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material) {
      const material = object.material

      // 处理单个材质
      if (material.envMap !== environmentMap) {
        material.envMap = environmentMap
        material.needsUpdate = true
      }

      // 处理材质数组
      if (Array.isArray(material)) {
        material.forEach(mat => {
          if (mat.envMap !== environmentMap) {
            mat.envMap = environmentMap
            mat.needsUpdate = true
          }
        })
      }

      // 对于有反射探针的对象，保持反射探针的贴图
      if (object.userData.reflectionProbe) {
        const probe = object.userData.reflectionProbe
        // 保持反射探针的贴图，不覆盖为环境贴图
        material.envMap = probe.texture
        material.needsUpdate = true
      }
    }
  })

  if (environmentMap) {
    console.log('已更新场景中所有对象的环境贴图')
  } else {
    console.log('已清除场景中所有对象的环境贴图')
  }
}

// 默认反射清晰度设置
const defaultReflectionSettings = {
  resolution: 1024, // 反射探针分辨率，越高越清晰
  roughness: 0.0,   // 镜面粗糙度，0为完全光滑
  envMapIntensity: 2.0, // 环境贴图强度
  clearcoatRoughness: 0.0 // 清漆粗糙度
}

// 反射清晰度设置
const reflectionSettings = ref({ ...defaultReflectionSettings })

// 判断当前选中的对象是否是反射材质
const isReflectionMaterial = computed(() => {
  if (!selectedObject.value) return false

  const material = selectedObject.value.material
  if (!material) return false

  // 检查是否是反射材质 - 基于材质类型而不是参数值
  if (material instanceof THREE.MeshPhysicalMaterial) {
    // 检查是否是镜面、铬合金等反射材质类型
    return material.metalness > 0.8 && material.reflectivity > 0.5
  }

  return false
})

// 同步选中对象的反射设置到控制面板
const syncReflectionSettings = () => {
  if (!selectedObject.value || !isReflectionMaterial.value) return

  const material = selectedObject.value.material as THREE.MeshPhysicalMaterial

  // 同步当前材质的参数到控制面板
  reflectionSettings.value.roughness = material.roughness
  reflectionSettings.value.envMapIntensity = material.envMapIntensity
  reflectionSettings.value.clearcoatRoughness = material.clearcoatRoughness

  console.log('已同步选中对象的反射设置:', reflectionSettings.value)
}

// 创建反射探针 - 用于实现真实反射
const createReflectionProbe = (position: THREE.Vector3, size: number = 10) => {
  if (!scene.value || !renderer.value || !camera.value) return null

  // 创建高分辨率反射相机
  const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(reflectionSettings.value.resolution)
  const reflectionCamera = new THREE.CubeCamera(0.1, 1000, cubeRenderTarget)

  // 设置反射相机位置
  reflectionCamera.position.copy(position)

  // 创建反射贴图
  const reflectionTexture = reflectionCamera.renderTarget.texture
  reflectionTexture.colorSpace = THREE.SRGBColorSpace

  return {
    camera: reflectionCamera,
    texture: reflectionTexture,
    update: () => {
      // 更新反射贴图
      reflectionCamera.update(renderer.value, scene.value)
    }
  }
}

// 为反射材质创建实时反射
const setupRealTimeReflection = () => {
  if (!scene.value) return

  // 遍历场景中的所有对象
  scene.value.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material) {
      const material = object.material

      // 检查是否是反射材质
      if (material instanceof THREE.MeshPhysicalMaterial &&
          material.metalness > 0.8 &&
          material.roughness < 0.2) {

        // 为反射材质创建反射探针
        const probe = createReflectionProbe(object.position, 20)
        if (probe) {
          // 将反射探针的贴图设置为材质的环境贴图
          material.envMap = probe.texture
          material.needsUpdate = true

          // 存储探针引用以便后续更新
          object.userData.reflectionProbe = probe

          console.log(`为 ${object.name || '对象'} 创建了反射探针`)
        }
      }
    }
  })
}

// 重新创建所有反射探针（用于修复反射失效）
const recreateAllReflectionProbes = () => {
  if (!scene.value) return

  console.log('重新创建所有反射探针...')

  // 清理现有反射探针
  scene.value.traverse((object) => {
    if (object instanceof THREE.Mesh && object.userData.reflectionProbe) {
      const probe = object.userData.reflectionProbe
      if (probe.camera && probe.camera.renderTarget) {
        probe.camera.renderTarget.dispose()
      }
      delete object.userData.reflectionProbe
    }
  })

  // 重新创建反射探针
  setupRealTimeReflection()

  console.log('反射探针重新创建完成')
}

// 更新反射清晰度设置
const updateReflectionClarity = (settings: any) => {
  reflectionSettings.value = { ...reflectionSettings.value, ...settings }

  // 更新所有反射材质的设置
  scene.value?.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material) {
      const material = object.material

      // 检查是否是镜面材质 - 使用更宽松的条件
      if (material instanceof THREE.MeshPhysicalMaterial &&
          material.metalness > 0.8 &&
          material.reflectivity > 0.5) {

        // 更新材质参数
        if (settings.roughness !== undefined) {
          material.roughness = settings.roughness
        }
        if (settings.envMapIntensity !== undefined) {
          material.envMapIntensity = settings.envMapIntensity
        }
        if (settings.clearcoatRoughness !== undefined) {
          material.clearcoatRoughness = settings.clearcoatRoughness
        }

        material.needsUpdate = true
        console.log(`更新材质 ${object.name} 的反射参数:`, {
          roughness: material.roughness,
          envMapIntensity: material.envMapIntensity,
          clearcoatRoughness: material.clearcoatRoughness
        })
      }
    }
  })

  // 如果分辨率改变，重新创建反射探针
  if (settings.resolution !== undefined) {
    recreateAllReflectionProbes()
  }

  console.log('反射清晰度设置已更新:', reflectionSettings.value)
}

// 重置反射清晰度设置为默认值
const resetReflectionSettings = () => {
  reflectionSettings.value = { ...defaultReflectionSettings }

  // 更新所有反射材质的设置
  scene.value?.traverse((object) => {
    if (object instanceof THREE.Mesh && object.material) {
      const material = object.material

      // 检查是否是镜面材质 - 使用更宽松的条件
      if (material instanceof THREE.MeshPhysicalMaterial &&
          material.metalness > 0.8 &&
          material.reflectivity > 0.5) {

        // 重置材质参数为默认值
        material.roughness = defaultReflectionSettings.roughness
        material.envMapIntensity = defaultReflectionSettings.envMapIntensity
        material.clearcoatRoughness = defaultReflectionSettings.clearcoatRoughness

        material.needsUpdate = true
        console.log(`重置材质 ${object.name} 的反射参数为默认值`)
      }
    }
  })

  // 重新创建反射探针以应用新的分辨率
  recreateAllReflectionProbes()

  console.log('反射清晰度设置已重置为默认值:', defaultReflectionSettings)
  ElMessage.success('反射设置已重置为默认值')
}

// 创建几何体
const createGeometry = (type: string) => {
  if (!geometryManager || !materialManager || !sceneManager) return

  // 使用管理器创建几何体和材质
  const geometry = geometryManager.createGeometry(type)

  // 为不同材质类型设置合适的默认颜色
  let defaultColor = 0x888888 // 中性灰色作为默认颜色

  // 根据材质类型设置不同的默认颜色
  switch (props.activeMaterial) {
    case 'mirror':
    case 'chrome':
    case 'silver':
      defaultColor = 0xc0c0c0 // 银白色
      break
    case 'gold':
      defaultColor = 0xffd700 // 金黄色
      break
    case 'copper':
      defaultColor = 0xb87333 // 铜色
      break
    case 'glass':
    case 'crystal':
      defaultColor = 0xffffff // 白色透明
      break
    case 'basic':
      defaultColor = 0x4CAF50 // 绿色
      break
    case 'standard':
      defaultColor = 0x888888 // 中性灰色
      break
    case 'phong':
      defaultColor = 0x2196F3 // 蓝色
      break
    case 'lambert':
      defaultColor = 0xFF9800 // 橙色
      break
  }

  const materialParams: any = { color: defaultColor }
  if (scene.value?.environment && ['mirror', 'chrome', 'gold', 'silver', 'copper', 'glass', 'crystal', 'physical'].includes(props.activeMaterial)) {
    materialParams.envMap = scene.value.environment
  }

  // 为镜面材质添加反射清晰度设置
  if (props.activeMaterial === 'mirror') {
    materialParams.roughness = reflectionSettings.value.roughness
    materialParams.envMapIntensity = reflectionSettings.value.envMapIntensity
    materialParams.clearcoatRoughness = reflectionSettings.value.clearcoatRoughness
  }

  const material = materialManager.createMaterial(props.activeMaterial, materialParams)

  const mesh = new THREE.Mesh(geometry, material)

  // 增强阴影设置
  mesh.castShadow = true
  mesh.receiveShadow = true

  // 设置基于材质类型的默认对象名称
  const materialNameMap: { [key: string]: string } = {
    'basic': '基础材质',
    'standard': '标准材质',
    'phong': 'Phong材质',
    'lambert': 'Lambert材质',
    'toon': '卡通材质',
    'normal': '法线材质',
    'wireframe': '线框材质',
    'mirror': '镜面',
    'chrome': '铬合金',
    'gold': '黄金',
    'silver': '白银',
    'copper': '铜质',
    'glass': '玻璃',
    'crystal': '水晶',
    'physical': '物理材质'
  }

  const baseName = materialNameMap[props.activeMaterial] || '对象'

  // 计算相同材质类型的对象数量
  const existingObjects = scene.value?.children.filter(child =>
      child instanceof THREE.Mesh &&
      child.name.startsWith(baseName)
  ) || []

  const objectNumber = existingObjects.length + 1
  mesh.name = `${baseName}${objectNumber}`

  // 随机位置，确保在地面之上
  mesh.position.set(
      (Math.random() - 0.5) * 10,
      Math.max(0.5, (Math.random() - 0.5) * 10), // 确保Y坐标在地面之上
      (Math.random() - 0.5) * 10
  )

  // 如果是反射材质，创建反射探针
  if (['mirror', 'chrome', 'gold', 'silver', 'copper'].includes(props.activeMaterial)) {
    const probe = createReflectionProbe(mesh.position, 20)
    if (probe) {
      // 将反射探针的贴图设置为材质的环境贴图
      material.envMap = probe.texture
      material.needsUpdate = true

      // 存储探针引用以便后续更新
      mesh.userData.reflectionProbe = probe

      console.log(`为 ${mesh.name} 创建了反射探针`)
    }
  }

  // 使用场景管理器添加对象
  const objectId = sceneManager.addObject(mesh, 'mesh')
  sceneObjects.value = sceneManager.getAllObjects()

  // 自动选择新创建的对象
  selectObject(mesh)
}

// 监听几何体变化
watch(() => props.activeGeometry, (newGeometry) => {
  if (newGeometry) {
    createGeometry(newGeometry)
  }
})

/**
 * 清空场景
 * 移除场景中的所有3D对象，保留基础环境（网格、坐标轴等）
 */
const clearScene = () => {
  if (sceneManager) {
    // 清理所有反射探针
    scene.value?.traverse((object) => {
      if (object instanceof THREE.Mesh && object.userData.reflectionProbe) {
        const probe = object.userData.reflectionProbe
        // 清理反射探针资源
        if (probe.camera && probe.camera.renderTarget) {
          probe.camera.renderTarget.dispose()
        }
        delete object.userData.reflectionProbe
      }
    })

    sceneManager.clearScene()
    sceneObjects.value = []
    clearSelection()
    ElMessage.success('场景已清空')
  }
}

/**
 * 重置相机位置
 * 将相机恢复到初始位置和角度
 */
const resetCamera = () => {
  if (cameraController) {
    cameraController.reset()
    ElMessage.success('相机已重置')
  }
}

// 切换网格坐标轴显示
const toggleGridAxes = () => {
  const grid = scene.value.getObjectByName('grid')
  const axes = scene.value.getObjectByName('axes')

  if (grid && axes) {
    // 如果网格或坐标轴任一可见，则隐藏两者
    // 如果两者都不可见，则显示两者
    const shouldShow = !grid.visible && !axes.visible

    grid.visible = shouldShow
    axes.visible = shouldShow

    isGridVisible.value = shouldShow
    isAxesVisible.value = shouldShow
  }
}

// 保持原有的单独切换函数（用于向后兼容）
const toggleGrid = () => {
  const grid = scene.value.getObjectByName('grid')
  if (grid) {
    grid.visible = !grid.visible
    isGridVisible.value = grid.visible
  }
}

const toggleAxes = () => {
  const axes = scene.value.getObjectByName('axes')
  if (axes) {
    axes.visible = !axes.visible
    isAxesVisible.value = axes.visible
  }
}

// 属性编辑器方法
// 更新对象名称
const updateObjectName = () => {
  if (!selectedObject.value) return

  const newName = objectName.value.trim()
  if (newName && newName !== selectedObject.value.name) {
    selectedObject.value.name = newName
    // 更新场景对象列表
    if (sceneManager) {
      sceneObjects.value = sceneManager.getAllObjects()
    }
    console.log('对象名称已更新:', newName)
  }
}

const updatePosition = () => {
  if (!selectedObject.value) return

  selectedObject.value.position.set(position.value.x, position.value.y, position.value.z)
}

const validatePosition = () => {
  // 确保位置值在合理范围内
  position.value.x = Math.max(-100, Math.min(100, position.value.x))
  position.value.y = Math.max(-100, Math.min(100, position.value.y))
  position.value.z = Math.max(-100, Math.min(100, position.value.z))
  updatePosition()
}

const updateRotation = () => {
  if (!selectedObject.value) return

  // 将角度转换为弧度
  const xRad = (rotation.value.x * Math.PI) / 180
  const yRad = (rotation.value.y * Math.PI) / 180
  const zRad = (rotation.value.z * Math.PI) / 180

  selectedObject.value.rotation.set(xRad, yRad, zRad)
}

const validateRotation = () => {
  // 确保旋转值在合理范围内
  rotation.value.x = ((rotation.value.x % 360) + 360) % 360
  rotation.value.y = ((rotation.value.y % 360) + 360) % 360
  rotation.value.z = ((rotation.value.z % 360) + 360) % 360
  updateRotation()
}

const updateScale = () => {
  if (!selectedObject.value) return

  if (uniformScale.value) {
    // 统一缩放
    const avgScale = (scale.value.x + scale.value.y + scale.value.z) / 3
    selectedObject.value.scale.setScalar(Math.max(0.1, avgScale))
    scale.value.x = scale.value.y = scale.value.z = avgScale
  } else {
    // 分别缩放
    selectedObject.value.scale.set(
        Math.max(0.1, scale.value.x),
        Math.max(0.1, scale.value.y),
        Math.max(0.1, scale.value.z)
    )
  }
}

const validateScale = () => {
  // 确保缩放值在合理范围内
  scale.value.x = Math.max(0.1, Math.min(10, scale.value.x))
  scale.value.y = Math.max(0.1, Math.min(10, scale.value.y))
  scale.value.z = Math.max(0.1, Math.min(10, scale.value.z))
  updateScale()
}

const toggleUniformScale = () => {
  if (uniformScale.value) {
    // 启用统一缩放时，使用当前X轴的值
    const currentScale = scale.value.x
    scale.value.y = scale.value.z = currentScale
    updateScale()
  }
}

// 更新位置滑块最大值
const updatePositionMax = () => {
  // 确保最大值在合理范围内
  positionMax.value = Math.max(1, Math.min(1000, positionMax.value))

  // 检查当前值是否超出新的最大值范围
  if (Math.abs(position.value.x) > positionMax.value) {
    position.value.x = Math.sign(position.value.x) * positionMax.value
  }
  if (Math.abs(position.value.y) > positionMax.value) {
    position.value.y = Math.sign(position.value.y) * positionMax.value
  }
  if (Math.abs(position.value.z) > positionMax.value) {
    position.value.z = Math.sign(position.value.z) * positionMax.value
  }

  updatePosition()
  console.log(`位置滑块最大值已更新: ${positionMax.value}m`)
}

// 更新缩放滑块最大值
const updateScaleMax = () => {
  // 确保最大值在合理范围内
  scaleMax.value = Math.max(1, Math.min(100, scaleMax.value))

  // 检查当前值是否超出新的最大值范围
  if (scale.value.x > scaleMax.value) {
    scale.value.x = scaleMax.value
  }
  if (scale.value.y > scaleMax.value) {
    scale.value.y = scaleMax.value
  }
  if (scale.value.z > scaleMax.value) {
    scale.value.z = scaleMax.value
  }

  updateScale()
  console.log(`缩放滑块最大值已更新: ${scaleMax.value}x`)
}

const resetTransform = () => {
  if (!selectedObject.value) return

  // 重置位置
  position.value = { x: 0, y: 0, z: 0 }
  selectedObject.value.position.set(0, 0, 0)

  // 重置旋转
  rotation.value = { x: 0, y: 0, z: 0 }
  selectedObject.value.rotation.set(0, 0, 0)

  // 重置缩放
  scale.value = { x: 1, y: 1, z: 1 }
  selectedObject.value.scale.set(1, 1, 1)
}

const centerObject = () => {
  if (!selectedObject.value) return

  // 将对象居中到场景中心
  position.value = { x: 0, y: 0, z: 0 }
  selectedObject.value.position.set(0, 0, 0)
}

const duplicateObject = () => {
  if (!selectedObject.value || !sceneManager) return

  // 克隆选中的对象
  const clonedObject = selectedObject.value.clone()

  // 稍微偏移位置避免重叠
  clonedObject.position.x += 2
  clonedObject.position.y += 2

  // 添加到场景
  scene.value.add(clonedObject)
  sceneManager.addObject(clonedObject, 'mesh')

  // 更新场景对象列表
  sceneObjects.value = sceneManager.getAllObjects()

  // 选择新复制的对象
  selectObject(clonedObject)
}

// 导出场景为ZIP包
const exportSceneAsZip = async () => {
  try {
    const zip = new JSZip()

    // 创建场景数据JSON
    const sceneData = {
          version: '1.1.0', // 版本号更新以支持自定义光源
          exportTime: new Date().toISOString(),
          camera: {
            position: {
              x: camera.value.position.x,
              y: camera.value.position.y,
              z: camera.value.position.z
            },
            rotation: {
              x: camera.value.rotation.x,
              y: camera.value.rotation.y,
              z: camera.value.rotation.z
            }
          },
          // 光源配置
          lights: {
            // 基础光源设置
            basic: lightSettings.value,
            // 自定义光源
            custom: customLights.value
          },
          // 天空盒配置
          skybox: skyboxSettings.value,
          objects: sceneObjects.value.map(obj => {
            // 强制更新对象的矩阵以确保位置、旋转、缩放是最新的
            obj.updateMatrix()
            obj.updateMatrixWorld(true)

            const objData: any = {
              id: obj.uuid,
              name: obj.name,
              type: obj.type,
              // 记录原始文件名用于导入匹配（避免 File 在 JSON 中丢失）
              originalFileName: obj.userData && obj.userData.originalFile && obj.userData.originalFile.name ? obj.userData.originalFile.name : undefined,
              position: {
                x: obj.position.x,
                y: obj.position.y,
                z: obj.position.z
              },
              rotation: {
                x: obj.rotation.x,
                y: obj.rotation.y,
                z: obj.rotation.z
              },
              scale: {
                x: obj.scale.x,
                y: obj.scale.y,
                z: obj.scale.z
              },
              visible: obj.visible,
              userData: obj.userData
            }

            console.log(`导出对象 ${obj.name}:`, {
              位置: objData.position,
              旋转: objData.rotation,
              缩放: objData.scale
            })

            // 如果是网格对象，导出几何体数据
            if (obj instanceof THREE.Mesh && obj.geometry) {
              objData.geometry = {
                type: obj.geometry.type,
                parameters: obj.geometry.parameters || {},
                attributes: {},
                index: null,
                groups: obj.geometry.groups || [],
                boundingBox: obj.geometry.boundingBox ? {
                  min: {
                    x: obj.geometry.boundingBox.min.x,
                    y: obj.geometry.boundingBox.min.y,
                    z: obj.geometry.boundingBox.min.z
                  },
                  max: {
                    x: obj.geometry.boundingBox.max.x,
                    y: obj.geometry.boundingBox.max.y,
                    z: obj.geometry.boundingBox.max.z
                  }
                } : null,
                boundingSphere: obj.geometry.boundingSphere ? {
                  center: {
                    x: obj.geometry.boundingSphere.center.x,
                    y: obj.geometry.boundingSphere.center.y,
                    z: obj.geometry.boundingSphere.center.z
                  },
                  radius: obj.geometry.boundingSphere.radius
                } : null
              }
            } else if (obj instanceof THREE.Group) {
              // 对于Group对象，导出子对象信息
              objData.isGroup = true
              objData.children = obj.children.map(child => ({
                uuid: child.uuid,
                name: child.name,
                type: child.type,
                position: {
                  x: child.position.x,
                  y: child.position.y,
                  z: child.position.z
                },
                rotation: {
                  x: child.rotation.x,
                  y: child.rotation.y,
                  z: child.rotation.z
                },
                scale: {
                  x: child.scale.x,
                  y: child.scale.y,
                  z: child.scale.z
                },
                visible: child.visible
              }))
            } else {
              // 对于其他类型的对象，标记为特殊类型
              objData.specialType = obj.type
              objData.hasGeometry = !!(obj as any).geometry
              objData.hasMaterial = !!(obj as any).material

              // 如果是内置模型，添加特殊标识
              if (obj.userData && obj.userData.builtinModel) {
                objData.isBuiltinModel = true
                objData.modelId = obj.userData.modelId
                objData.category = obj.userData.category
                objData.originalPath = builtinModels.value.find(m => m.id === obj.userData.modelId)?.path
              }
            }

            // 导出索引数据（仅对Mesh对象）
            if (obj instanceof THREE.Mesh && obj.geometry && obj.geometry.index) {
              objData.geometry.index = {
                array: Array.from(obj.geometry.index.array),
                count: obj.geometry.index.count
              }
            }

            // 导出所有几何体属性（仅对Mesh对象）
            if (obj instanceof THREE.Mesh && obj.geometry) {
              const attributeNames = Object.keys(obj.geometry.attributes)
              for (const attrName of attributeNames) {
                const attr = obj.geometry.attributes[attrName]
                objData.geometry.attributes[attrName] = {
                  array: Array.from(attr.array),
                  itemSize: attr.itemSize,
                  count: attr.count,
                  normalized: attr.normalized,
                  type: attr.array.constructor.name
                }
              }
            }

            // 导出材质数据
            if (obj instanceof THREE.Mesh && obj.material) {
              const material = obj.material
              objData.material = {
                type: material.type,
                uuid: material.uuid,
                name: material.name,
                color: material.color ? {
                  r: material.color.r,
                  g: material.color.g,
                  b: material.color.b
                } : undefined,
                transparent: material.transparent,
                opacity: material.opacity,
                wireframe: material.wireframe,
                side: material.side,
                alphaTest: material.alphaTest,
                alphaToCoverage: material.alphaToCoverage,
                blendDst: material.blendDst,
                blendDstAlpha: material.blendDstAlpha,
                blendEquation: material.blendEquation,
                blendEquationAlpha: material.blendEquationAlpha,
                blendSrc: material.blendSrc,
                blendSrcAlpha: material.blendSrcAlpha,
                blending: material.blending,
                clipIntersection: material.clipIntersection,
                clippingPlanes: material.clippingPlanes,
                clipShadows: material.clipShadows,
                colorWrite: material.colorWrite,
                defines: material.defines,
                depthFunc: material.depthFunc,
                depthTest: material.depthTest,
                depthWrite: material.depthWrite,
                fog: material.fog,
                stencilWrite: material.stencilWrite,
                stencilFunc: material.stencilFunc,
                stencilRef: material.stencilRef,
                stencilMask: material.stencilMask,
                stencilFail: material.stencilFail,
                stencilZFail: material.stencilZFail,
                stencilZPass: material.stencilZPass,
                stencilWriteMask: material.stencilWriteMask,
                toneMapped: material.toneMapped,
                vertexColors: material.vertexColors,
                visible: material.visible
              }

              // 导出特定材质的属性
              if (material instanceof THREE.MeshStandardMaterial) {
                objData.material.metalness = material.metalness
                objData.material.roughness = material.roughness
                objData.material.emissive = material.emissive ? {
                  r: material.emissive.r,
                  g: material.emissive.g,
                  b: material.emissive.b
                } : undefined
                objData.material.emissiveIntensity = material.emissiveIntensity
                objData.material.envMapIntensity = material.envMapIntensity
              }

              if (material instanceof THREE.MeshPhongMaterial) {
                objData.material.shininess = material.shininess
                objData.material.emissive = material.emissive ? {
                  r: material.emissive.r,
                  g: material.emissive.g,
                  b: material.emissive.b
                } : undefined
                objData.material.emissiveIntensity = material.emissiveIntensity
                objData.material.specular = material.specular ? {
                  r: material.specular.r,
                  g: material.specular.g,
                  b: material.specular.b
                } : undefined
              }

              if (material instanceof THREE.MeshLambertMaterial) {
                objData.material.emissive = material.emissive ? {
                  r: material.emissive.r,
                  g: material.emissive.g,
                  b: material.emissive.b
                } : undefined
                objData.material.emissiveIntensity = material.emissiveIntensity
              }
            }

            return objData
          }),
          settings: {
            gridVisible: isGridVisible.value,
            axesVisible: isAxesVisible.value,
            highlightSettings: highlightSettings.value
          }
        }

        // 添加漫游配置信息到场景数据
    ;(sceneData as any).tourConfigs = savedTourConfigs.value

    // 添加动画状态信息到场景数据
    ;(sceneData as any).animationStates = Object.fromEntries(modelAnimationStates.value)

    // 添加场景数据到ZIP
    zip.file('scene-data.json', JSON.stringify(sceneData, null, 2))

    // 导出原始模型文件（如果有的话）
    let modelIndex = 0
    let exportedFiles = 0
    console.log(`开始导出模型文件，场景对象数量: ${sceneObjects.value.length}`)

    for (const obj of sceneObjects.value) {
      console.log(`检查对象 ${obj.name}:`, {
        hasUserData: !!obj.userData,
        hasOriginalFile: !!(obj.userData && obj.userData.originalFile),
        userData: obj.userData
      })

      if (obj.userData && obj.userData.originalFile) {
        const file = obj.userData.originalFile
        console.log(`原始文件信息:`, {
          name: file.name,
          size: file.size,
          type: file.type
        })

        // 安全检查文件名
        if (!file.name) {
          console.warn(`对象 ${obj.name} 的原始文件缺少名称，跳过导出`)
          continue
        }

        const extension = getFileExtension(file.name)
        if (!extension) {
          console.warn(`无法确定文件 ${file.name} 的扩展名，跳过导出`)
          continue
        }

        const fileName = `model_${modelIndex}_${obj.name || 'object'}.${extension}`
        zip.file(fileName, file)
        console.log(`导出模型文件: ${fileName}`)
        modelIndex++
        exportedFiles++
      } else {
        console.log(`对象 ${obj.name} 没有原始文件信息，跳过导出`)
      }
    }

    console.log(`导出了 ${exportedFiles} 个原始模型文件`)

    // 生成ZIP文件
    const zipBlob = await zip.generateAsync({ type: 'blob' })

    // 下载ZIP文件
    const url = URL.createObjectURL(zipBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `scene_export_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    console.log('场景已导出为ZIP包，包含', sceneObjects.value.length, '个对象')
    ElMessage.success(`场景导出成功！包含 ${sceneObjects.value.length} 个对象，导出了 ${exportedFiles} 个原始模型文件`)
  } catch (error) {
    console.error('导出ZIP包失败:', error)
    ElMessage.error('导出失败: ' + error.message)
  }
}

// 从ZIP包导入场景
const importSceneFromZip = async (file: File) => {
  try {
    const zip = new JSZip()
    const zipContent = await zip.loadAsync(file)

    // 读取场景数据
    const sceneDataFile = zipContent.file('scene-data.json')
    if (!sceneDataFile) {
      throw new Error('ZIP包中未找到场景数据文件')
    }

    const sceneData = JSON.parse(await sceneDataFile.async('text'))
    console.log('导入场景数据:', sceneData)

    // 清空当前场景
    clearScene()

    // 恢复相机位置
    if (sceneData.camera) {
      camera.value.position.set(
          sceneData.camera.position.x,
          sceneData.camera.position.y,
          sceneData.camera.position.z
      )
      camera.value.rotation.set(
          sceneData.camera.rotation.x,
          sceneData.camera.rotation.y,
          sceneData.camera.rotation.z
      )
    }

    // 恢复设置
    if (sceneData.settings) {
      isGridVisible.value = sceneData.settings.gridVisible || false
      isAxesVisible.value = sceneData.settings.axesVisible || false
      if (sceneData.settings.highlightSettings) {
        Object.assign(highlightSettings.value, sceneData.settings.highlightSettings)
      }
    }

    // 恢复光源配置
    if (sceneData.lights) {
      // 恢复基础光源设置
      if (sceneData.lights.basic) {
        Object.assign(lightSettings.value, sceneData.lights.basic)
        updateLightSettings()
      }

      // 恢复自定义光源
      if (sceneData.lights.custom && Array.isArray(sceneData.lights.custom)) {
        customLights.value = sceneData.lights.custom
        // 重新创建自定义光源
        customLights.value.forEach(lightData => {
          createCustomLight(lightData)
        })
        console.log(`导入 ${sceneData.lights.custom.length} 个自定义光源`)
      }
    }

    // 恢复天空盒配置
    if (sceneData.skybox) {
      Object.assign(skyboxSettings.value, sceneData.skybox)
      updateSkyboxSettings()
      console.log('恢复天空盒配置:', skyboxSettings.value)
    }

    // 恢复漫游配置
    if (sceneData.tourConfigs && Array.isArray(sceneData.tourConfigs)) {
      savedTourConfigs.value = sceneData.tourConfigs
      console.log(`导入 ${sceneData.tourConfigs.length} 个漫游配置`)
    } else {
      savedTourConfigs.value = []
      console.log('未找到漫游配置信息')
    }

    // 恢复动画状态
    if (sceneData.animationStates) {
      modelAnimationStates.value = new Map(Object.entries(sceneData.animationStates))
      console.log(`导入 ${modelAnimationStates.value.size} 个模型的动画状态`)
    } else {
      modelAnimationStates.value = new Map()
      console.log('未找到动画状态信息')
    }

    // 导入原始模型文件（如果有的话）
    const modelFiles: File[] = []
    for (const [fileName, file] of Object.entries(zipContent.files)) {
      if (fileName.startsWith('model_') && !file.dir) {
        const blob = await file.async('blob')
        const fileObj = new File([blob], fileName, { type: 'application/octet-stream' })
        console.log(`创建File对象: ${fileName}`, {
          name: fileObj.name,
          size: fileObj.size,
          type: fileObj.type,
          lastModified: fileObj.lastModified
        })
        modelFiles.push(fileObj)
      }
    }

    // 加载所有原始模型文件
    console.log(`找到 ${modelFiles.length} 个原始模型文件`)
    const importedModels: any[] = []
    const failedImports: string[] = []

    for (const modelFile of modelFiles) {
      console.log(`导入原始模型文件: ${modelFile.name}`)
      try {
        const model = await importModel(modelFile)
        if (model) {
          importedModels.push(model)
          console.log(`成功导入模型: ${model.name}`, {
            position: model.position,
            rotation: model.rotation,
            scale: model.scale,
            hasOriginalFile: !!(model.userData && model.userData.originalFile)
          })
        } else {
          console.error(`模型导入失败，返回null: ${modelFile.name}`)
          failedImports.push(modelFile.name)
        }
      } catch (error) {
        console.error(`导入模型时发生错误: ${modelFile.name}`, error)
        failedImports.push(modelFile.name)
      }
    }

    console.log(`成功导入 ${importedModels.length} 个模型，失败 ${failedImports.length} 个`)
    if (failedImports.length > 0) {
      console.warn(`导入失败的模型:`, failedImports)
    }

    // 等待一帧确保所有对象都已添加到场景
    await new Promise(resolve => setTimeout(resolve, 100))

    // 从场景数据重新创建对象
    if (sceneData.objects) {
      console.log(`开始恢复 ${sceneData.objects.length} 个对象的属性`)
      console.log(`当前场景中的对象数量: ${scene.value.children.length}`)
      console.log(`场景中的对象列表:`, scene.value.children.map(child => ({
        uuid: child.uuid,
        name: child.name,
        type: child.type
      })))

      // 创建一个映射来跟踪已处理的对象
      const processedObjects = new Set()
      let processedCount = 0

      for (const objData of sceneData.objects) {
        console.log(`处理对象数据:`, {
          id: objData.id,
          name: objData.name,
          position: objData.position,
          rotation: objData.rotation,
          scale: objData.scale
        })

        // 首先尝试通过UUID匹配（对于从数据重建的对象）
        let obj = scene.value.children.find(child => child.uuid === objData.id)
        if (obj) {
          console.log(`通过UUID匹配找到对象: ${objData.name} (${objData.id})`)
        }

        // 如果UUID匹配失败，尝试通过名称匹配（对于从原始文件导入的对象）
        if (!obj && objData.name) {
          obj = scene.value.children.find(child => child.name === objData.name)
          if (obj) {
            console.log(`通过名称匹配找到对象: ${objData.name}`)
          } else {
            console.log(`通过名称匹配未找到对象: ${objData.name}`)
          }
        }

        // 如果仍然没有找到，尝试通过userData中的originalFile匹配
        if (!obj && (objData.originalFileName || (objData.userData && objData.userData.originalFile))) {
          const originalFileName = objData.originalFileName || (objData.userData && objData.userData.originalFile && objData.userData.originalFile.name)
          obj = scene.value.children.find(child =>
              child.userData &&
              (
                  (child.userData.originalFile && child.userData.originalFile.name === originalFileName) ||
                  child.userData.originalFileName === originalFileName
              )
          )
          if (obj) {
            console.log(`通过原始文件名匹配找到对象: ${originalFileName}`)
          }
        }

        // 如果仍然没有找到，尝试通过内置模型ID匹配
        if (!obj && objData.isBuiltinModel && objData.modelId) {
          obj = scene.value.children.find(child =>
              child.userData &&
              child.userData.builtinModel &&
              child.userData.modelId === objData.modelId
          )
          if (obj) {
            console.log(`通过内置模型ID匹配找到对象: ${objData.name} (${objData.modelId})`)
          }
        }

        // 如果仍然没有找到，尝试通过位置和类型匹配（容错匹配）
        if (!obj && objData.position && objData.type) {
          obj = scene.value.children.find(child => {
            if (child.type !== objData.type) return false
            const pos = child.position
            const targetPos = objData.position
            const distance = Math.sqrt(
                Math.pow(pos.x - targetPos.x, 2) +
                Math.pow(pos.y - targetPos.y, 2) +
                Math.pow(pos.z - targetPos.z, 2)
            )
            return distance < 0.1 // 位置相近（容差0.1单位）
          })
          if (obj) {
            console.log(`通过位置和类型匹配找到对象: ${obj.name} (距离: ${Math.sqrt(
                Math.pow(obj.position.x - objData.position.x, 2) +
                Math.pow(obj.position.y - objData.position.y, 2) +
                Math.pow(obj.position.z - objData.position.z, 2)
            ).toFixed(3)})`)
          }
        }

        if (!obj) {
          console.log(`未找到对象 ${objData.name || objData.id}，尝试重新创建`)
          console.log(`对象数据检查:`, {
            isBuiltinModel: objData.isBuiltinModel,
            modelId: objData.modelId,
            originalPath: objData.originalPath,
            category: objData.category
          })

          // 如果是内置模型，尝试重新加载
          if (objData.isBuiltinModel && objData.modelId) {
            console.log(`尝试重新加载内置模型: ${objData.name} (${objData.modelId})`)
            try {
              const modelInfo = builtinModels.value.find(m => m.id === objData.modelId)
              if (modelInfo) {
                console.log(`找到内置模型信息:`, modelInfo)
                // 重新加载内置模型
                await loadBuiltinModel(modelInfo)
                // 查找刚加载的模型
                obj = scene.value.children.find(child =>
                    child.userData &&
                    child.userData.builtinModel &&
                    child.userData.modelId === objData.modelId
                )
                if (obj) {
                  console.log(`成功重新加载内置模型: ${objData.name}`)
                } else {
                  console.warn(`重新加载内置模型失败: ${objData.name}`)
                }
              } else {
                console.warn(`未找到内置模型信息: ${objData.modelId}`)
              }
            } catch (error) {
              console.error(`重新加载内置模型时发生错误: ${objData.name}`, error)
            }
          } else {
            console.log(`不是内置模型或缺少必要信息:`, {
              isBuiltinModel: objData.isBuiltinModel,
              modelId: objData.modelId,
              originalPath: objData.originalPath
            })
          }

          // 如果仍然没有找到，尝试从几何体数据重新创建
          if (!obj && objData.geometry && objData.material) {
            console.log(`从数据重新创建对象: ${objData.name || objData.id}`)
            obj = createObjectFromData(objData)
            if (obj) {
              scene.value.add(obj)
              if (sceneManager) {
                sceneManager.addObject(obj, 'mesh')
              }
              console.log(`成功重新创建对象: ${objData.name || objData.id}`)
            } else {
              console.warn(`重新创建对象失败: ${objData.name || objData.id}`)
            }
          }

          // 如果仍然没有找到，创建占位符对象
          if (!obj) {
            console.warn(`无法重新创建对象 ${objData.name || objData.id}，缺少几何体或材质数据`)
            if (objData.name) {
              console.log(`创建占位符对象: ${objData.name}`)
              const placeholderGeometry = new THREE.BoxGeometry(1, 1, 1)
              const placeholderMaterial = new THREE.MeshBasicMaterial({
                color: 0xff0000,
                wireframe: true,
                transparent: true,
                opacity: 0.5
              })
              obj = new THREE.Mesh(placeholderGeometry, placeholderMaterial)
              obj.name = objData.name + ' (占位符)'
              obj.uuid = objData.id

              // 保存原始对象信息到userData
              obj.userData = {
                ...objData.userData,
                isPlaceholder: true,
                originalName: objData.name,
                originalId: objData.id,
                // 如果是内置模型，保存重建信息
                ...(objData.isBuiltinModel && {
                  builtinModel: true,
                  modelId: objData.modelId,
                  category: objData.category,
                  originalPath: objData.originalPath
                })
              }

              scene.value.add(obj)
              if (sceneManager) {
                sceneManager.addObject(obj, 'mesh')
              }
              console.log(`创建占位符对象成功: ${objData.name}`, obj.userData)
            }
          }
        } else {
          console.log(`找到现有对象，恢复属性: ${objData.name || objData.id}`)
        }

        // 无论对象是新创建的还是现有的，都要恢复属性
        if (obj) {
          console.log(`恢复对象属性:`, {
            name: objData.name,
            position: objData.position,
            rotation: objData.rotation,
            scale: objData.scale,
            visible: objData.visible
          })

          // 保存原始属性用于对比
          const originalPosition = { ...obj.position }
          const originalRotation = { ...obj.rotation }
          const originalScale = { ...obj.scale }

          obj.position.set(objData.position.x, objData.position.y, objData.position.z)
          obj.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z)
          obj.scale.set(objData.scale.x, objData.scale.y, objData.scale.z)
          obj.visible = objData.visible

          if (objData.userData) {
            // 合并 userData 时保护已存在的 originalFile（来自 ZIP 的真实 File 对象）
            if (!obj.userData) obj.userData = {}
            const incomingUserData = { ...objData.userData }

            if (incomingUserData.originalFile) {
              const currentOriginalFile = obj.userData.originalFile
              const incomingOriginalFile = incomingUserData.originalFile

              const currentIsValidFile = currentOriginalFile && typeof currentOriginalFile.name === 'string' && typeof currentOriginalFile.size === 'number'
              const incomingLooksLikePlainObject = incomingOriginalFile && typeof incomingOriginalFile.slice !== 'function'
              const incomingNameMissing = !incomingOriginalFile.name

              // 如果当前已有有效的 File，而传入的是反序列化的普通对象或没有 name，则不覆盖
              if (currentIsValidFile && (incomingLooksLikePlainObject || incomingNameMissing)) {
                delete incomingUserData.originalFile
              }
            }

            Object.assign(obj.userData, incomingUserData)
          }

          // 强制更新矩阵
          obj.updateMatrix()
          obj.updateMatrixWorld(true)

          console.log(`属性恢复完成: ${obj.name}`, {
            原始位置: originalPosition,
            恢复位置: obj.position,
            目标位置: objData.position,
            位置匹配: Math.abs(obj.position.x - objData.position.x) < 0.001 &&
                Math.abs(obj.position.y - objData.position.y) < 0.001 &&
                Math.abs(obj.position.z - objData.position.z) < 0.001,
            原始旋转: originalRotation,
            恢复旋转: obj.rotation,
            原始缩放: originalScale,
            恢复缩放: obj.scale,
            visible: obj.visible
          })

          processedObjects.add(obj.uuid)
          processedCount++
        } else {
          console.warn(`无法找到或创建对象: ${objData.name || objData.id}`)
        }
      }

      console.log(`属性恢复完成，处理了 ${processedCount} 个对象`)
    }

    // 更新场景对象列表
    if (sceneManager) {
      sceneObjects.value = sceneManager.getAllObjects()
    }

    // 恢复动画状态
    if (modelAnimationStates.value.size > 0) {
      console.log('开始恢复动画状态...')
      for (const [modelId, state] of modelAnimationStates.value) {
        const model = scene.value.children.find(child => child.uuid === modelId)
        if (model && state.isPlaying && state.currentAnimation >= 0) {
          console.log(`恢复模型 ${model.name || modelId} 的动画状态:`, {
            hasAnimations: state.hasAnimations,
            currentAnimation: state.currentAnimation,
            isPlaying: state.isPlaying,
            animationSpeed: state.animationSpeed,
            loopAnimation: state.loopAnimation,
            animationCount: state.modelAnimations?.length || 0
          })

          // 重新创建动画混合器
          const mixer = new THREE.AnimationMixer(model)
          modelAnimationMixers.value.set(modelId, mixer)

          // 播放动画
          if (state.modelAnimations && state.modelAnimations[state.currentAnimation]) {
            try {
              const animation = state.modelAnimations[state.currentAnimation]

              // 检查动画对象是否有效
              if (!animation || typeof animation !== 'object') {
                console.warn(`动画对象无效:`, animation)
                return
              }

              // 检查动画是否有必要的属性
              if (!animation.tracks || !Array.isArray(animation.tracks)) {
                console.warn(`动画缺少tracks属性:`, animation)
                return
              }

              // 检查tracks是否有效
              const hasValidTracks = animation.tracks.every(track =>
                  track &&
                  typeof track === 'object' &&
                  typeof track.createInterpolant === 'function'
              )

              if (!hasValidTracks) {
                console.warn(`动画tracks无效，跳过恢复:`, animation.name || 'unnamed')
                return
              }

              const action = mixer.clipAction(animation)

              // 设置动画参数
              action.timeScale = state.animationSpeed || 1.0
              if (state.loopAnimation) {
                action.setLoop(THREE.LoopRepeat, Infinity)
              } else {
                action.setLoop(THREE.LoopOnce, 1)
              }

              action.play()
              console.log(`恢复播放动画: ${animation.name || 'unnamed'}, 速度: ${state.animationSpeed || 1.0}x`)
            } catch (error) {
              console.error(`恢复动画时发生错误:`, error)
              console.warn(`跳过动画恢复: ${model.name || modelId}`)
            }
          }
        }
      }
      console.log('动画状态恢复完成')
    }

    console.log('场景已从ZIP包导入，包含', sceneData.objects?.length || 0, '个对象')
    ElMessage.success(`场景导入成功！包含 ${sceneData.objects?.length || 0} 个对象，导入了 ${modelFiles.length} 个原始模型文件`)
  } catch (error) {
    console.error('导入ZIP包失败:', error)
    ElMessage.error('导入失败: ' + error.message)
  }
}

// 从数据创建对象
const createObjectFromData = (objData: any): THREE.Object3D | null => {
  try {
    if (objData.geometry && objData.material) {
      // 重新创建几何体
      let geometry: THREE.BufferGeometry | null = null

      if (objData.geometry.type === 'BoxGeometry') {
        const params = objData.geometry.parameters
        geometry = new THREE.BoxGeometry(params.width, params.height, params.depth)
      } else if (objData.geometry.type === 'SphereGeometry') {
        const params = objData.geometry.parameters
        geometry = new THREE.SphereGeometry(params.radius, params.widthSegments, params.heightSegments)
      } else if (objData.geometry.type === 'CylinderGeometry') {
        const params = objData.geometry.parameters
        geometry = new THREE.CylinderGeometry(params.radiusTop, params.radiusBottom, params.height, params.radialSegments)
      } else if (objData.geometry.type === 'ConeGeometry') {
        const params = objData.geometry.parameters
        geometry = new THREE.ConeGeometry(params.radius, params.height, params.radialSegments)
      } else if (objData.geometry.type === 'PlaneGeometry') {
        const params = objData.geometry.parameters
        geometry = new THREE.PlaneGeometry(params.width, params.height)
      } else if (objData.geometry.attributes) {
        // 从属性数据重建几何体
        geometry = new THREE.BufferGeometry()

        // 重建所有属性
        for (const attrName in objData.geometry.attributes) {
          const attrData = objData.geometry.attributes[attrName]
          let TypedArray
          switch (attrData.type) {
            case 'Float32Array':
              TypedArray = Float32Array
              break
            case 'Uint32Array':
              TypedArray = Uint32Array
              break
            case 'Uint16Array':
              TypedArray = Uint16Array
              break
            case 'Uint8Array':
              TypedArray = Uint8Array
              break
            case 'Int32Array':
              TypedArray = Int32Array
              break
            case 'Int16Array':
              TypedArray = Int16Array
              break
            case 'Int8Array':
              TypedArray = Int8Array
              break
            default:
              TypedArray = Float32Array
          }

          const bufferAttribute = new THREE.BufferAttribute(
              new TypedArray(attrData.array),
              attrData.itemSize,
              attrData.normalized
          )
          geometry.setAttribute(attrName, bufferAttribute)
        }

        // 重建索引
        if (objData.geometry.index) {
          const indexData = objData.geometry.index
          let TypedArray
          switch (indexData.type || 'Uint16Array') {
            case 'Uint32Array':
              TypedArray = Uint32Array
              break
            case 'Uint16Array':
              TypedArray = Uint16Array
              break
            case 'Uint8Array':
              TypedArray = Uint8Array
              break
            default:
              TypedArray = Uint16Array
          }
          geometry.setIndex(new THREE.BufferAttribute(
              new TypedArray(indexData.array),
              1
          ))
        }

        // 重建组
        if (objData.geometry.groups && objData.geometry.groups.length > 0) {
          geometry.groups = objData.geometry.groups
        }

        // 重建边界框
        if (objData.geometry.boundingBox) {
          geometry.boundingBox = new THREE.Box3(
              new THREE.Vector3(
                  objData.geometry.boundingBox.min.x,
                  objData.geometry.boundingBox.min.y,
                  objData.geometry.boundingBox.min.z
              ),
              new THREE.Vector3(
                  objData.geometry.boundingBox.max.x,
                  objData.geometry.boundingBox.max.y,
                  objData.geometry.boundingBox.max.z
              )
          )
        }

        // 重建边界球
        if (objData.geometry.boundingSphere) {
          geometry.boundingSphere = new THREE.Sphere(
              new THREE.Vector3(
                  objData.geometry.boundingSphere.center.x,
                  objData.geometry.boundingSphere.center.y,
                  objData.geometry.boundingSphere.center.z
              ),
              objData.geometry.boundingSphere.radius
          )
        }
      }

      if (!geometry) return null

      // 重新创建材质
      let material: THREE.Material
      const materialData = objData.material

      // 基础材质属性
      const baseMaterialProps: any = {
        color: materialData.color ? new THREE.Color(materialData.color.r, materialData.color.g, materialData.color.b) : 0xffffff,
        transparent: materialData.transparent,
        opacity: materialData.opacity,
        wireframe: materialData.wireframe,
        side: materialData.side,
        alphaTest: materialData.alphaTest,
        alphaToCoverage: materialData.alphaToCoverage,
        blendDst: materialData.blendDst,
        blendDstAlpha: materialData.blendDstAlpha,
        blendEquation: materialData.blendEquation,
        blendEquationAlpha: materialData.blendEquationAlpha,
        blendSrc: materialData.blendSrc,
        blendSrcAlpha: materialData.blendSrcAlpha,
        blending: materialData.blending,
        clipIntersection: materialData.clipIntersection,
        clipShadows: materialData.clipShadows,
        colorWrite: materialData.colorWrite,
        defines: materialData.defines,
        depthFunc: materialData.depthFunc,
        depthTest: materialData.depthTest,
        depthWrite: materialData.depthWrite,
        fog: materialData.fog,
        stencilWrite: materialData.stencilWrite,
        stencilFunc: materialData.stencilFunc,
        stencilRef: materialData.stencilRef,
        stencilMask: materialData.stencilMask,
        stencilFail: materialData.stencilFail,
        stencilZFail: materialData.stencilZFail,
        stencilZPass: materialData.stencilZPass,
        stencilWriteMask: materialData.stencilWriteMask,
        toneMapped: materialData.toneMapped,
        vertexColors: materialData.vertexColors,
        visible: materialData.visible
      }

      if (materialData.type === 'MeshBasicMaterial') {
        material = new THREE.MeshBasicMaterial(baseMaterialProps)
      } else if (materialData.type === 'MeshStandardMaterial') {
        material = new THREE.MeshStandardMaterial({
          ...baseMaterialProps,
          metalness: materialData.metalness,
          roughness: materialData.roughness,
          emissive: materialData.emissive ? new THREE.Color(materialData.emissive.r, materialData.emissive.g, materialData.emissive.b) : undefined,
          emissiveIntensity: materialData.emissiveIntensity,
          envMapIntensity: materialData.envMapIntensity
        })
      } else if (materialData.type === 'MeshPhongMaterial') {
        material = new THREE.MeshPhongMaterial({
          ...baseMaterialProps,
          shininess: materialData.shininess,
          emissive: materialData.emissive ? new THREE.Color(materialData.emissive.r, materialData.emissive.g, materialData.emissive.b) : undefined,
          emissiveIntensity: materialData.emissiveIntensity,
          specular: materialData.specular ? new THREE.Color(materialData.specular.r, materialData.specular.g, materialData.specular.b) : undefined
        })
      } else if (materialData.type === 'MeshLambertMaterial') {
        material = new THREE.MeshLambertMaterial({
          ...baseMaterialProps,
          emissive: materialData.emissive ? new THREE.Color(materialData.emissive.r, materialData.emissive.g, materialData.emissive.b) : undefined,
          emissiveIntensity: materialData.emissiveIntensity
        })
      } else {
        // 默认材质
        material = new THREE.MeshBasicMaterial(baseMaterialProps)
      }

      // 设置材质UUID和名称
      if (materialData.uuid) {
        material.uuid = materialData.uuid
      }
      if (materialData.name) {
        material.name = materialData.name
      }

      // 创建网格对象
      const mesh = new THREE.Mesh(geometry, material)
      mesh.name = objData.name || 'Imported Object'
      mesh.uuid = objData.id

      // 设置变换
      mesh.position.set(objData.position.x, objData.position.y, objData.position.z)
      mesh.rotation.set(objData.rotation.x, objData.rotation.y, objData.rotation.z)
      mesh.scale.set(objData.scale.x, objData.scale.y, objData.scale.z)
      mesh.visible = objData.visible

      // 恢复用户数据
      if (objData.userData) {
        Object.assign(mesh.userData, objData.userData)
      }

      // 强制更新矩阵
      mesh.updateMatrix()
      mesh.updateMatrixWorld(true)

      console.log(`创建对象完成: ${mesh.name}`, {
        position: mesh.position,
        rotation: mesh.rotation,
        scale: mesh.scale,
        visible: mesh.visible
      })

      return mesh
    }
  } catch (error) {
    console.error('从数据创建对象失败:', error)
  }

  return null
}


// 动画控制函数
const checkModelAnimations = (object: THREE.Object3D) => {
  // 先尝试恢复之前保存的动画状态
  const restored = restoreModelAnimationState(object)

  // 如果已经恢复了动画状态，直接返回
  if (restored && hasAnimations.value && modelAnimations.value.length > 0) {
    console.log('使用已保存的动画状态，跳过重新检查')
    return
  }

  // 检查模型是否包含动画
  const animations: any[] = []
  const animationMap = new Map() // 用于去重

  console.log('开始检查动画，对象:', {
    name: object.name,
    type: object.type,
    hasAnimations: object.animations ? object.animations.length : 0,
    childrenCount: object.children.length
  })

  // 递归检查对象及其所有子对象的动画
  const collectAnimations = (obj: THREE.Object3D, depth: number = 0) => {
    if (depth > 20) return // 防止无限递归

    // 检查当前对象的动画
    if (obj.animations && obj.animations.length > 0) {
      console.log(`深度 ${depth} - 对象 ${obj.name} 有 ${obj.animations.length} 个动画`)
      obj.animations.forEach(anim => {
        // 使用动画名称作为key去重
        const key = anim.name || `animation_${animations.length}`
        if (!animationMap.has(key)) {
          animationMap.set(key, anim)
          animations.push(anim)
          console.log(`添加动画: ${anim.name || '未命名'} (${anim.duration}s, ${anim.tracks.length} 轨道)`)
        }
      })
    }

    // 递归检查子对象
    obj.children.forEach(child => {
      collectAnimations(child, depth + 1)
    })
  }

  collectAnimations(object)

  console.log('检查动画结果:', {
    object: object,
    animations: animations,
    objectAnimations: object.animations,
    childrenCount: object.children.length,
    totalAnimationsFound: animations.length
  })

  if (animations.length > 0) {
    // 为当前模型创建新的动画混合器
    animationMixer = new THREE.AnimationMixer(object)
    console.log(`为模型 ${object.name || object.uuid} 创建新的动画混合器`)

    modelAnimations.value = animations
    hasAnimations.value = true
    currentAnimation.value = -1
    isPlaying.value = false

    console.log(`发现 ${animations.length} 个动画:`, animations.map(anim => ({
      name: anim.name || '未命名',
      duration: anim.duration,
      tracks: anim.tracks.length
    })))

    // 自动播放第一个动画
    if (animations.length > 0) {
      playAnimation(0)
    }
  } else {
    hasAnimations.value = false
    modelAnimations.value = []
    animationMixer = null
    console.log('未发现动画，对象信息:', {
      name: object.name,
      type: object.type,
      animations: object.animations,
      children: object.children.length
    })
  }
}

const playAnimation = (index: number) => {
  if (!animationMixer || index < 0 || index >= modelAnimations.value.length) return

  // 不再停止其他模型的动画，允许多模型同时播放
  if (selectedObject.value) {
    stopOtherModelAnimations(selectedObject.value.uuid)
  }

  // 停止当前模型的动画
  if (currentAnimation.value >= 0) {
    animationMixer.stopAllAction()
  }

  // 确保动画混合器的时间缩放不为0
  if (animationMixer.timeScale === 0) {
    animationMixer.timeScale = animationSpeed.value
    console.log('重置动画混合器时间缩放:', animationSpeed.value)
  }

  // 播放新动画
  const animation = modelAnimations.value[index]
  const action = animationMixer.clipAction(animation)

  // 设置循环模式 - 修复循环播放问题
  if (loopAnimation.value) {
    action.setLoop(THREE.LoopRepeat, Infinity) // 无限循环
  } else {
    action.setLoop(THREE.LoopOnce, 1) // 只播放一次
  }

  action.timeScale = animationSpeed.value
  action.reset() // 重置动画到开始状态
  action.play()

  // 注意：Three.js的AnimationAction没有addEventListener方法
  // 动画循环通过setLoop方法自动处理

  currentAnimation.value = index
  isPlaying.value = true

  console.log(`播放动画: ${animation.name || `动画 ${index + 1}`} (循环: ${loopAnimation.value})`)
  console.log('动画混合器状态:', {
    timeScale: animationMixer.timeScale,
    isPlaying: action.isRunning(),
    weight: action.weight,
    enabled: action.enabled
  })

  // 保存当前模型的动画状态
  if (selectedObject.value) {
    saveModelAnimationState(selectedObject.value)
  }

  // 显示所有正在播放的动画信息
  const playingInfo = getPlayingAnimationsInfo()
  console.log('当前正在播放的动画:', playingInfo)
}

const stopAnimation = (index: number) => {
  if (!animationMixer || index < 0 || index >= modelAnimations.value.length) return

  const animation = modelAnimations.value[index]
  const action = animationMixer.clipAction(animation)
  action.stop()

  if (currentAnimation.value === index) {
    currentAnimation.value = -1
    isPlaying.value = false
  }

  console.log(`停止动画: ${animation.name || `动画 ${index + 1}`}`)
}

const updateAnimationSpeed = () => {
  if (!animationMixer || currentAnimation.value < 0) return

  const animation = modelAnimations.value[currentAnimation.value]
  const action = animationMixer.clipAction(animation)
  action.timeScale = animationSpeed.value

  console.log(`动画速度已更新: ${animationSpeed.value}x`)
}

// 停止所有动画
const stopAllAnimations = () => {
  if (!animationMixer) return

  animationMixer.stopAllAction()
  currentAnimation.value = -1
  isPlaying.value = false

  console.log('停止所有动画')
}

const toggleLoopAnimation = () => {
  if (!animationMixer || currentAnimation.value < 0) return

  const animation = modelAnimations.value[currentAnimation.value]
  const action = animationMixer.clipAction(animation)

  // 更新循环设置
  if (loopAnimation.value) {
    action.setLoop(THREE.LoopRepeat, Infinity) // 无限循环
  } else {
    action.setLoop(THREE.LoopOnce, 1) // 只播放一次
  }

  console.log(`动画循环设置已更新: ${loopAnimation.value ? '启用循环' : '禁用循环'}`)
}

const formatDuration = (duration: number) => {
  const seconds = Math.round(duration)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 更新属性编辑器显示
const updatePropertyEditor = () => {
  if (!selectedObject.value) return

  // 更新对象名称显示
  objectName.value = selectedObject.value.name || ''

  // 更新位置显示
  position.value = {
    x: Math.round(selectedObject.value.position.x * 100) / 100,
    y: Math.round(selectedObject.value.position.y * 100) / 100,
    z: Math.round(selectedObject.value.position.z * 100) / 100
  }

  // 更新旋转显示（转换为角度）
  rotation.value = {
    x: Math.round((selectedObject.value.rotation.x * 180) / Math.PI),
    y: Math.round((selectedObject.value.rotation.y * 180) / Math.PI),
    z: Math.round((selectedObject.value.rotation.z * 180) / Math.PI)
  }

  // 更新缩放显示
  scale.value = {
    x: Math.round(selectedObject.value.scale.x * 100) / 100,
    y: Math.round(selectedObject.value.scale.y * 100) / 100,
    z: Math.round(selectedObject.value.scale.z * 100) / 100
  }
}

// 模型导入方法
const triggerFileInput = () => {
  console.log('触发文件选择对话框')
  if (fileInput.value) {
    fileInput.value.click()
    console.log('文件选择对话框已触发')
  } else {
    console.error('文件输入元素未找到')
  }
}

// 显示/隐藏导入面板
const toggleImportPanel = () => {
  showImportPanel.value = !showImportPanel.value
  // 如果打开导入面板，关闭内置模型面板
  if (showImportPanel.value) {
    showBuiltinModelsPanel.value = false
  }
}

const hideImportPanel = () => {
  showImportPanel.value = false
}

// 切换内置模型面板
const toggleBuiltinModelsPanel = () => {
  showBuiltinModelsPanel.value = !showBuiltinModelsPanel.value
  // 如果打开内置模型面板，关闭导入面板
  if (showBuiltinModelsPanel.value) {
    showImportPanel.value = false
  }
}

const hideBuiltinModelsPanel = () => {
  showBuiltinModelsPanel.value = false
}

// 显示对象列表面板
const showObjectList = () => {
  showObjectListPanel.value = true
  // 隐藏其他面板
  showImportPanel.value = false
  showBuiltinModelsPanel.value = false
}

// 隐藏对象列表面板
const hideObjectListPanel = () => {
  showObjectListPanel.value = false
}

// 从列表选择对象
const selectObjectFromList = (object: any) => {
  selectObject(object)
}

// 聚焦到对象（不改变相机视角，只选择）
const focusOnObject = (object: any) => {
  selectObject(object)
  // 这里可以添加其他聚焦效果，比如高亮闪烁等
  console.log('聚焦到对象:', object.name)
}

// ViewCube视角切换处理
const handleViewChange = (viewType: string, newCameraPosition: number[], newCameraTarget: number[]) => {
  console.log('=== SceneViewer收到视角切换 ===')
  console.log('视角类型:', viewType)
  console.log('相机位置:', newCameraPosition)
  console.log('相机目标:', newCameraTarget)
  console.log('当前相机:', !!camera.value)
  console.log('当前控制器:', !!controls.value)

  if (!camera.value || !controls.value) {
    console.log('❌ 相机或控制器未准备好')
    return
  }

  console.log('开始视角切换动画')

  // 创建动画
  const startPosition = camera.value.position.clone()
  const startTarget = controls.value.target.clone()

  const endPosition = new THREE.Vector3(newCameraPosition[0], newCameraPosition[1], newCameraPosition[2])
  const endTarget = new THREE.Vector3(newCameraTarget[0], newCameraTarget[1], newCameraTarget[2])

  console.log('起始位置:', startPosition, '目标位置:', endPosition)
  console.log('起始目标:', startTarget, '目标目标:', endTarget)

  // 使用Tween.js风格的动画
  const duration = 1000 // 1秒
  const startTime = Date.now()

  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)

    // 使用缓动函数
    const easeProgress = 1 - Math.pow(1 - progress, 3) // ease-out cubic

    // 插值位置
    camera.value.position.lerpVectors(startPosition, endPosition, easeProgress)
    controls.value.target.lerpVectors(startTarget, endTarget, easeProgress)

    // 更新控制器
    controls.value.update()

    // 更新相机目标引用
    if (cameraTarget.value) {
      cameraTarget.value.x = controls.value.target.x
      cameraTarget.value.y = controls.value.target.y
      cameraTarget.value.z = controls.value.target.z
    }

    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      console.log('视角切换完成:', viewType)
      console.log('最终相机位置:', camera.value.position)
      console.log('最终相机目标:', controls.value.target)
    }
  }

  animate()
}

// 删除对象
const deleteObject = (object: any) => {
  if (confirm(`确定要删除对象 "${object.name || '未命名对象'}" 吗？`)) {
    console.log('删除对象前 - 场景对象数量:', sceneObjects.value.length)
    console.log('删除对象前 - 对象信息:', {
      name: object.name,
      uuid: object.uuid,
      userDataId: object.userData?.id
    })

    // 从场景中移除对象
    scene.value.remove(object)

    // 从场景管理器中移除（通过对象的userData.id）
    if (sceneManager && object.userData && object.userData.id) {
      console.log('通过场景管理器删除对象:', object.userData.id)
      sceneManager.removeObject(object.userData.id)
      sceneObjects.value = sceneManager.getAllObjects()
    } else {
      // 如果场景管理器中没有该对象，直接更新sceneObjects
      console.log('直接过滤sceneObjects数组')
      sceneObjects.value = sceneObjects.value.filter(obj => obj.uuid !== object.uuid)
    }

    // 如果删除的是当前选中的对象，清除选择
    if (selectedObject.value === object) {
      clearSelection()
    }

    console.log('删除对象后 - 场景对象数量:', sceneObjects.value.length)
    console.log('已删除对象:', object.name)
  }
}


const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false
}

const onFileDrop = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer?.files
  if (files) {
    handleFiles(Array.from(files))
  }
}

const onFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    console.log(`文件选择事件触发，选择了 ${target.files.length} 个文件`)
    handleFiles(Array.from(target.files))
    // 清空input值，允许重复选择同一文件
    target.value = ''
  } else {
    console.log('文件选择事件触发，但没有选择文件')
  }
}

const handleFiles = async (files: File[]) => {
  console.log(`开始处理 ${files.length} 个文件`)

  for (const file of files) {
    try {
      console.log(`正在导入文件: ${file.name} (${formatFileSize(file.size)})`)

      // 检查是否为ZIP文件
      if (file.name.toLowerCase().endsWith('.zip')) {
        await importSceneFromZip(file)
        console.log(`ZIP文件导入成功: ${file.name}`)
      } else {
        await importModel(file)
        console.log(`文件导入成功: ${file.name}`)
      }
    } catch (error) {
      console.error(`导入文件失败: ${file.name}`, error)
      // 显示用户友好的错误提示
      ElMessage.error(`导入文件失败: ${file.name}\n错误: ${error.message || '未知错误'}\n请检查文件格式和内容`)
    }
  }

  console.log('所有文件处理完成')
}

const importModel = async (file: File) => {
  // 检查文件类型
  if (!isSupportedFormat(file.name)) {
    console.warn(`不支持的文件格式: ${file.name}`)
    ElMessage.warning(`不支持的文件格式: ${file.name}\n支持格式: GLTF, GLB, OBJ, FBX, STL, DAE, 3DS, PLY`)
    return
  }

  try {
    console.log(`开始导入模型: ${file.name} (${formatFileSize(file.size)})`)

    // 使用模型加载器管理器加载模型
    const model = await modelLoaderManager.loadModel(file)

    if (model) {
      console.log(`模型加载完成: ${file.name}`, model)

      // 使用模型加载器管理器设置模型（导入ZIP时禁用自动缩放和居中）
      modelLoaderManager.setupImportedModel(model, {
        autoScale: false, // 禁用自动缩放，保持原始大小
        autoCenter: false, // 禁用自动居中，保持原始位置
        generateShadows: importOptions.value.generateShadows
      })

      // 统一模型命名：去掉导出前缀 model_#_ 并去除扩展名，便于名称匹配
      try {
        const baseName = file.name.replace(/^model_\d+_/i, '').replace(/\.[^.]+$/, '')
        if (baseName && typeof baseName === 'string') {
          model.name = baseName
        }
      } catch {}

      // 确保模型可见
      model.visible = true

      // 将原始文件信息存储到userData中
      if (!model.userData) {
        model.userData = {}
      }
      model.userData.originalFile = file
      model.userData.originalFileName = file.name
      model.userData.importTime = new Date().toISOString()

      console.log(`设置模型 ${model.name} 的userData.originalFile:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        hasOriginalFile: !!(model.userData && model.userData.originalFile),
        originalFileName: model.userData?.originalFile?.name
      })

      // 添加到场景
      scene.value.add(model)
      console.log('模型已添加到场景:', model)

      if (sceneManager) {
        sceneManager.addObject(model, 'imported')
        sceneObjects.value = sceneManager.getAllObjects()
        console.log('场景对象列表已更新:', sceneObjects.value)
      }

      // 添加到导入历史（在成功加载后）
      const historyItem = {
        name: file.name,
        size: file.size,
        type: getFileExtension(file.name),
        modelName: model.name, // 存储模型的Three.js名称
        model: model // 直接存储模型引用
      }
      importHistory.value.push(historyItem)

      // 自动选择导入的模型
      selectObject(model)

      // 显示详细的模型信息
      const modelInfo = modelLoaderManager.getModelInfo(model)
      console.log(`模型导入成功: ${file.name}`, {
        model: model,
        info: modelInfo,
        position: model.position,
        scale: model.scale,
        rotation: model.rotation
      })

      // 在控制台显示模型结构
      console.log('模型结构:', model)
      let meshCount = 0
      model.traverse((child, index) => {
        if (child instanceof THREE.Mesh) {
          meshCount++
          console.log(`子网格 ${meshCount}:`, {
            name: child.name,
            geometry: child.geometry,
            material: child.material,
            position: child.position,
            visible: child.visible
          })
        }
      })

      console.log(`模型包含 ${meshCount} 个网格`)

      // 显示成功消息
      ElMessage.success(`模型导入成功!\n文件名: ${file.name}\n网格数量: ${meshCount}\n模型已添加到场景中`)

      // 强制重新渲染场景
      renderer.value.render(scene.value, camera.value)

      return model // 返回导入的模型
    } else {
      throw new Error('模型加载器返回了空对象')
    }
  } catch (error) {
    console.error(`导入模型失败: ${file.name}`, error)
    ElMessage.error(`导入模型失败: ${file.name}\n错误: ${error.message}\n请检查文件格式和内容`)
    return null
  }
}

// 模型处理函数现在由modelLoaderManager提供

const removeImportedModel = (historyItem: any) => {
  // 直接使用存储的模型引用
  const model = historyItem.model
  if (model) {
    // 从场景中移除模型
    scene.value.remove(model)
    if (sceneManager) {
      // 通过userData.id移除对象
      if (model.userData && model.userData.id) {
        sceneManager.removeObject(model.userData.id)
      }
      sceneObjects.value = sceneManager.getAllObjects()
    }

    // 如果移除的是当前选中的对象，清除选择
    if (selectedObject.value === model) {
      clearSelection()
    }

    // 清理模型资源
    if (model.geometry) {
      model.geometry.dispose()
    }
    if (model.material) {
      if (Array.isArray(model.material)) {
        model.material.forEach(mat => mat.dispose())
      } else {
        model.material.dispose()
      }
    }
  }

  // 从历史记录中移除
  const index = importHistory.value.findIndex(item => item.name === historyItem.name)
  if (index > -1) {
    importHistory.value.splice(index, 1)
  }
}

// 使用导入的formatFileSize函数

// 灯光控制函数
const updateLights = () => {
  if (ambientLight.value) {
    ambientLight.value.intensity = lightIntensities.value.ambient
  }
  if (directionalLight.value) {
    directionalLight.value.intensity = lightIntensities.value.directional
  }
  if (pointLight.value) {
    pointLight.value.intensity = lightIntensities.value.point
  }
}

// 更新radio组选择
const updateRadioGroup = (value: string) => {
  radioGroup.value = value
}

// 更新各种光源强度
const updateAmbientLight = (value: number) => {
  lightIntensities.value.ambient = value
  if (ambientLight.value) {
    ambientLight.value.intensity = value
  }
}

const updateDirectionalLight = (value: number) => {
  lightIntensities.value.directional = value
  if (directionalLight.value) {
    directionalLight.value.intensity = value
  }
}

const updatePointLight = (value: number) => {
  lightIntensities.value.point = value
  if (pointLight.value) {
    pointLight.value.intensity = value
  }
}


/**
 * 加载内置模型
 * 从预定义的模型库中加载3D模型到场景中
 * @param model - 模型配置对象，包含名称、路径等信息
 */
const loadBuiltinModel = async (model: any) => {
  try {
    console.log('开始加载内置模型:', model)

    // 显示加载状态
    const loadingMessage = document.createElement('div')
    loadingMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
    `
    loadingMessage.textContent = `正在加载 ${model.name}...`
    document.body.appendChild(loadingMessage)

    // 从服务器获取模型文件
    const response = await fetch(model.path)
    if (!response.ok) {
      throw new Error(`无法加载模型文件: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // 创建 File 对象，使用正确的文件名和扩展名
    const fileName = `${model.name}.${model.format}`
    const file = new File([arrayBuffer], fileName, {
      type: `model/${model.format}`
    })

    // 使用模型加载器加载模型
    const loadedModel = await modelLoaderManager.loadModel(file)

    // 设置模型
    const processedModel = modelLoaderManager.setupImportedModel(loadedModel, {
      autoScale: true,
      autoCenter: true,
      generateShadows: true
    })

    // 设置模型名称和用户数据
    processedModel.name = model.name
    processedModel.userData = {
      ...processedModel.userData,
      builtinModel: true,
      modelId: model.id,
      category: model.category,
      originalFile: file  // 保存原始文件信息，用于导出
    }

    // 添加到场景
    scene.value.add(processedModel)

    if (sceneManager) {
      sceneManager.addObject(processedModel, 'imported')
      sceneObjects.value = sceneManager.getAllObjects()
    }

    // 选择新加载的模型
    selectObject(processedModel)

    console.log('内置模型加载成功:', processedModel)

    // 移除加载提示
    document.body.removeChild(loadingMessage)

  } catch (error) {
    console.error('加载内置模型失败:', error)

    // 移除加载提示
    const loadingMessage = document.querySelector('div[style*="position: fixed"]')
    if (loadingMessage) {
      document.body.removeChild(loadingMessage)
    }

    // 显示错误提示
    alert(`加载模型失败: ${model.name}\n错误: ${error.message}`)
  }
}

/**
 * 加载法拉利模型并启动组装动画
 * 模型默认显示为拆解状态，然后通过20秒动画组装完成
 * @param model - 法拉利模型配置对象
 */
const loadFerrariWithAssemblyAnimation = async (model: any) => {
  try {
    console.log('开始加载法拉利模型并启动组装动画:', model)

    // 显示加载状态
    const loadingMessage = document.createElement('div')
    loadingMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 20px;
      border-radius: 8px;
      z-index: 10000;
      font-size: 14px;
    `
    loadingMessage.textContent = `正在加载 ${model.name}...`
    document.body.appendChild(loadingMessage)

    // 从服务器获取模型文件
    const response = await fetch(model.path)
    if (!response.ok) {
      throw new Error(`无法加载模型文件: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    // 创建 File 对象，使用正确的文件名和扩展名
    const fileName = `${model.name}.${model.format}`
    const file = new File([arrayBuffer], fileName, {
      type: `model/${model.format}`
    })

    // 使用模型加载器加载模型
    const loadedModel = await modelLoaderManager.loadModel(file)

    // 设置模型
    const processedModel = modelLoaderManager.setupImportedModel(loadedModel, {
      autoScale: true,
      autoCenter: true,
      generateShadows: true
    })

    // 设置法拉利模型的初始状态
    processedModel.position.set(0, 0, 0)  // XYZ轴都为0
    processedModel.scale.set(2, 2, 2)     // 缩放为2
    processedModel.updateMatrix()
    processedModel.updateMatrixWorld(true)

    // 设置模型名称和用户数据
    processedModel.name = model.name
    processedModel.userData = {
      ...processedModel.userData,
      builtinModel: true,
      modelId: model.id,
      category: model.category,
      originalFile: file,
      isFerrariAssembly: true  // 标记为法拉利组装模型
    }

    // 添加到场景
    scene.value.add(processedModel)

    if (sceneManager) {
      sceneManager.addObject(processedModel, 'imported')
      sceneObjects.value = sceneManager.getAllObjects()
    }

    // 选择新加载的模型
    selectObject(processedModel)

    console.log('法拉利模型加载成功，开始拆解和组装动画:', processedModel)

    // 移除加载提示
    document.body.removeChild(loadingMessage)

    // 启动拆解和组装动画
    await startFerrariAssemblyAnimation(processedModel)

  } catch (error) {
    console.error('加载法拉利模型失败:', error)

    // 移除加载提示
    const loadingMessage = document.querySelector('div[style*="position: fixed"]')
    if (loadingMessage) {
      document.body.removeChild(loadingMessage)
    }

    // 显示错误提示
    alert(`加载法拉利模型失败: ${model.name}\n错误: ${error.message}`)
  }
}

/**
 * 启动法拉利流水线组装动画
 * 模拟真实工厂流水线组装过程
 * @param model - 法拉利模型对象
 */
const startFerrariAssemblyAnimation = async (model: THREE.Object3D) => {
  try {
    console.log('开始法拉利流水线组装动画流程')

    // 定义零件信息接口
    interface PartInfo {
      object: THREE.Object3D
      originalPosition: THREE.Vector3
      originalRotation: THREE.Euler
      conveyorPosition: THREE.Vector3 // 流水线位置
      assemblyPosition: THREE.Vector3 // 组装位置
      assemblyOrder: number
      partName: string
      partType: 'chassis' | 'engine' | 'wheels' | 'body' | 'interior' | 'details'
      conveyorIndex: number // 流水线工位
    }

    const parts: PartInfo[] = []
    let partCounter = 0

    // 收集所有零件信息
    const collectParts = (obj: THREE.Object3D, depth: number = 0) => {
      // 跳过太深的层级，避免处理过多细节
      if (depth > 3) return

      // 只处理有几何体的对象（实际的零件）
      if (obj.type === 'Mesh' || obj.type === 'Group') {
        const box = new THREE.Box3().setFromObject(obj)
        const size = box.getSize(new THREE.Vector3())
        const volume = size.x * size.y * size.z

        // 只处理有实际体积的零件
        if (volume > 0.001) {
          // 根据位置和大小判断零件类型
          let partType: PartInfo['partType'] = 'details'
          let partName = obj.name || `零件${partCounter + 1}`

          // 根据位置判断零件类型
          if (obj.position.y < -0.5) {
            partType = 'chassis' // 底盘
            partName = '底盘'
          } else if (obj.position.y > 0.5 && volume > 0.1) {
            partType = 'body' // 车身
            partName = '车身'
          } else if (volume > 0.05) {
            partType = 'engine' // 发动机
            partName = '发动机'
          } else if (obj.name && (obj.name.includes('wheel') || obj.name.includes('轮'))) {
            partType = 'wheels' // 轮子
            partName = '轮子'
          } else if (obj.position.y > 0 && obj.position.y < 0.5) {
            partType = 'interior' // 内饰
            partName = '内饰'
          }

          // 计算组装顺序（流水线组装顺序）
          let assemblyOrder = 0
          let conveyorIndex = 0

          switch (partType) {
            case 'chassis':
              assemblyOrder = 1 // 底盘最先
              conveyorIndex = 0 // 流水线工位1
              break
            case 'engine':
              assemblyOrder = 2 // 发动机第二
              conveyorIndex = 1 // 流水线工位2
              break
            case 'wheels':
              assemblyOrder = 3 // 轮子第三
              conveyorIndex = 2 // 流水线工位3
              break
            case 'body':
              assemblyOrder = 4 // 车身第四
              conveyorIndex = 3 // 流水线工位4
              break
            case 'interior':
              assemblyOrder = 5 // 内饰第五
              conveyorIndex = 4 // 流水线工位5
              break
            case 'details':
              assemblyOrder = 6 // 细节最后
              conveyorIndex = 5 // 流水线工位6
              break
          }

          // 计算流水线位置（传送带上的位置）
          const conveyorPosition = new THREE.Vector3(
            -8 + conveyorIndex * 3, // X轴：流水线工位
            -1.5, // Y轴：传送带高度
            -2 + (Math.random() - 0.5) * 2 // Z轴：传送带上的随机位置
          )

          // 计算组装位置（流水线终点）
          const assemblyPosition = new THREE.Vector3(
            8, // X轴：组装台位置
            -1.5, // Y轴：组装台高度
            0 // Z轴：组装台中心
          )

          const partInfo: PartInfo = {
            object: obj,
            originalPosition: obj.position.clone(),
            originalRotation: obj.rotation.clone(),
            conveyorPosition: conveyorPosition.clone(),
            assemblyPosition: assemblyPosition.clone(),
            assemblyOrder: assemblyOrder,
            partName: partName,
            partType: partType,
            conveyorIndex: conveyorIndex
          }

          parts.push(partInfo)
          partCounter++
        }
      }

      // 递归处理子对象
      obj.children.forEach(child => collectParts(child, depth + 1))
    }

    // 收集所有零件
    collectParts(model)

    // 按组装顺序排序
    parts.sort((a, b) => a.assemblyOrder - b.assemblyOrder)

    console.log(`收集了 ${parts.length} 个零件，流水线顺序:`, parts.map(p => `${p.partName}(${p.partType})`))

    // 第一步：拆解到流水线
    const explodeToConveyor = () => {
      console.log('开始拆解到流水线...')

      const explodeDuration = 2000 // 2秒拆解动画
      const startTime = Date.now()

      const animateExplode = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / explodeDuration, 1)

        // 使用缓动函数（easeInQuart）
        const easeProgress = Math.pow(progress, 4)

        parts.forEach(part => {
          // 位置插值：从原始位置到流水线位置
          const currentPos = part.originalPosition.clone().lerp(
            part.conveyorPosition,
            easeProgress
          )
          part.object.position.copy(currentPos)

          // 旋转插值：保持原始旋转
          part.object.rotation.copy(part.originalRotation)
        })

        if (progress < 1) {
          requestAnimationFrame(animateExplode)
        } else {
          console.log('拆解到流水线完成')
        }
      }

      requestAnimationFrame(animateExplode)
    }

    // 第二步：流水线传送
    const conveyorTransport = () => {
      console.log('开始流水线传送...')

      const transportDuration = 3000 // 3秒传送时间
      const startTime = Date.now()

      const animateTransport = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / transportDuration, 1)

        // 使用缓动函数（easeInOutQuad）
        const easeProgress = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2

        parts.forEach(part => {
          // 位置插值：从流水线位置到组装位置
          const currentPos = part.conveyorPosition.clone().lerp(
            part.assemblyPosition,
            easeProgress
          )
          part.object.position.copy(currentPos)

          // 保持旋转不变
          part.object.rotation.copy(part.originalRotation)
        })

        if (progress < 1) {
          requestAnimationFrame(animateTransport)
        } else {
          console.log('流水线传送完成')
        }
      }

      requestAnimationFrame(animateTransport)
    }

    // 第三步：流水线组装
    const assemblyLineAssembly = () => {
      console.log('开始流水线组装...')

      const assemblyDuration = 1500 // 每个零件1.5秒组装时间

      let currentPartIndex = 0

      const assembleNextPart = () => {
        if (currentPartIndex >= parts.length) {
          // 所有零件组装完成
          console.log('🏎️ 法拉利流水线组装完成！')

          // 显示完成提示
          const completionMessage = document.createElement('div')
          completionMessage.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #000000, #000000);
            color: white;
            padding: 20px 30px;
            border-radius: 12px;
            z-index: 10000;
            font-size: 16px;
            box-shadow: 0 8px 24px rgba(0, 200, 81, 0.4);
            border: 2px solid #00e676;
            text-align: center;
            animation: scaleIn 0.5s ease-out;
          `
          completionMessage.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 5px;">法拉利流水线组装完成！</div>
            <div style="font-size: 12px; opacity: 0.9;">流水线组装流程执行完毕</div>
          `
          document.body.appendChild(completionMessage)

          // 5秒后移除提示
          setTimeout(() => {
            if (document.body.contains(completionMessage)) {
              document.body.removeChild(completionMessage)
            }
          }, 5000)
          return
        }

        const currentPart = parts[currentPartIndex]
        const partStartTime = Date.now()

        console.log(`开始组装: ${currentPart.partName} (工位${currentPart.conveyorIndex + 1})`)

        // 显示当前组装零件提示
        const assemblyMessage = document.createElement('div')
        assemblyMessage.style.cssText = `
          position: fixed;
          top: 0px;
          left: 322px;
          background: linear-gradient(135deg, #000, #000);
          color: white;
          padding: 12px 16px;
          border-radius: 8px;
          z-index: 10000;
          font-size: 13px;
          animation: slideInLeft 0.3s ease-out;
        `
        assemblyMessage.innerHTML = `
          <div style="font-size: 18px;font-weight: bold; margin-bottom: 3px;">流水线工位 ${currentPart.conveyorIndex + 1}</div>
          <div style="font-size: 16px; opacity: 0.9;">正在组装: ${currentPart.partName}</div>
          <div style="font-size: 14px; opacity: 0.7; margin-top: 2px;">进度: ${currentPartIndex + 1}/${parts.length}</div>
        `
        document.body.appendChild(assemblyMessage)

        // 组装当前零件
        const animatePart = () => {
          const elapsed = Date.now() - partStartTime
          const progress = Math.min(elapsed / assemblyDuration, 1)

          // 使用缓动函数（easeOutBack）
          const easeProgress = 1 - Math.pow(1 - progress, 3) * (1 - progress)

          // 位置插值：从组装位置到原始位置
          const currentPos = currentPart.assemblyPosition.clone().lerp(
            currentPart.originalPosition,
            easeProgress
          )
          currentPart.object.position.copy(currentPos)

          // 旋转插值：保持原始旋转
          currentPart.object.rotation.copy(currentPart.originalRotation)

          if (progress < 1) {
            requestAnimationFrame(animatePart)
          } else {
            // 当前零件组装完成
            console.log(`${currentPart.partName} 组装完成`)

            // 移除组装提示
            if (document.body.contains(assemblyMessage)) {
              document.body.removeChild(assemblyMessage)
            }

            // 组装下一个零件
            currentPartIndex++
            setTimeout(() => {
              assembleNextPart()
            }, 300) // 短暂延迟，让用户看到组装效果
          }
        }

        requestAnimationFrame(animatePart)
      }

      // 开始组装第一个零件
      assembleNextPart()
    }

    // 执行流水线组装流程
    explodeToConveyor()

    // 等待2.5秒后开始传送（2秒拆解 + 0.5秒观察）
    setTimeout(() => {
      conveyorTransport()
    }, 2500)

    // 等待6秒后开始组装（2秒拆解 + 3秒传送 + 1秒观察）
    setTimeout(() => {
      assemblyLineAssembly()
    }, 6000)

  } catch (error) {
    console.error('法拉利流水线组装动画失败:', error)
  }
}

// 调试动画状态
const debugAnimations = () => {
  console.log('=== 调试动画状态 ===')
  console.log('动画混合器:', animationMixer)
  console.log('动画列表:', modelAnimations.value)
  console.log('当前动画:', currentAnimation.value)
  console.log('播放状态:', isPlaying.value)
  console.log('动画速度:', animationSpeed.value)
  console.log('循环设置:', loopAnimation.value)

  if (selectedObject.value) {
    console.log('选中对象动画:', selectedObject.value.animations)
    console.log('选中对象类型:', selectedObject.value.type)
  }

  console.log('================')
}

// 调试高亮状态
const debugHighlight = () => {
  console.log('=== 调试高亮状态 ===')

  // 显示高亮设置
  console.log('高亮设置:', {
    useSimpleHighlight: highlightSettings.value.useSimpleHighlight,
    highlightColor: `#${highlightSettings.value.highlightColor.toString(16).padStart(6, '0')}`,
    highlightOpacity: highlightSettings.value.highlightOpacity
  })

  if (selectedObject.value) {
    console.log('选中对象:', selectedObject.value)
    console.log('对象类型:', selectedObject.value.type)
    console.log('对象名称:', selectedObject.value.name)
    console.log('子对象数量:', selectedObject.value.children.length)
    console.log('用户数据:', selectedObject.value.userData)

    // 检查高亮状态
    if (selectedObject.value.userData.originalColor !== undefined) {
      console.log('根对象有颜色高亮，原始颜色:', selectedObject.value.userData.originalColor)
    }

    if (selectedObject.value.type === 'Group' || selectedObject.value.type === 'Object3D') {
      const firstMesh = findFirstMesh(selectedObject.value)
      if (firstMesh) {
        console.log('第一个网格子对象:', firstMesh.name)
        if (firstMesh.userData.originalColor !== undefined) {
          console.log('网格对象有颜色高亮，原始颜色:', firstMesh.userData.originalColor)
        }
      }
    }
  } else {
    console.log('没有选中的对象')
  }

  console.log('================')
}

// 调试GLTF动画状态
const debugGLTFAnimations = () => {
  console.log('=== 调试GLTF动画状态 ===')

  if (selectedObject.value) {
    console.log('选中对象:', selectedObject.value)
    console.log('对象类型:', selectedObject.value.type)
    console.log('对象名称:', selectedObject.value.name)

    // 检查根对象的动画
    if (selectedObject.value.animations) {
      console.log('根对象动画:', {
        count: selectedObject.value.animations.length,
        animations: selectedObject.value.animations.map(anim => ({
          name: anim.name || '未命名',
          duration: anim.duration,
          tracks: anim.tracks.length
        }))
      })
    } else {
      console.log('根对象没有动画属性')
    }

    // 递归检查所有子对象的动画
    const checkChildAnimations = (obj: THREE.Object3D, depth: number = 0) => {
      if (depth > 10) return // 限制深度

      if (obj.animations && obj.animations.length > 0) {
        console.log(`深度 ${depth} - 对象 ${obj.name} 有动画:`, {
          count: obj.animations.length,
          animations: obj.animations.map(anim => ({
            name: anim.name || '未命名',
            duration: anim.duration,
            tracks: anim.tracks.length
          }))
        })
      }

      obj.children.forEach(child => {
        checkChildAnimations(child, depth + 1)
      })
    }

    checkChildAnimations(selectedObject.value)

  } else {
    console.log('没有选中的对象')
  }

  console.log('================')
}

// 键盘控制相关
const moveStep = 1.0 // 移动步长（米）
const isKeyboardEnabled = ref(true)

// 切换键盘控制
const toggleKeyboardControl = () => {
  isKeyboardEnabled.value = !isKeyboardEnabled.value
  console.log(`键盘控制${isKeyboardEnabled.value ? '启用' : '禁用'}`)
}

// 加载高斯泼溅模型
const loadGaussianSplatModel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.ply,.splat'
  
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return

    try {
      ElMessage.info('正在加载高斯泼溅模型...')
      const url = URL.createObjectURL(file)
      
      let points
      if (file.name.endsWith('.ply')) {
        points = await gaussianSplatLoader.load(url, (progress) => {
          console.log('加载进度:', progress)
        })
      } else if (file.name.endsWith('.splat')) {
        points = await gaussianSplatLoader.loadSplat(url)
      }

      if (points && scene.value) {
        // 修复上下颠倒问题：沿X轴旋转180度
        points.rotation.x = Math.PI
        
        // 计算模型包围盒并自动调整位置和缩放
        points.geometry.computeBoundingBox()
        const bbox = points.geometry.boundingBox
        
        if (bbox) {
          // 计算中心点
          const center = new THREE.Vector3()
          bbox.getCenter(center)
          
          // 将模型移动到原点
          points.position.set(-center.x, -center.y, -center.z)
          
          // 计算模型尺寸
          const size = new THREE.Vector3()
          bbox.getSize(size)
          const maxDim = Math.max(size.x, size.y, size.z)
          
          // 自动缩放到合适大小（场景单位约10）
          const targetSize = 10
          const scale = targetSize / maxDim
          points.scale.setScalar(scale)
          
          // 将模型放在地面上（因为旋转了180度，需要调整Y坐标）
          points.position.y = (-bbox.max.y) * scale
          
          console.log('模型信息:', {
            原始尺寸: size,
            最大维度: maxDim,
            缩放比例: scale,
            中心点: center,
            旋转: '沿X轴180度（修复上下颠倒）'
          })
        }
        
        scene.value.add(points)
        const controller = new GaussianSplattingController(points)
        gaussianSplatControllers.push(controller)
        
        // 相机聚焦到模型
        if (controls.value && camera.value) {
          const bbox = points.geometry.boundingBox
          if (bbox) {
            const center = new THREE.Vector3()
            bbox.getCenter(center)
            center.applyMatrix4(points.matrixWorld)
            
            const size = new THREE.Vector3()
            bbox.getSize(size)
            const maxDim = Math.max(size.x, size.y, size.z) * points.scale.x
            
            // 设置相机位置
            const distance = maxDim * 2.5
            camera.value.position.set(
              center.x + distance,
              center.y + distance * 0.5,
              center.z + distance
            )
            controls.value.target.copy(center)
            controls.value.update()
          }
        }
        
        ElMessage.success(`成功加载高斯泼溅模型: ${file.name}`)
        console.log('点云信息:', controller.getInfo())
      }
      
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('加载高斯泼溅模型失败:', error)
      ElMessage.error('加载失败: ' + error.message)
    }
  }

  input.click()
}

// 创建粒子泼溅效果
const createParticleSplashEffect = () => {
  if (!particleSplashSystem) {
    ElMessage.warning('粒子系统未初始化')
    return
  }

  const preset = SplashPresets[selectedSplashPreset.value] || SplashPresets.water
  
  // 在相机朝向的中心位置上方生成泼溅效果
  const targetPosition = new THREE.Vector3()
  if (controls.value) {
    targetPosition.copy(controls.value.target)
    targetPosition.y += 5 // 在目标点上方5个单位
  } else {
    targetPosition.set(0, 5, 0)
  }
  
  particleSplashSystem.createSplash({
    ...preset,
    position: targetPosition
  })

  ElMessage.success(`创建${selectedSplashPreset.value}泼溅效果`)
  console.log('活跃粒子系统:', particleSplashSystem.getActiveCount())
}

// 更改粒子泼溅预设
const changeSplashPreset = (preset: string) => {
  selectedSplashPreset.value = preset
}

// 更新高斯泼溅点大小
const updateGaussianPointSize = (size: number) => {
  gaussianPointSize.value = size
  gaussianSplatControllers.forEach(controller => {
    controller.setPointSize(size)
  })
}

// 暴露方法给父组件
defineExpose({
  clearScene,
  resetCamera,
  toggleGridAxes,
  toggleGrid,
  toggleAxes,
  loadBuiltinModel,
  loadFerrariWithAssemblyAnimation,
  toggleImportPanel,
  hideImportPanel,
  toggleBuiltinModelsPanel,
  hideBuiltinModelsPanel,
  showObjectList,
  hideObjectListPanel,
  selectObjectFromList,
  focusOnObject,
  handleViewChange,
  deleteObject,
  importModel,
  duplicateObject,
  exportSceneAsZip,
  importSceneFromZip,
  openCameraTourDialog,
  toggleKeyboardControl,
  isKeyboardEnabled,
  openLightConfigDialog,
  openSkyboxConfigDialog,
  switchToOrthographic,
  switchToPerspective,
  setShadowType,
  applyShadowPreset,
  loadGaussianSplatModel,
  createParticleSplashEffect
})

// 键盘事件处理
const handleKeyDown = (event: KeyboardEvent) => {
  // 只在选择对象且键盘控制启用时响应
  if (!selectedObject.value || !isKeyboardEnabled.value) {
    return
  }

  // 防止在输入框中触发
  if (event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement) {
    return
  }

  const step = moveStep
  let moved = false

  switch (event.key.toLowerCase()) {
    case 'arrowup':
    case 'w':
      // 向前移动（Z轴正方向）
      selectedObject.value.position.z += step
      moved = true
      break
    case 'arrowdown':
    case 's':
      // 向后移动（Z轴负方向）
      selectedObject.value.position.z -= step
      moved = true
      break
    case 'arrowleft':
    case 'a':
      // 向左移动（X轴负方向）
      selectedObject.value.position.x -= step
      moved = true
      break
    case 'arrowright':
    case 'd':
      // 向右移动（X轴正方向）
      selectedObject.value.position.x += step
      moved = true
      break
    case 'q':
      // 向上移动（Y轴正方向）
      selectedObject.value.position.y += step
      moved = true
      break
    case 'e':
      // 向下移动（Y轴负方向）
      selectedObject.value.position.y -= step
      moved = true
      break
  }

  if (moved) {
    // 阻止默认行为
    event.preventDefault()

    // 更新变换控制器
    updateTransformControls()

    // 更新属性编辑器
    updatePropertyEditor()

    // 强制更新矩阵
    selectedObject.value.updateMatrix()
    selectedObject.value.updateMatrixWorld(true)

    console.log(`键盘移动对象: ${selectedObject.value.name}`, {
      position: selectedObject.value.position,
      key: event.key
    })
  }
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initScene()
  })

  // 检测本地HDRI文件
  detectLocalHDRI()

  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  // 移除键盘事件监听器
  document.removeEventListener('keydown', handleKeyDown)

  if (renderer) {
    renderer.value.dispose()
  }
  if (container.value && renderer.value?.domElement) {
    container.value.removeChild(renderer.value.domElement)
  }

  // 清理管理器
  if (materialManager) {
    materialManager.dispose()
  }
  if (geometryManager) {
    geometryManager.dispose()
  }
})
</script>

<style scoped lang="scss">
.scene-viewer {
  flex: 1;
  position: relative;
  background: #1a1a1a;
  width: 100%;
  height: 100vh;
  max-width: 100%;
  max-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 0; /* 允许 flex 子元素缩小 */

  .scene-container {
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100vh;
    cursor: crosshair;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
  }







  // 属性编辑器样式
  .property-editor {
    position: absolute;
    top: 20px;
    left: 20px;
    width: 320px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 12px;
    color: #fff;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, #007acc 0%, #005a99 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .editor-content {
      padding: 20px;
      max-height: 500px;
      overflow-y: auto;

      .property-group {
        margin-bottom: 20px;

        .property-group-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;

          h4 {
            margin: 0;
            font-size: 14px;
            font-weight: 600;
            color: #007acc;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-bottom: 6px;
            flex: 1;
          }

          .max-value-setting {
            margin: 0;
            padding: 0;
            border: none;

            .property-row {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;

              label {
                font-size: 12px;
                color: #ccc;
                font-weight: 500;
                white-space: nowrap;
                flex-shrink: 0;
              }
            }
          }
        }

        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #007acc;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 6px;
        }

        // 名称编辑器样式
        .name-editor {
          .property-row {
            display: flex;
            align-items: center;
            gap: 12px;

            label {
              font-size: 12px;
              color: #ccc;
              font-weight: 500;
              white-space: nowrap;
              min-width: fit-content;
            }

            .name-input {
              flex: 1;
              background: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 6px;
              padding: 8px 12px;
              color: #fff;
              font-size: 13px;
              transition: all 0.3s ease;

              &::placeholder {
                color: #888;
              }

              &:focus {
                outline: none;
                border-color: #007acc;
                background: rgba(255, 255, 255, 0.15);
                box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
              }

              &:hover {
                border-color: rgba(255, 255, 255, 0.3);
              }
            }
          }
        }

        .input-row {
          display: grid;
          grid-template-columns: auto 1fr auto 1fr auto 1fr;
          gap: 8px;
          align-items: center;
          margin-bottom: 8px;

          label {
            font-size: 12px;
            color: #ccc;
            font-weight: 500;
            min-width: 20px;
          }

          input {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            color: #fff;
            padding: 6px 8px;
            font-size: 12px;
            text-align: center;
            transition: all 0.2s;

            &:focus {
              outline: none;
              border-color: #007acc;
              background: rgba(255, 255, 255, 0.15);
            }

            &::-webkit-inner-spin-button,
            &::-webkit-outer-spin-button {
              opacity: 1;
            }
          }
        }

        // 位置滑块样式
        .position-controls {
          .position-slider {
            margin-bottom: 15px;

            .property-row {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;

              label {
                font-size: 12px;
                color: #ccc;
                font-weight: 500;
                white-space: nowrap;
                flex-shrink: 0;
              }
            }

            label {
              display: block;
              color: #ccc;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .slider-container {
              display: flex;
              align-items: center;
              gap: 6px;
              flex: 1;
              min-width: 0;

              .position-slider-input {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;

                &::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  background: #28a745;
                  border-radius: 50%;
                  cursor: pointer;
                  transition: all 0.2s ease;

                  &:hover {
                    background: #20c997;
                    transform: scale(1.1);
                  }
                }

                &::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  background: #28a745;
                  border-radius: 50%;
                  cursor: pointer;
                  border: none;
                  transition: all 0.2s ease;

                  &:hover {
                    background: #20c997;
                    transform: scale(1.1);
                  }
                }

                &::-webkit-slider-track {
                  height: 6px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                }

                &::-moz-range-track {
                  height: 6px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                  border: none;
                }
              }

              .position-input {
                width: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #fff;
                padding: 4px 6px;
                font-size: 12px;
                text-align: center;
                transition: all 0.2s;

                &:focus {
                  outline: none;
                  border-color: #28a745;
                  background: rgba(255, 255, 255, 0.15);
                }

                &::-webkit-inner-spin-button,
                &::-webkit-outer-spin-button {
                  opacity: 1;
                }
              }

              .position-unit {
                color: #28a745;
                font-size: 12px;
                font-weight: 600;
                min-width: 15px;
                text-align: center;
              }
            }
          }

          .max-value-setting {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);

            .property-row {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;

              label {
                font-size: 12px;
                color: #ccc;
                font-weight: 500;
                white-space: nowrap;
                min-width: 80px;
                flex-shrink: 0;
              }
            }

            label {
              display: block;
              color: #ccc;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .max-input-container {
              display: flex;
              align-items: center;
              gap: 6px;
              flex: 1;
              min-width: 0;

              .max-value-input {
                width: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #fff;
                padding: 4px 6px;
                font-size: 12px;
                text-align: center;
                transition: all 0.2s;

                &:focus {
                  outline: none;
                  border-color: #28a745;
                  background: rgba(255, 255, 255, 0.15);
                }

                &::-webkit-inner-spin-button,
                &::-webkit-outer-spin-button {
                  opacity: 1;
                }
              }

              .max-value-unit {
                color: #28a745;
                font-size: 12px;
                font-weight: 600;
                min-width: 15px;
                text-align: center;
              }
            }
          }
        }

        // 旋转滑块样式
        .rotation-controls {
          .rotation-slider {
            margin-bottom: 15px;

            .property-row {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;

              label {
                font-size: 12px;
                color: #ccc;
                font-weight: 500;
                white-space: nowrap;
                flex-shrink: 0;
              }
            }

            label {
              display: block;
              color: #ccc;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .slider-container {
              display: flex;
              align-items: center;
              gap: 6px;
              flex: 1;
              min-width: 0;

              .rotation-slider-input {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;

                &::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  background: #007acc;
                  border-radius: 50%;
                  cursor: pointer;
                  transition: all 0.2s ease;

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
                  transition: all 0.2s ease;

                  &:hover {
                    background: #0099ff;
                    transform: scale(1.1);
                  }
                }

                &::-webkit-slider-track {
                  height: 6px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                }

                &::-moz-range-track {
                  height: 6px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                  border: none;
                }
              }

              .rotation-input {
                width: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #fff;
                padding: 4px 6px;
                font-size: 12px;
                text-align: center;
                transition: all 0.2s;

                &:focus {
                  outline: none;
                  border-color: #007acc;
                  background: rgba(255, 255, 255, 0.15);
                }

                &::-webkit-inner-spin-button,
                &::-webkit-outer-spin-button {
                  opacity: 1;
                }
              }

              .rotation-unit {
                color: #007acc;
                font-size: 12px;
                font-weight: 600;
                min-width: 15px;
                text-align: center;
              }
            }
          }
        }

        // 缩放滑块样式
        .scale-controls {
          .scale-slider {
            margin-bottom: 15px;

            .property-row {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;

              label {
                font-size: 12px;
                color: #ccc;
                font-weight: 500;
                white-space: nowrap;
                flex-shrink: 0;
              }
            }

            label {
              display: block;
              color: #ccc;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .slider-container {
              display: flex;
              align-items: center;
              gap: 6px;
              flex: 1;
              min-width: 0;

              .scale-slider-input {
                flex: 1;
                height: 6px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 3px;
                outline: none;
                -webkit-appearance: none;
                appearance: none;

                &::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 18px;
                  height: 18px;
                  background: #ff6b35;
                  border-radius: 50%;
                  cursor: pointer;
                  transition: all 0.2s ease;

                  &:hover {
                    background: #ff8c42;
                    transform: scale(1.1);
                  }
                }

                &::-moz-range-thumb {
                  width: 18px;
                  height: 18px;
                  background: #ff6b35;
                  border-radius: 50%;
                  cursor: pointer;
                  border: none;
                  transition: all 0.2s ease;

                  &:hover {
                    background: #ff8c42;
                    transform: scale(1.1);
                  }
                }

                &::-webkit-slider-track {
                  height: 6px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                }

                &::-moz-range-track {
                  height: 6px;
                  background: rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                  border: none;
                }
              }

              .scale-input {
                width: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #fff;
                padding: 4px 6px;
                font-size: 12px;
                text-align: center;
                transition: all 0.2s;

                &:focus {
                  outline: none;
                  border-color: #ff6b35;
                  background: rgba(255, 255, 255, 0.15);
                }

                &::-webkit-inner-spin-button,
                &::-webkit-outer-spin-button {
                  opacity: 1;
                }
              }

              .scale-unit {
                color: #ff6b35;
                font-size: 12px;
                font-weight: 600;
                min-width: 15px;
                text-align: center;
              }
            }
          }

          .max-value-setting {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);

            .property-row {
              display: flex;
              align-items: center;
              gap: 8px;
              min-width: 0;

              label {
                font-size: 12px;
                color: #ccc;
                font-weight: 500;
                white-space: nowrap;
                min-width: 80px;
                flex-shrink: 0;
              }
            }

            label {
              display: block;
              color: #ccc;
              font-size: 12px;
              font-weight: 500;
              margin-bottom: 8px;
            }

            .max-input-container {
              display: flex;
              align-items: center;
              gap: 6px;
              flex: 1;
              min-width: 0;

              .max-value-input {
                width: 50px;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 4px;
                color: #fff;
                padding: 4px 6px;
                font-size: 12px;
                text-align: center;
                transition: all 0.2s;

                &:focus {
                  outline: none;
                  border-color: #ff6b35;
                  background: rgba(255, 255, 255, 0.15);
                }

                &::-webkit-inner-spin-button,
                &::-webkit-outer-spin-button {
                  opacity: 1;
                }
              }

              .max-value-unit {
                color: #ff6b35;
                font-size: 12px;
                font-weight: 600;
                min-width: 15px;
                text-align: center;
              }
            }
          }

          .uniform-scale {
            margin-top: 10px;

            label {
              display: flex;
              align-items: center;
              gap: 8px;
              font-size: 12px;
              color: #ccc;
              cursor: pointer;

              input[type="checkbox"] {
                margin: 0;
                width: 16px;
                height: 16px;
                accent-color: #ff6b35;
              }
            }
          }
        }

        .uniform-scale {
          margin-top: 8px;

          label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: #ccc;
            cursor: pointer;

            input[type="checkbox"] {
              margin: 0;
              width: 16px;
              height: 16px;
              accent-color: #007acc;
            }
          }
        }

        // 高亮设置样式
        .highlight-settings {
          .setting-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            label {
              color: #ccc;
              font-size: 12px;
              min-width: 80px;
              margin-right: 10px;
              cursor: pointer;
            }

            input[type="checkbox"] {
              margin: 0;
              width: 16px;
              height: 16px;
              accent-color: #007acc;
            }

            input[type="color"] {
              width: 40px;
              height: 24px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            }
          }
        }
      }

      // 动画控制样式
      .animation-controls {
        // 动画概览
        .animation-overview {
          background: rgba(0, 122, 204, 0.1);
          border: 1px solid rgba(0, 122, 204, 0.3);
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 16px;

          .overview-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
            font-size: 12px;

            &:last-child {
              margin-bottom: 0;
            }

            .highlight {
              color: #007acc;
              font-weight: 600;

              &.playing {
                color: #28a745;
              }
            }
          }
        }

        .animation-list {
          margin-bottom: 20px;

          .animation-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            margin-bottom: 8px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: all 0.3s ease;

            &:hover {
              background: rgba(255, 255, 255, 0.08);
              border-color: rgba(255, 255, 255, 0.2);
            }

            &.active {
              background: rgba(0, 122, 204, 0.2);
              border-color: #007acc;
            }

            .animation-info {
              flex: 1;

              .animation-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 6px;

                .animation-name {
                  font-size: 13px;
                  font-weight: 600;
                  color: #fff;
                }

                .animation-index {
                  font-size: 11px;
                  color: #888;
                  background: rgba(255, 255, 255, 0.1);
                  padding: 2px 6px;
                  border-radius: 4px;
                }
              }

              .animation-details {
                display: flex;
                gap: 12px;
                font-size: 11px;
                color: #888;

                .animation-duration,
                .animation-tracks {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                }
              }
            }

            .animation-actions {
              display: flex;
              gap: 6px;

              .animation-btn {
                background: none;
                border: 1px solid rgba(255, 255, 255, 0.3);
                color: #fff;
                padding: 6px 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;

                &:hover {
                  border-color: #fff;
                  background: rgba(255, 255, 255, 0.1);
                }

                &.play {
                  &.playing {
                    background: #28a745;
                    border-color: #28a745;
                  }
                }

                &.stop {
                  &:hover {
                    border-color: #dc3545;
                    background: rgba(220, 53, 69, 0.1);
                  }
                }
              }
            }
          }
        }

        .animation-settings {
          .setting-item {
            display: flex;
            align-items: center;
            margin-bottom: 12px;

            label {
              color: #ccc;
              font-size: 12px;
              min-width: 80px;
              margin-right: 10px;
            }

            input[type="range"] {
              flex: 1;
              margin: 0 10px;
              height: 4px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 2px;
              outline: none;

              &::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: #007acc;
                border-radius: 50%;
                cursor: pointer;
              }

              &::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: #007acc;
                border-radius: 50%;
                border: none;
                cursor: pointer;
              }
            }

            span {
              color: #007acc;
              font-size: 11px;
              font-weight: 600;
              min-width: 30px;
              text-align: right;

              &.speed-value {
                color: #28a745;
                font-size: 12px;
              }
            }

            input[type="checkbox"] {
              margin: 0;
              width: 16px;
              height: 16px;
              accent-color: #007acc;
            }

            .stop-all-btn {
              background: #dc3545;
              border: 1px solid #dc3545;
              color: #fff;
              padding: 8px 12px;
              border-radius: 6px;
              cursor: pointer;
              transition: all 0.3s ease;
              font-size: 12px;
              font-weight: 500;

              &:hover {
                background: #c82333;
                border-color: #c82333;
                transform: translateY(-1px);
              }

              &:active {
                transform: scale(0.98);
              }
            }
          }
        }
      }

      .quick-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        gap: 8px;

        .action-btn {
          background: linear-gradient(135deg, #4a4a4a 0%, #3a3a3a 100%);
          border: 1px solid #555;
          color: #fff;
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 13px;
          text-align: center;

          &:hover {
            background: linear-gradient(135deg, #5a5a5a 0%, #4a4a4a 100%);
            border-color: #007acc;
            color: #fff;
            transform: translateY(-1px);
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }

  // 模型导入面板样式
  .import-panel {
    position: absolute;
    bottom: 20px;
    left: 20px;
    width: 320px;
    background: rgba(0, 0, 0, 0.9);
    border-radius: 12px;
    color: #fff;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    overflow: hidden;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);

      h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: #fff;
        font-size: 18px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      }
    }

    .panel-content {
      padding: 20px;
      max-height: 400px;
      overflow-y: auto;

      .drop-zone {
        border: 2px dashed rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 30px 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 20px;

        &:hover {
          border-color: #28a745;
          background: rgba(40, 167, 69, 0.1);
        }

        &.drag-over {
          border-color: #28a745;
          background: rgba(40, 167, 69, 0.2);
          transform: scale(1.02);
        }

        .drop-content {
          .drop-icon {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.8;
          }

          .drop-text {
            margin-bottom: 10px;

            p {
              margin: 5px 0;
              font-size: 14px;
              color: #ccc;
            }
          }

          .supported-formats {
            font-size: 12px;
            color: #888;
            background: rgba(255, 255, 255, 0.1);
            padding: 8px 12px;
            border-radius: 6px;
            display: inline-block;
          }
        }
      }

      .import-options {
        margin-bottom: 20px;

        .option-group {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 15px;

          label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: #ccc;
            cursor: pointer;

            input[type="checkbox"] {
              margin: 0;
              width: 16px;
              height: 16px;
              accent-color: #28a745;
            }
          }
        }

        .test-buttons {
          display: flex;
          flex-direction: column;
          gap: 8px;

          .test-btn {
            background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
            border: 1px solid #7c3aed;
            color: #fff;
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 12px;
            text-align: center;

            &:hover {
              background: linear-gradient(135deg, #7c3aed 0%, #6f42c1 100%);
              transform: translateY(-1px);
            }

            &:active {
              transform: scale(0.98);
            }
          }
        }
      }

      .import-history {
        h4 {
          margin: 0 0 15px 0;
          font-size: 14px;
          font-weight: 600;
          color: #28a745;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 6px;
        }

        .history-list {
          .history-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            margin-bottom: 8px;

            .file-name {
              font-size: 12px;
              color: #fff;
              flex: 1;
              margin-right: 10px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .file-size {
              font-size: 11px;
              color: #888;
              margin-right: 10px;
            }

            .remove-btn {
              background: none;
              border: none;
              color: #ff6b6b;
              cursor: pointer;
              padding: 4px;
              border-radius: 4px;
              transition: background-color 0.2s;

              &:hover {
                background: rgba(255, 107, 107, 0.2);
              }
            }
          }
        }
      }
    }

    // 自定义滚动条
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 3px;

      &:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    }
  }

  // 内置模型面板样式
  .model-list {
    .model-list-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      margin-bottom: 4px;
      background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%);
      border: 1px solid #555;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

      &:hover {
        background: linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%);
        border-color: #007acc;
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 122, 204, 0.3);
      }

      &:active {
        transform: translateX(2px);
      }

      .model-name {
        color: #fff;
        font-size: 13px;
        font-weight: 600;
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-right: 8px;
      }

      .model-format {
        color: #007acc;
        font-size: 10px;
        background: rgba(0, 122, 204, 0.2);
        padding: 2px 6px;
        border-radius: 3px;
        border: 1px solid rgba(0, 122, 204, 0.3);
        flex-shrink: 0;
        margin-right: 8px;
      }

      .model-category {
        color: #888;
        font-size: 10px;
        background: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
        flex-shrink: 0;
        white-space: nowrap;
      }
    }
  }

  // 响应式设计
  @media (max-width: 1200px) {
    .property-editor,
    .import-panel,
    .scene-info-panel {
      width: 280px;

      .panel-content,
      .editor-content {
        padding: 15px;
      }

      .drop-zone {
        padding: 20px 12px;

        .drop-content .drop-icon {
          font-size: 32px;
        }
      }
    }
  }

  @media (max-width: 768px) {
    .property-editor,
    .import-panel,
    .scene-info-panel {
      position: relative;
      top: auto;
      left: auto;
      right: auto;
      bottom: auto;
      width: 100%;
      margin: 20px;
    }

  }

  // 对象列表面板样式
  .object-list-panel {
    position: fixed;
    top: 50%;
    right: 20px;
    transform: translateY(-50%);
    width: 300px;
    max-height: 70vh;
    background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
    border: 1px solid #555;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    z-index: 1000;
    overflow: hidden;

    .panel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%);
      border-bottom: 1px solid #555;

      h3 {
        margin: 0;
        color: #fff;
        font-size: 16px;
        font-weight: 600;
      }

      .close-btn {
        background: none;
        border: none;
        color: #ccc;
        font-size: 18px;
        cursor: pointer;
        padding: 5px;
        border-radius: 4px;
        transition: all 0.2s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
        }
      }
    }

    .panel-content {
      padding: 15px;
      max-height: calc(70vh - 60px);
      overflow-y: auto;

      .object-list {
        .object-list-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 15px;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #3a3a3a 0%, #4a4a4a 100%);
          border: 1px solid #555;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: linear-gradient(135deg, #4a4a4a 0%, #5a5a5a 100%);
            border-color: #007acc;
            transform: translateX(2px);
          }

          &.active {
            background: linear-gradient(135deg, #007acc 0%, #0056b3 100%);
            border-color: #007acc;
            color: #fff;
          }

          .object-info {
            flex: 1;
            min-width: 0;

            .object-name {
              font-weight: 600;
              color: #fff;
              margin-bottom: 4px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .object-type {
              font-size: 12px;
              color: #ccc;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
          }

          .object-actions {
            display: flex;
            gap: 8px;
            margin-left: 10px;

            .action-btn {
              background: none;
              border: 1px solid #666;
              color: #ccc;
              padding: 6px 8px;
              border-radius: 4px;
              cursor: pointer;
              font-size: 12px;
              transition: all 0.2s ease;

              &:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #999;
                color: #fff;
              }

              &.focus-btn:hover {
                background: #28a745;
                border-color: #28a745;
                color: #fff;
              }

              &.delete-btn:hover {
                background: #dc3545;
                border-color: #dc3545;
                color: #fff;
              }
            }
          }
        }

        .empty-list {
          text-align: center;
          padding: 40px 20px;
          color: #888;

          p {
            margin: 0;
            font-size: 14px;
          }
        }
      }
    }
  }
}

// 光源管理样式
.toolbar-section {
  margin-bottom: 20px;

  .toolbar-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: 10px;
  }
}

.btn-primary, .btn-secondary, .btn-info {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #117a8b;
}

.light-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #444;
  border-radius: 6px;
  padding: 10px;
}

.light-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #444;
  transition: background 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #333;
  }

  &.disabled {
    opacity: 0.6;
  }

  .light-info {
    display: flex;
    align-items: center;
    gap: 10px;

    .light-icon {
      font-size: 18px;
    }

    .light-name {
      font-weight: 500;
      color: #fff;
    }

    .light-type {
      font-size: 12px;
      color: #999;
      background: #444;
      padding: 2px 6px;
      border-radius: 4px;
  }
}

.btn-edit, .btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.btn-edit {
  background: #28a745;
  color: white;

  &:hover {
    background: #1e7e34;
  }
}

.btn-delete {
  background: #dc3545;
  color: white;

  &:hover {
    background: #c82333;
  }
}

// 切换开关样式
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 20px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.2s;
    border-radius: 20px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: #007bff;

    &:before {
      transform: translateX(20px);
    }
  }
}

// 表单样式
.text-input, .select-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
}

.dialog-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

// 文件上传样式
.file-input {
  width: 100%;
  padding: 8px 12px;
  border: 2px dashed #444;
  border-radius: 6px;
  background: #2a2a2a;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;

  &:hover {
    border-color: #007bff;
  }

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
  }
}

.upload-tip {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 5px;
  font-style: italic;
}

.info-tip {
  background: rgba(0, 123, 255, 0.1);
  border: 1px solid rgba(0, 123, 255, 0.3);
  border-radius: 6px;
  padding: 10px;
  margin: 10px 0;

  p {
    margin: 5px 0;
    font-size: 14px;
    color: #e0e0e0;
  }
}


  .value-display {
    min-width: 60px;
    text-align: center;
    font-weight: bold;
    color: #4CAF50;
    font-size: 12px;
  }

  .setting-description {
    font-size: 11px;
    color: #ccc;
    margin-top: 3px;
    line-height: 1.3;
  }

  .reset-btn {
    background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
    border: 1px solid #ff5252;
    color: #fff;

    &:hover {
      background: linear-gradient(135deg, #ff5252 0%, #e53935 100%);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 82, 82, 0.3);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px rgba(255, 82, 82, 0.2);
    }
  }
}
</style>
