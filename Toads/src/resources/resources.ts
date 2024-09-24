import { PBGltfContainer } from "@dcl/sdk/ecs";

const modelsFolder = 'models/';
const imagesFolder = 'images/';

// Static models
export const draft: PBGltfContainer = { src: modelsFolder + 'obj_draft.gltf' };

export const floor: PBGltfContainer = { src: modelsFolder + 'obj_floor.gltf' };
export const frame: PBGltfContainer = { src: modelsFolder + 'obj_frame.gltf' };
export const grass: PBGltfContainer = { src: modelsFolder + 'obj_grass.gltf' };
export const ground: PBGltfContainer = { src: modelsFolder + 'obj_ground.gltf' };
export const wall: PBGltfContainer = { src: modelsFolder + 'obj_wall.gltf' };
export const whack: PBGltfContainer = { src: modelsFolder + 'obj_whack.gltf' };
export const terminal: PBGltfContainer = { src: modelsFolder + 'obj_terminal.gltf' };


export const frog01: PBGltfContainer = { src: modelsFolder + 'obj_frog01.gltf' };
export const frog02: PBGltfContainer = { src: modelsFolder + 'obj_frog02.gltf' };
export const hammer: PBGltfContainer = { src: modelsFolder + 'obj_hammer.gltf' };



//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };
