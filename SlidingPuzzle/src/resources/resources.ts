import { PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'

// Static models
export const STATIC_MODELS: PBGltfContainer[] = [
  // { src: modelsFolder + 'obj_floor.gltf' },
  // { src: modelsFolder + 'obj_sign.gltf' },
  // { src: modelsFolder + 'obj_stairs.gltf' },
  // { src: modelsFolder + 'obj_pillars.gltf' },
  // { src: modelsFolder + 'obj_title.gltf' },
  // { src: modelsFolder + 'obj_frame.gltf' },
  // { src: modelsFolder + 'obj_text.gltf' },
  // { src: modelsFolder + 'obj_plants.gltf' },
  // { src: modelsFolder + 'obj_bench.gltf' },
  // { src: modelsFolder + 'obj_terminal.gltf' }
  // { src: modelsFolder + 'obj_gamezone.gltf' }
]

// Game shapes
export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' }

// Game level images
export const levelImages = {
  1: imagesFolder + 'gameImages/1.jpg',
  2: imagesFolder + 'gameImages/2.jpg',
  3: imagesFolder + 'gameImages/3.jpg',
  4: imagesFolder + 'gameImages/4.jpg',
  5: imagesFolder + 'gameImages/5.jpg',
  6: imagesFolder + 'gameImages/6.jpg',
  7: imagesFolder + 'gameImages/7.jpg',
  8: imagesFolder + 'gameImages/8.jpg',
  9: imagesFolder + 'gameImages/9.jpg'
}

export const lvl3x3Image = imagesFolder + 'gameImages/image_3x3.png'

// Game sounds
export const slideSound = 'sounds/game/slide.mp3'

// Theme sounds
export const mainTheme = 'sounds/main_theme.mp3'
