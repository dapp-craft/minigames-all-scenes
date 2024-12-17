import { ColliderLayer, PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'
const soundsFolder = 'sounds/'

export const STATIC_MODELS = [
  { src: modelsFolder + 'obj_rules.gltf' },
  { src: modelsFolder + 'obj_text.gltf' },
  { src: modelsFolder + 'obj_bench.gltf' },
  { src: modelsFolder + 'obj_candies.gltf' },
  { src: modelsFolder + 'obj_cars.gltf' },
  { src: modelsFolder + 'obj_dresser.gltf' },
  { src: modelsFolder + 'obj_floor.gltf' },
  { src: modelsFolder + 'obj_frame.gltf' },
  { src: modelsFolder + 'obj_grid.gltf', invisibleMeshesCollisionMask: ColliderLayer.CL_NONE },
  { src: modelsFolder + 'obj_ground.gltf' },
  { src: modelsFolder + 'obj_lamp.gltf' },
  { src: modelsFolder + 'obj_terminal.gltf' },
  { src: modelsFolder + 'obj_trash.gltf' },
  { src: modelsFolder + 'obj_wall.gltf', invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS },
  { src: modelsFolder + 'obj_gamezone.gltf' },
  { src: modelsFolder + 'obj_flags.gltf' },
]

export const arrowActiveModel: PBGltfContainer = { src: modelsFolder + 'obj_arrow01.gltf', visibleMeshesCollisionMask: ColliderLayer.CL_POINTER }
export const arrowInactiveModel: PBGltfContainer = { src: modelsFolder + 'obj_arrow02.gltf', visibleMeshesCollisionMask: ColliderLayer.CL_POINTER }

export const boardTexture = imagesFolder + 'grid_6x6.png'

export const mainCarModel = { src: modelsFolder + 'obj_car03.gltf' }
export const carModels = {
  2: { src: modelsFolder + 'obj_car02.gltf' },
  3: { src: modelsFolder + 'obj_car01.gltf' }
}

export const moveCarSound = soundsFolder + 'move_car.mp3'
export const startLevelSound = soundsFolder + 'start_level.mp3'
export const winSound = soundsFolder + 'win_level.mp3'

export const mainTheme = soundsFolder + 'main_theme.mp3'
