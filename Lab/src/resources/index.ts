import { ColliderLayer, PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'
const soundsFolder = 'sounds/'

export const STATIC_MODELS = [
  { src: modelsFolder + 'obj_floor.gltf' },
  { src: modelsFolder + 'obj_frame.gltf' },
  { src: modelsFolder + 'obj_gamezone.gltf' },
  { src: modelsFolder + 'obj_glass.gltf' },
  { src: modelsFolder + 'obj_ground.gltf' },
  { src: modelsFolder + 'obj_terminal.gltf' },
  { src: modelsFolder + 'obj_text.gltf' },
  { src: modelsFolder + 'obj_wall.gltf' },
  { src: modelsFolder + 'obj_station.gltf' },
]

export const FLASK_MODEL = { src: modelsFolder + 'obj_flask.gltf' }
