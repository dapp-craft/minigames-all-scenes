import { PBGltfContainer } from "@dcl/sdk/ecs";


const modelsFolder = 'models/';
const imagesFolder = 'images/';


// Static models
export const floorShape: PBGltfContainer = { src: modelsFolder + 'obj_floor.gltf' };
export const signShape: PBGltfContainer = { src: modelsFolder + 'obj_sign.gltf' };
export const stairsShape: PBGltfContainer = { src: modelsFolder + 'obj_stairs.gltf' };
export const pillarsShape: PBGltfContainer = { src: modelsFolder + 'obj_pillars.gltf' };
export const titleShape: PBGltfContainer = { src: modelsFolder + 'obj_title.gltf' };
export const frameShape: PBGltfContainer = { src: modelsFolder + 'obj_frame.gltf' };
export const textShape: PBGltfContainer = { src: modelsFolder + 'obj_text.gltf' };
export const plantsShape: PBGltfContainer = { src: modelsFolder + 'obj_plants.gltf' };
export const benchShape: PBGltfContainer = { src: modelsFolder + 'obj_bench.gltf' };
export const terminalShape: PBGltfContainer = { src: modelsFolder + 'obj_terminal.gltf' };

//Game Zone Collider
export const gamezoneShape: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game shapes
export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' };

// Game level images
export const level1Image = imagesFolder + 'gameImages/imageLevel1.jpg';
export const level2Image = imagesFolder + 'gameImages/imageLevel2.jpg';
export const level3Image = imagesFolder + 'gameImages/imageLevel3.jpg';

export const lvl3x3Image = imagesFolder + 'gameImages/image_3x3.png';

// Game sounds
export const slideSound = 'sounds/game/slide.mp3';


// Theme sounds
export const mainTheme = 'sounds/main_theme.mp3';