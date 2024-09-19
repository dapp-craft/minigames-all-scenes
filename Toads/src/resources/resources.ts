import { PBGltfContainer } from "@dcl/sdk/ecs";

const modelsFolder = 'models/';
const imagesFolder = 'images/';

// Static models
export const draft: PBGltfContainer = { src: modelsFolder + 'obj_draft.gltf' };
export const frog01: PBGltfContainer = { src: modelsFolder + 'obj_frog01.gltf' };
export const frog02: PBGltfContainer = { src: modelsFolder + 'obj_frog02.gltf' };


//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };
