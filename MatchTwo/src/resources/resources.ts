import { PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'


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
  { src: modelsFolder + 'obj_toy16.gltf' },
]

export const tileDoorShape: PBGltfContainer = { src: modelsFolder + 'obj_door.gltf' }
export const defaulToyModel: PBGltfContainer = { src: modelsFolder + 'obj_toy01.gltf' }