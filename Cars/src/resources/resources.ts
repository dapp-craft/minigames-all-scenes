import { PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'

export const STATIC_MODELS = [
  { src: modelsFolder + 'obj_text.gltf' },
  { src: modelsFolder + 'obj_bench.gltf' },
  { src: modelsFolder + 'obj_candies.gltf' },
  { src: modelsFolder + 'obj_cars.gltf' },
  { src: modelsFolder + 'obj_dresser.gltf' },
  { src: modelsFolder + 'obj_floor.gltf' },
  { src: modelsFolder + 'obj_frame.gltf' },
  { src: modelsFolder + 'obj_grid.gltf' },
  { src: modelsFolder + 'obj_ground.gltf' },
  { src: modelsFolder + 'obj_lamp.gltf' },
  { src: modelsFolder + 'obj_terminal.gltf' },
  { src: modelsFolder + 'obj_trash.gltf' },
  { src: modelsFolder + 'obj_wall.gltf' },
  { src: modelsFolder + 'obj_gamezone.gltf' }
]

export const boardTexture = imagesFolder + 'grid_6x6.png'

export const mainCarModel = { src: modelsFolder + 'obj_car03.gltf' }
export const carModels = {
  2: { src: modelsFolder + 'obj_car02.gltf' },
  3: { src: modelsFolder + 'obj_car01.gltf' }
}

export const moveCarSound = 'sounds/move_car.mp3'
