<template>
  <div class="camera-tour-dialog" v-if="visible">
    <div class="dialog-overlay" @click="closeDialog"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3><span v-if="props.showIcons">🎬 </span>漫游配置</h3>
        <button class="close-btn" @click="closeDialog">✕</button>
      </div>
      
      <div class="dialog-body">
        <!-- 配置名称 -->
        <div class="config-section">
          <div class="config-row">
            <h4><span v-if="props.showIcons">📝 </span>配置名称</h4>
            <div class="input-container">
              <input 
                type="text" 
                v-model="configName" 
                class="config-input"
                placeholder="请输入漫游配置名称"
                maxlength="50"
              />
            </div>
          </div>
        </div>

        <!-- 漫游模式选择 -->
        <div class="config-section">
          <div class="config-row">
            <h4><span v-if="props.showIcons">📹 </span>漫游模式</h4>
            <div class="select-container">
              <select v-model="tourMode" @change="onModeChange" class="config-select">
                <option value="first-person">
                  <span v-if="props.showIcons">👁️ </span>第一人称漫游
                </option>
                <option value="third-person">
                  <span v-if="props.showIcons">📷 </span>第三人称漫游
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 路径类型选择 -->
        <div class="config-section">
          <div class="config-row">
            <h4><span v-if="props.showIcons">🛤️ </span>路径类型</h4>
            <div class="select-container">
              <select v-model="selectedPathType" @change="selectPathType" class="config-select">
                <option v-for="pathType in pathTypes" :key="pathType.value" :value="pathType.value">
                  <span v-if="props.showIcons">{{ pathType.icon }} </span>{{ pathType.name }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 路径点管理 -->
        <div class="config-section">
          <h4><span v-if="props.showIcons">📍 </span>路径点管理</h4>
          <div class="path-points-controls">
            <button 
              class="control-btn add-point-btn"
              @click="addPathPoint"
              :disabled="!canAddPoint"
            >
              <span v-if="props.showIcons">➕ </span>添加路径点
            </button>
            <button 
              class="control-btn add-from-object-btn"
              @click="addPathPointFromObject"
              :disabled="!canAddPoint"
            >
              <span v-if="props.showIcons">🎯 </span>从对象添加
            </button>
            <button 
              class="control-btn clear-points-btn"
              @click="clearPathPoints"
              :disabled="pathPoints.length === 0"
            >
              <span v-if="props.showIcons">🗑️ </span>清空路径点
            </button>
          </div>
          
          <div class="path-points-list" v-if="pathPoints.length > 0">
            <div 
              v-for="(point, index) in pathPoints" 
              :key="point.id"
              class="path-point-item"
              :class="{ editing: isEditingPoint(index) }"
            >
              <!-- 显示模式 -->
              <div v-if="!isEditingPoint(index)" class="point-display">
                <div class="point-info">
                  <span class="point-index">{{ index + 1 }}</span>
                  <span class="point-coords">
                    ({{ point.position.x.toFixed(1) }}, {{ point.position.y.toFixed(1) }}, {{ point.position.z.toFixed(1) }})
                  </span>
                  <span class="point-time" v-if="point.time">⏱️ {{ point.time.toFixed(1) }}s</span>
                </div>
                <div class="point-actions">
                  <button 
                    class="action-btn locate-btn"
                    @click="locatePathPoint(index)"
                    title="定位到路径点"
                  >
                    🎯
                  </button>
                  <button 
                    class="action-btn edit-btn"
                    @click="editPathPoint(index)"
                    title="编辑路径点"
                  >
                    ✏️
                  </button>
                  <button 
                    class="action-btn delete-btn"
                    @click="removePathPoint(index)"
                    title="删除路径点"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <!-- 编辑模式 -->
              <div v-else class="point-edit">
                <!-- 调试信息 -->
                <div style="color: red; font-size: 10px; margin-bottom: 4px;">
                  调试: editingPointIndex={{ editingPointIndex }}, index={{ index }}, isEditing={{ isEditingPoint(index) }}
                </div>
                <div class="edit-header">
                  <span class="edit-title">编辑路径点 {{ index + 1 }}</span>
                  <div class="edit-actions">
                    <button class="action-btn save-btn" @click="savePathPoint(index)" title="保存">
                      💾
                    </button>
                    <button class="action-btn cancel-btn" @click="cancelEditPathPoint" title="取消">
                      ❌
                    </button>
                  </div>
                </div>
                <div class="edit-content">
                  <div class="coordinate-editor">
                    <div class="coord-group">
                      <label>X轴位置:</label>
                      <div class="coord-controls">
                        <input 
                          type="range" 
                          v-model.number="editingPoint.position.x" 
                          :min="-20" 
                          :max="20" 
                          step="0.1"
                          class="coord-slider"
                        />
                        <input 
                          type="number" 
                          v-model.number="editingPoint.position.x" 
                          :min="-20" 
                          :max="20" 
                          step="0.1"
                          class="coord-input"
                        />
                      </div>
                    </div>
                    <div class="coord-group">
                      <label>Y轴位置:</label>
                      <div class="coord-controls">
                        <input 
                          type="range" 
                          v-model.number="editingPoint.position.y" 
                          :min="-20" 
                          :max="20" 
                          step="0.1"
                          class="coord-slider"
                        />
                        <input 
                          type="number" 
                          v-model.number="editingPoint.position.y" 
                          :min="-20" 
                          :max="20" 
                          step="0.1"
                          class="coord-input"
                        />
                      </div>
                    </div>
                    <div class="coord-group">
                      <label>Z轴位置:</label>
                      <div class="coord-controls">
                        <input 
                          type="range" 
                          v-model.number="editingPoint.position.z" 
                          :min="-20" 
                          :max="20" 
                          step="0.1"
                          class="coord-slider"
                        />
                        <input 
                          type="number" 
                          v-model.number="editingPoint.position.z" 
                          :min="-20" 
                          :max="20" 
                          step="0.1"
                          class="coord-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 漫游设置 -->
        <div class="config-section">
          <h4>⚙️ 漫游设置</h4>
          <div class="tour-settings">
            <div class="setting-item">
              <label>总时长 (秒):</label>
              <input 
                type="number" 
                v-model.number="tourDuration" 
                min="1" 
                max="300"
                step="0.1"
                class="setting-input"
              />
            </div>
            <div class="setting-item">
              <label>播放速度:</label>
              <input 
                type="range" 
                v-model.number="playbackSpeed" 
                min="0.1" 
                max="3" 
                step="0.1"
                class="setting-slider"
              />
              <span class="speed-value">{{ playbackSpeed.toFixed(1) }}x</span>
            </div>
            <div class="setting-item">
              <label>自动循环:</label>
              <input 
                type="checkbox" 
                v-model="autoLoop"
                class="setting-checkbox"
              />
            </div>
          </div>
        </div>

      </div>
      
      <div class="dialog-footer">
        <button class="btn btn-secondary" @click="closeDialog">
          <span v-if="props.showIcons">❌ </span>取消
        </button>
        <button class="btn btn-primary" @click="saveTourConfig">
          <span v-if="props.showIcons">💾 </span>保存配置
        </button>
      </div>
    </div>
  </div>
  
  <!-- 对象选择对话框 -->
  <div class="object-selector-dialog" v-if="showObjectSelector">
    <div class="dialog-overlay" @click="closeObjectSelector"></div>
    <div class="dialog-content">
      <div class="dialog-header">
        <h3>🎯 选择对象</h3>
        <button class="close-btn" @click="closeObjectSelector">✕</button>
      </div>
      
      <div class="dialog-body">
        <div class="object-list">
          <div 
            v-for="(obj, index) in availableObjects" 
            :key="obj.uuid"
            class="object-item"
            @click="selectObjectForPathPoint(obj)"
          >
            <div class="object-info">
              <span class="object-index">{{ index + 1 }}</span>
              <span class="object-name">{{ obj.name || `Object_${index + 1}` }}</span>
              <span class="object-type">{{ obj.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import * as THREE from 'three'

interface PathPoint {
  id: string
  position: { x: number, y: number, z: number }
  rotation?: { x: number, y: number, z: number }
  time?: number
}

interface Props {
  visible: boolean
  cameraPosition?: { x: number, y: number, z: number }
  cameraRotation?: { x: number, y: number, z: number }
  editingConfig?: any
  sceneObjects?: any[]
  showIcons?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'save-config', 'add-path-point', 'update-path-point', 'locate-path-point'])

// 配置名称
const configName = ref('')

// 漫游模式
const tourMode = ref<'first-person' | 'third-person'>('first-person')

// 路径类型
const pathTypes = [
  { value: 'linear', name: '直线', icon: '📏' },
  { value: 'polyline', name: '折线', icon: '📐' },
  { value: 'bezier', name: '贝塞尔曲线', icon: '🌊' },
  { value: 'spline', name: '样条曲线', icon: '🎯' }
]

const selectedPathType = ref('linear')

// 路径点
const pathPoints = ref<PathPoint[]>([])

// 编辑状态
const editingPointIndex = ref(-1)
const editingPoint = ref<PathPoint>({
  id: '',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  time: 0
})

// 对象选择状态
const showObjectSelector = ref(false)
const availableObjects = computed(() => props.sceneObjects || [])

// 漫游设置
const tourDuration = ref(10)
const playbackSpeed = ref(1.0)
const autoLoop = ref(false)


// 计算属性
const canAddPoint = computed(() => {
  const hasCameraPosition = props.cameraPosition !== undefined
  const hasObjects = availableObjects.value.length > 0
  const canAdd = hasCameraPosition || hasObjects
  
  console.log('canAddPoint计算:', {
    hasCameraPosition,
    hasObjects,
    canAdd,
    cameraPosition: props.cameraPosition,
    objectsCount: availableObjects.value.length
  })
  
  return canAdd
})

// 检查是否正在编辑指定索引的路径点
const isEditingPoint = (index: number) => {
  return editingPointIndex.value === index
}

// 监听编辑状态变化
watch(editingPointIndex, (newIndex) => {
  console.log('editingPointIndex 变化:', newIndex)
})

// 监听编辑配置变化
watch(() => props.editingConfig, (newConfig) => {
  if (newConfig) {
    console.log('加载编辑配置:', newConfig)
    console.log('当前可用对象数量:', availableObjects.value.length)
    // 初始化对话框数据
    configName.value = newConfig.name || ''
    tourMode.value = newConfig.mode || 'first-person'
    selectedPathType.value = newConfig.pathType || 'linear'
    tourDuration.value = newConfig.duration || 10
    playbackSpeed.value = newConfig.speed || 1
    autoLoop.value = newConfig.loop || false
    pathPoints.value = newConfig.points || []
    console.log('编辑配置加载完成，路径点数量:', pathPoints.value.length)
  } else {
    // 重置为默认值
    configName.value = ''
    tourMode.value = 'first-person'
    selectedPathType.value = 'linear'
    tourDuration.value = 10
    playbackSpeed.value = 1
    autoLoop.value = false
    pathPoints.value = []
  }
}, { immediate: true })

// 方法
const closeDialog = () => {
  emit('close')
}

const onModeChange = () => {
  console.log('漫游模式切换:', tourMode.value)
}

const selectPathType = () => {
  console.log('路径类型选择:', selectedPathType.value)
}

const addPathPoint = () => {
  if (!props.cameraPosition) return
  
  const newPoint: PathPoint = {
    id: `point_${Date.now()}`,
    position: { ...props.cameraPosition },
    rotation: props.cameraRotation ? { ...props.cameraRotation } : undefined,
    time: pathPoints.value.length === 0 ? 0 : tourDuration.value / pathPoints.value.length
  }
  
  pathPoints.value.push(newPoint)
  emit('add-path-point', newPoint)
  console.log('添加路径点:', newPoint)
}

const removePathPoint = (index: number) => {
  pathPoints.value.splice(index, 1)
  console.log('删除路径点:', index)
}

const editPathPoint = (index: number) => {
  console.log('开始编辑路径点:', index, '当前editingPointIndex:', editingPointIndex.value)
  editingPointIndex.value = index
  editingPoint.value = { ...pathPoints.value[index] }
  console.log('编辑路径点设置完成:', index, 'editingPointIndex:', editingPointIndex.value, 'editingPoint:', editingPoint.value)
}

const savePathPoint = (index: number) => {
  pathPoints.value[index] = { ...editingPoint.value }
  editingPointIndex.value = -1
  emit('update-path-point', { index, point: pathPoints.value[index] })
  console.log('保存路径点:', index, pathPoints.value[index])
}

const cancelEditPathPoint = () => {
  editingPointIndex.value = -1
  console.log('取消编辑路径点')
}

const locatePathPoint = (index: number) => {
  const point = pathPoints.value[index]
  emit('locate-path-point', { index, point })
  console.log('定位到路径点:', index, point)
}

const clearPathPoints = () => {
  pathPoints.value = []
  console.log('清空路径点')
}

// 从对象添加路径点
const addPathPointFromObject = () => {
  console.log('尝试从对象添加路径点，可用对象数量:', availableObjects.value.length)
  console.log('可用对象:', availableObjects.value)
  
  if (availableObjects.value.length === 0) {
    console.log('没有可用的对象')
    return
  }
  showObjectSelector.value = true
}

// 关闭对象选择器
const closeObjectSelector = () => {
  showObjectSelector.value = false
}

// 选择对象作为路径点
const selectObjectForPathPoint = (obj: any) => {
  console.log('选择对象作为路径点:', obj)
  
  // 获取对象的世界坐标位置
  const worldPosition = new THREE.Vector3()
  obj.getWorldPosition(worldPosition)
  
  const newPoint: PathPoint = {
    id: `point_${Date.now()}`,
    position: {
      x: worldPosition.x,
      y: worldPosition.y,
      z: worldPosition.z
    },
    rotation: {
      x: obj.rotation.x,
      y: obj.rotation.y,
      z: obj.rotation.z
    },
    time: pathPoints.value.length === 0 ? 0 : tourDuration.value / pathPoints.value.length
  }
  
  pathPoints.value.push(newPoint)
  emit('add-path-point', newPoint)
  closeObjectSelector()
  
  console.log('从对象添加路径点:', newPoint)
}


const saveTourConfig = () => {
  // 验证配置名称
  if (!configName.value.trim()) {
    alert('请输入漫游配置名称')
    return
  }

  // 验证路径点
  if (pathPoints.value.length < 2) {
    alert('至少需要2个路径点才能创建漫游配置')
    return
  }

  const config = {
    name: configName.value.trim(),
    mode: tourMode.value,
    pathType: selectedPathType.value,
    points: pathPoints.value,
    duration: tourDuration.value,
    speed: playbackSpeed.value,
    loop: autoLoop.value
  }
  
  emit('save-config', config)
  console.log('保存漫游配置:', config)
  
  // 保存成功后关闭弹窗
  closeDialog()
}
</script>

<style scoped lang="scss">
.camera-tour-dialog {
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
    backdrop-filter: blur(4px);
  }
  
  .dialog-content {
    position: relative;
    background: rgba(0, 0, 0, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    overflow: hidden;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    
    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 20px;
      background: linear-gradient(135deg, #007acc 0%, #005a99 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      
      h3 {
        margin: 0;
        color: #fff;
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
    
    .dialog-body {
      padding: 20px;
      max-height: 60vh;
      overflow-y: auto;
      
      .config-section {
        margin-bottom: 20px;
        
        &:last-child {
          margin-bottom: 0;
        }
        
        h4 {
          margin: 0 0 12px 0;
          font-size: 14px;
          font-weight: 600;
          color: #007acc;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 6px;
        }
        
        // 配置行布局
        .config-row {
          display: flex;
          align-items: center;
          gap: 12px;
          
          h4 {
            margin: 0;
            border: none;
            padding: 0;
            white-space: nowrap;
            min-width: fit-content;
          }
        }
        
        // 输入框容器
        .input-container {
          flex: 1;
          
          .config-input {
            width: 300px;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 12px;
            transition: all 0.2s ease;
            
            &::placeholder {
              color: rgba(255, 255, 255, 0.5);
            }
            
            &:focus {
              outline: none;
              border-color: #007acc;
              background: rgba(255, 255, 255, 0.15);
            }
            
            &:hover {
              border-color: rgba(255, 255, 255, 0.3);
            }
          }
        }

        // 选择框容器
        .select-container {
          flex: 1;
          
          .config-select {
            width: 300px;
            padding: 8px 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
            
            &:focus {
              outline: none;
              border-color: #007acc;
              background: rgba(255, 255, 255, 0.15);
            }
            
            &:hover {
              border-color: rgba(255, 255, 255, 0.3);
            }
            
            option {
              background: #222;
              color: #fff;
            }
          }
        }
        
        
        // 路径点管理
        .path-points-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          
          .control-btn {
            padding: 6px 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            background: rgba(255, 255, 255, 0.1);
            color: #fff;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 12px;
            
            &:hover:not(:disabled) {
              background: rgba(255, 255, 255, 0.2);
              border-color: rgba(255, 255, 255, 0.3);
            }
            
            &:disabled {
              opacity: 0.5;
              cursor: not-allowed;
            }
            
            &.add-point-btn {
              background: #007acc;
              border-color: #007acc;
              
              &:hover:not(:disabled) {
                background: #005a9e;
              }
            }
            
            &.clear-points-btn {
              background: #dc3545;
              border-color: #dc3545;
              
              &:hover:not(:disabled) {
                background: #c82333;
              }
            }
          }
        }
        
        .path-points-list {
          max-height: 300px;
          overflow-y: auto;
          
          .path-point-item {
            margin-bottom: 8px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 6px;
            overflow: hidden;
            transition: all 0.2s ease;
            
            &.editing {
              border-color: #007acc;
              box-shadow: 0 0 10px rgba(0, 122, 204, 0.3);
            }
            
            .point-display {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 8px 12px;
              
              .point-info {
                display: flex;
                align-items: center;
                gap: 8px;
                
                .point-index {
                  background: #007acc;
                  color: white;
                  font-size: 10px;
                  font-weight: bold;
                  padding: 2px 6px;
                  border-radius: 10px;
                  min-width: 16px;
                  text-align: center;
                }
                
                .point-coords {
                  color: #fff;
                  font-family: 'Courier New', monospace;
                  font-size: 11px;
                }
                
                .point-time {
                  color: #ccc;
                  font-size: 10px;
                }
              }
              
              .point-actions {
                display: flex;
                gap: 4px;
                
                .action-btn {
                  background: none;
                  border: 1px solid rgba(255, 255, 255, 0.2);
                  border-radius: 3px;
                  color: #ccc;
                  cursor: pointer;
                  padding: 3px 6px;
                  font-size: 10px;
                  transition: all 0.2s ease;
                  
                  &:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                  }
                  
                  &.locate-btn:hover {
                    background: #28a745;
                    border-color: #28a745;
                    color: #fff;
                  }
                  
                  &.edit-btn:hover {
                    background: #007acc;
                    border-color: #007acc;
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
            
            .point-edit {
              .edit-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.05);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                
                .edit-title {
                  color: #fff;
                  font-weight: 600;
                  font-size: 12px;
                }
                
                .edit-actions {
                  display: flex;
                  gap: 4px;
                  
                  .action-btn {
                    background: none;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 3px;
                    color: #ccc;
                    cursor: pointer;
                    padding: 3px 6px;
                    font-size: 10px;
                    transition: all 0.2s ease;
                    
                    &:hover {
                      background: rgba(255, 255, 255, 0.1);
                      color: #fff;
                    }
                    
                    &.save-btn:hover {
                      background: #28a745;
                      border-color: #28a745;
                      color: #fff;
                    }
                    
                    &.cancel-btn:hover {
                      background: #dc3545;
                      border-color: #dc3545;
                      color: #fff;
                    }
                  }
                }
              }
              
              .edit-content {
                padding: 12px;
                
                .coordinate-editor {
                  display: flex;
                  flex-direction: column;
                  gap: 12px;
                  
                  .coord-group {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    
                    label {
                      color: #ccc;
                      font-size: 11px;
                      font-weight: 500;
                    }
                    
                    .coord-controls {
                      display: flex;
                      align-items: center;
                      gap: 8px;
                      
                      .coord-slider {
                        flex: 1;
                        height: 3px;
                        background: rgba(255, 255, 255, 0.2);
                        border-radius: 2px;
                        outline: none;
                        
                        &::-webkit-slider-thumb {
                          appearance: none;
                          width: 12px;
                          height: 12px;
                          background: #007acc;
                          border-radius: 50%;
                          cursor: pointer;
                        }
                      }
                      
                      .coord-input {
                        width: 60px;
                        padding: 4px 6px;
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        border-radius: 3px;
                        background: rgba(255, 255, 255, 0.1);
                        color: #fff;
                        font-size: 11px;
                        text-align: center;
                        
                        &:focus {
                          outline: none;
                          border-color: #007acc;
                          background: rgba(255, 255, 255, 0.15);
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        // 漫游设置
        .tour-settings {
          display: flex;
          flex-direction: column;
          gap: 12px;
          
          .setting-item {
            display: flex;
            align-items: center;
            gap: 8px;
            
            label {
              color: #ccc;
              font-size: 12px;
              min-width: 80px;
            }
            
            .setting-input {
              padding: 6px 8px;
              border: 1px solid rgba(255, 255, 255, 0.2);
              border-radius: 3px;
              background: rgba(255, 255, 255, 0.1);
              color: #fff;
              font-size: 12px;
              width: 80px;
              
              &:focus {
                outline: none;
                border-color: #007acc;
                background: rgba(255, 255, 255, 0.15);
              }
            }
            
            .setting-slider {
              flex: 1;
              height: 3px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 2px;
              outline: none;
              
              &::-webkit-slider-thumb {
                appearance: none;
                width: 12px;
                height: 12px;
                background: #007acc;
                border-radius: 50%;
                cursor: pointer;
              }
            }
            
            .speed-value {
              color: #fff;
              font-size: 12px;
              min-width: 30px;
            }
            
            .setting-checkbox {
              width: 14px;
              height: 14px;
              accent-color: #007acc;
            }
          }
        }
        
      }
    }
    
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 15px 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(0, 0, 0, 0.5);
      
      .btn {
        padding: 8px 16px;
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
        
        &.btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: #fff;
          
          &:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.3);
          }
        }
        
        &.btn-primary {
          background: #007acc;
          border-color: #007acc;
          color: #fff;
          
          &:hover {
            background: #005a9e;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .camera-tour-dialog {
    .dialog-content {
      width: 95%;
      margin: 20px;
      
      .dialog-body {
        padding: 16px;
        
        .mode-selector {
          flex-direction: column;
        }
        
        .path-type-selector {
          grid-template-columns: repeat(2, 1fr);
        }
        
        .tour-settings {
          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
            
            label {
              min-width: auto;
            }
          }
        }
      }
    }
  }
}

// 对象选择对话框样式
.object-selector-dialog {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2000;
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
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(15px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow: hidden;
  }
  
  .dialog-header {
    background: linear-gradient(135deg, #007acc 0%, #005a99 100%);
    color: white;
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      padding: 5px;
      border-radius: 4px;
      transition: background-color 0.2s;
      
      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
  
  .dialog-body {
    padding: 20px;
    max-height: 60vh;
    overflow-y: auto;
    
    .object-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .object-item {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 6px;
        padding: 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateX(2px);
        }
        
        .object-info {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .object-index {
            background: #007acc;
            color: white;
            font-size: 10px;
            font-weight: bold;
            padding: 2px 6px;
            border-radius: 10px;
            min-width: 20px;
            text-align: center;
          }
          
          .object-name {
            font-weight: 600;
            color: #fff;
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          .object-type {
            font-size: 10px;
            color: #ccc;
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
          }
        }
      }
    }
  }
}
</style>
