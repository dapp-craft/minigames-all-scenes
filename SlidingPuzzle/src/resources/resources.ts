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

//Game Zone Collider
export const gamezoneShape: PBGltfContainer = { src: modelsFolder + 'obj_gamezone.gltf' };

// Game shapes
export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' };

// Game level images
export const lvl3x3Image = imagesFolder + 'gameImages/image_3x3.png';
export const lvl4x4Image = imagesFolder + 'gameImages/image_4x4.png';
export const lvl5x5Image = imagesFolder + 'gameImages/image_5x5.png';
export const lvlAbstractPattern = imagesFolder + 'gameImages/abstract_pattern.png';
export const lvlDCLLogo = imagesFolder + 'gameImages/dcl_logo.png';

// Game sounds
export const slideSound = 'sounds/game/slide.mp3';