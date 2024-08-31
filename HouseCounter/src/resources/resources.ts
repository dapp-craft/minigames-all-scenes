import { PBGltfContainer } from "@dcl/sdk/ecs";

const modelsFolder = 'models/';
const imagesFolder = 'images/';

// Static models
export const floor: PBGltfContainer = { src: modelsFolder + 'obj_floor.gltf' };
export const wall: PBGltfContainer = { src: modelsFolder + 'obj_wall.gltf' };
export const ground: PBGltfContainer = { src: modelsFolder + 'obj_ground.gltf' };
export const railings: PBGltfContainer = { src: modelsFolder + 'obj_railings.gltf' };
export const kitty: PBGltfContainer = { src: modelsFolder + 'npc_kitty.gltf' };

//Game Zone Collider
export const gameZone: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game shapes
export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' };

// Game sounds
export const slideSound = 'sounds/game/slide.mp3';

// Theme sounds
export const mainTheme = 'sounds/main_theme.mp3';