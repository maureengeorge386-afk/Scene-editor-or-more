// 工具配置
export const TOOLS = {
  SELECT: 'select',
  MOVE: 'move',
  ROTATE: 'rotate',
  SCALE: 'scale'
}

// 几何体配置
export const GEOMETRIES = {
  CUBE: 'cube',
  SPHERE: 'sphere',
  CYLINDER: 'cylinder',
  CONE: 'cone',
  PLANE: 'plane'
}

// 材质配置
export const MATERIALS = {
  BASIC: 'basic',
  STANDARD: 'standard',
  PHONG: 'phong',
  LAMBERT: 'lambert'
}

// 工具图标和名称映射
export const TOOL_ICONS = {
  [TOOLS.SELECT]: '🖱️',
  [TOOLS.MOVE]: '↔️',
  [TOOLS.ROTATE]: '🔄',
  [TOOLS.SCALE]: '📏'
}

export const TOOL_NAMES = {
  [TOOLS.SELECT]: '选择',
  [TOOLS.MOVE]: '移动',
  [TOOLS.ROTATE]: '旋转',
  [TOOLS.SCALE]: '缩放'
}

// 几何体图标和名称映射
export const GEOMETRY_ICONS = {
  [GEOMETRIES.CUBE]: '📦',
  [GEOMETRIES.SPHERE]: '🔴',
  [GEOMETRIES.CYLINDER]: '🪵',
  [GEOMETRIES.CONE]: '🔺',
  [GEOMETRIES.PLANE]: '⬜'
}

export const GEOMETRY_NAMES = {
  [GEOMETRIES.CUBE]: '立方体',
  [GEOMETRIES.SPHERE]: '球体',
  [GEOMETRIES.CYLINDER]: '圆柱体',
  [GEOMETRIES.CONE]: '圆锥体',
  [GEOMETRIES.PLANE]: '平面'
}

// 材质图标和名称映射
export const MATERIAL_ICONS = {
  [MATERIALS.BASIC]: '🎨',
  [MATERIALS.STANDARD]: '🌟',
  [MATERIALS.PHONG]: '💡',
  [MATERIALS.LAMBERT]: '💎'
}

export const MATERIAL_NAMES = {
  [MATERIALS.BASIC]: '基础材质',
  [MATERIALS.STANDARD]: '标准材质',
  [MATERIALS.PHONG]: 'Phong材质',
  [MATERIALS.LAMBERT]: 'Lambert材质'
}

// 默认颜色配置
export const DEFAULT_COLORS = {
  SELECTED: 0x00ff00,
  GRID: 0x444444,
  GRID_SECONDARY: 0x222222,
  AXES: 0xffffff,
  BACKGROUND: 0x1a1a1a
}

// 相机配置
export const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 1000,
  INITIAL_POSITION: [10, 10, 10],
  LOOK_AT: [0, 0, 0]
}

// 网格配置
export const GRID_CONFIG = {
  SIZE: 20,
  DIVISIONS: 20
}

// 坐标轴配置
export const AXES_CONFIG = {
  SIZE: 5
}

// 光源配置
export const LIGHT_CONFIG = {
  AMBIENT: {
    COLOR: 0x606060,
    INTENSITY: 0.8
  },
  DIRECTIONAL: {
    COLOR: 0xffffff,
    INTENSITY: 1.2,
    POSITION: [15, 15, 10]
  },
  POINT: {
    COLOR: 0xffffff,
    INTENSITY: 0.8,
    DISTANCE: 100,
    POSITION: [-10, 10, -10]
  },
  FILL: {
    COLOR: 0x4080ff,
    INTENSITY: 0.4,
    POSITION: [-15, 5, 15]
  }
}

// 鼠标操作配置
export const MOUSE_CONFIG = {
  MOVE_SPEED: 0.01,
  ROTATE_SPEED: 0.01,
  SCALE_SPEED: 0.01
}
