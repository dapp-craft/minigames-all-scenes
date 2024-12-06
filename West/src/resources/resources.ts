import { PBGltfContainer } from "@dcl/sdk/ecs";

const modelsFolder = 'models/';

// Static models
export const barrel: PBGltfContainer = { src: modelsFolder + 'obj_barrel.gltf' };
export const fence: PBGltfContainer = { src: modelsFolder + 'obj_fence.gltf' };
export const floor: PBGltfContainer = { src: modelsFolder + 'obj_floor.gltf' };
export const ground: PBGltfContainer = { src: modelsFolder + 'obj_ground.gltf' };
export const terminal: PBGltfContainer = { src: modelsFolder + 'obj_terminal.gltf' };
export const text: PBGltfContainer = { src: modelsFolder + 'obj_text.gltf' };
export const wall: PBGltfContainer = { src: modelsFolder + 'obj_wall.gltf' };

//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game sounds
export const enterSound = 'sounds/Start_of_the_round.mp3';
export const exitSound = 'sounds/End_of_round.mp3';
export const missSound = 'sounds/Miss.mp3';
export const hitSound = 'sounds/Hit_the_target.mp3';
export const snakeSound = 'sounds/snake.mp3';

