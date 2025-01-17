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
export const curtains: PBGltfContainer = { src: modelsFolder + 'obj_curtains.gltf' };
export const heart: PBGltfContainer = { src: modelsFolder + 'obj_heart.gltf' };

//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game sounds
export const hitCiv = 'sounds/West_Civil_Hit.mp3';
export const hitEnemy = 'sounds/West_Enemy_hit.mp3';
export const hitPLayer = 'sounds/West_Get_hit.mp3';
export const startRound = 'sounds/West_Start_round.mp3';
export const finishRound = 'sounds/West_End_round.mp3';
export const misfire = 'sounds/West_Misfire.mp3';


