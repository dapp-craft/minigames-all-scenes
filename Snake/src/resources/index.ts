import { ColliderLayer, PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'
const soundsFolder = 'sounds/'

export const STATIC_MODELS = [
  { src: modelsFolder + 'obj_floor.gltf' },
  { src: modelsFolder + 'obj_frame.gltf' },
  { src: modelsFolder + 'obj_gamezone.gltf' },
  { src: modelsFolder + 'obj_ground.gltf' },
  { src: modelsFolder + 'obj_railings.gltf' },
  { src: modelsFolder + 'obj_terminal.gltf' },
  { src: modelsFolder + 'obj_text.gltf' },
  { src: modelsFolder + 'obj_sofa.gltf' },
  { src: modelsFolder + 'obj_wall.gltf' },
  { src: modelsFolder + 'obj_rules.gltf' },
]

export const foodModel: PBGltfContainer = { src: modelsFolder + 'obj_snake02.gltf' }
export const snakeBodyModel: PBGltfContainer = { src: modelsFolder + 'obj_snake01.gltf' }
export const cellModel: PBGltfContainer = { src: modelsFolder + 'obj_grid01.gltf' }

// SOUNDS
export const gameOverSound = soundsFolder + 'Game_Over.mp3' 
export const hitSound = soundsFolder + 'hit.mp3' 
export const playSound = soundsFolder + 'play.mp3' 
export const powerUpSound = soundsFolder + 'powerup.mp3' 
export const mainThemeSound = soundsFolder + 'Snake_music.mp3' 

