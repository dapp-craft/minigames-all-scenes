import { PBGltfContainer } from "@dcl/sdk/ecs";


const modelFolder = 'models/';

export let floorShape: PBGltfContainer = { src: modelFolder + 'obj_floor.gltf' };
export let signShape: PBGltfContainer = { src: modelFolder + 'obj_sign.gltf' };
export let stairsShape: PBGltfContainer = { src: modelFolder + 'obj_stairs.gltf' };
