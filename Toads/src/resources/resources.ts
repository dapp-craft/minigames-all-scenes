import { PBGltfContainer } from "@dcl/sdk/ecs";

const modelsFolder = 'models/';

// Static models
export const draft: PBGltfContainer = { src: modelsFolder + 'obj_draft.gltf' };

export const floor: PBGltfContainer = { src: modelsFolder + 'obj_floor.gltf' };
export const frame: PBGltfContainer = { src: modelsFolder + 'obj_frame.gltf' };
export const grass: PBGltfContainer = { src: modelsFolder + 'obj_grass.gltf' };
export const ground: PBGltfContainer = { src: modelsFolder + 'obj_ground.gltf' };
export const wall: PBGltfContainer = { src: modelsFolder + 'obj_wall.gltf' };
export const whack: PBGltfContainer = { src: modelsFolder + 'obj_whack.gltf' };
export const terminal: PBGltfContainer = { src: modelsFolder + 'obj_terminal.gltf' };
export const rules: PBGltfContainer = { src: modelsFolder + 'obj_rules.gltf' };
export const logo: PBGltfContainer = { src: modelsFolder + 'obj_logo.gltf' };
export const text: PBGltfContainer = { src: modelsFolder + 'obj_text.gltf' };

export const frog01: PBGltfContainer = { src: modelsFolder + 'obj_frog01.gltf' };
export const frog02: PBGltfContainer = { src: modelsFolder + 'obj_frog02.gltf' };
export const frog03: PBGltfContainer = { src: modelsFolder + 'obj_frog03.gltf' };
export const frog04: PBGltfContainer = { src: modelsFolder + 'obj_frog04.gltf' };
export const snake: PBGltfContainer = { src: modelsFolder + 'obj_snake01.gltf' };
export const hammer: PBGltfContainer = { src: modelsFolder + 'obj_hammer.gltf' };

//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game sounds
export const enterSound = 'sounds/Start_of_the_round.mp3';
export const exitSound = 'sounds/End_of_round.mp3';
export const missSound = 'sounds/Miss.mp3';
export const hitSound = 'sounds/Hit_the_target.mp3';
export const snakeSound = 'sounds/snake.mp3';

