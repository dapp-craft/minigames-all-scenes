import { ColliderLayer, PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'

export const staticModels: PBGltfContainer[] = [
  { src: modelsFolder + 'obj_bench.gltf' },
  { src: modelsFolder + 'obj_door.gltf' },
  { src: modelsFolder + 'obj_fence.gltf' },
  { src: modelsFolder + 'obj_floor.gltf' },
  { src: modelsFolder + 'obj_frame.gltf' },
  { src: modelsFolder + 'obj_gamezone.gltf' },
  { src: modelsFolder + 'obj_gift.gltf' },
  { src: modelsFolder + 'obj_ground.gltf' },
  { src: modelsFolder + 'obj_logo.gltf' },
  { src: modelsFolder + 'obj_rules.gltf' },
  { src: modelsFolder + 'obj_snowman.gltf' },
  { src: modelsFolder + 'obj_terminal.gltf' },
  { src: modelsFolder + 'obj_text.gltf' },
  { src: modelsFolder + 'obj_wall.gltf', invisibleMeshesCollisionMask: ColliderLayer.CL_PHYSICS },
  { src: modelsFolder + 'obj_tree.gltf' }
]

export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' }

export const toysModels: PBGltfContainer[] = [
  { src: modelsFolder + 'obj_toy01.gltf' },
  { src: modelsFolder + 'obj_toy02.gltf' },
  { src: modelsFolder + 'obj_toy03.gltf' },
  { src: modelsFolder + 'obj_toy04.gltf' },
  { src: modelsFolder + 'obj_toy05.gltf' },
  { src: modelsFolder + 'obj_toy06.gltf' },
  { src: modelsFolder + 'obj_toy07.gltf' },
  { src: modelsFolder + 'obj_toy08.gltf' },
  { src: modelsFolder + 'obj_toy09.gltf' },
  { src: modelsFolder + 'obj_toy10.gltf' },
  { src: modelsFolder + 'obj_toy11.gltf' },
  { src: modelsFolder + 'obj_toy12.gltf' },
  { src: modelsFolder + 'obj_toy13.gltf' },
  { src: modelsFolder + 'obj_toy14.gltf' },
  { src: modelsFolder + 'obj_toy15.gltf' },
  { src: modelsFolder + 'obj_toy16.gltf' }
]

export const tileDoorShape: PBGltfContainer = { src: modelsFolder + 'obj_door.gltf' }
export const defaulToyModel: PBGltfContainer = { src: modelsFolder + '' }

export const openTileSound1 = 'sounds/open_1.mp3'
export const openTileSound2 = 'sounds/open_2.mp3'
export const closeTileSound1 = 'sounds/close_1.mp3'
export const closeTileSound2 = 'sounds/close_2.mp3'
export const levelCompleteSound = 'sounds/level_up.mp3'
export const pairFoundSound = 'sounds/pair_found.mp3'
export const mainThemeSound = 'sounds/Carousel_of_Dreams.mp3'
