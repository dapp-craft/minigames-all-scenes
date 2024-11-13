import { PBGltfContainer } from "@dcl/sdk/ecs";

const modelsFolder = 'models/';

// Static models
export const display: PBGltfContainer = { src: modelsFolder + 'scene_spot_the_difference.gltf' };
export const image1: PBGltfContainer = { src: modelsFolder + 'image1.gltf' };
export const test: PBGltfContainer = { src: modelsFolder + 'image1.gltf' };

export const floor: PBGltfContainer = { src: modelsFolder + 'obj_floor_base.gltf' };
export const bench: PBGltfContainer = { src: modelsFolder + 'obj_bench_base.gltf' };
export const chest02: PBGltfContainer = { src: modelsFolder + 'obj_chest02_base.gltf' };
export const dresser01: PBGltfContainer = { src: modelsFolder + 'obj_dresser01_base.gltf' };
export const drums01: PBGltfContainer = { src: modelsFolder + 'obj_drums01_base.gltf' };
export const fence: PBGltfContainer = { src: modelsFolder + 'obj_fence_base.gltf' };
export const frame: PBGltfContainer = { src: modelsFolder + 'obj_frame_base.gltf' };
export const grass: PBGltfContainer = { src: modelsFolder + 'obj_grass_base.gltf' };
export const hydrants: PBGltfContainer = { src: modelsFolder + 'obj_hydrants_base.gltf' };
export const lamp01: PBGltfContainer = { src: modelsFolder + 'obj_lamp01_base.gltf' };
export const pipes: PBGltfContainer = { src: modelsFolder + 'obj_pipes_base.gltf' };
export const smoker01: PBGltfContainer = { src: modelsFolder + 'obj_smoker01_base.gltf' };
export const table01: PBGltfContainer = { src: modelsFolder + 'obj_table01_base.gltf' };
export const table02: PBGltfContainer = { src: modelsFolder + 'obj_table02_base.gltf' };
export const terminal: PBGltfContainer = { src: modelsFolder + 'obj_terminal_base.gltf' };
export const text: PBGltfContainer = { src: modelsFolder + 'obj_text_base.gltf' };
export const tree01: PBGltfContainer = { src: modelsFolder + 'obj_tree01_base.gltf' };
export const tree02: PBGltfContainer = { src: modelsFolder + 'obj_tree02_base.gltf' };
export const tree03: PBGltfContainer = { src: modelsFolder + 'obj_tree03_base.gltf' };
export const wall: PBGltfContainer = { src: modelsFolder + 'obj_wall_base.gltf' };
export const wheels01: PBGltfContainer = { src: modelsFolder + 'obj_wheels01_base.gltf' };
export const rules: PBGltfContainer = { src: modelsFolder + 'obj_rules.gltf' };
export const gamezone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game sounds
export const correct = 'sounds/difference-found.mp3';
export const incorrect = 'sounds/error.mp3';

