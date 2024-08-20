import { PBGltfContainer } from "@dcl/sdk/ecs";


const modelsFolder = 'models/';
const imagesFolder = 'images/';


// Static models
export const floorShape: PBGltfContainer = { src: modelsFolder + 'obj_floor.gltf' };
export const signShape: PBGltfContainer = { src: modelsFolder + 'obj_sign.gltf' };
export const stairsShape: PBGltfContainer = { src: modelsFolder + 'obj_stairs.gltf' };


// Game shapes
export const tileShape: PBGltfContainer = { src: modelsFolder + 'obj_tile.gltf' };

// Game level images
export const lvl1Image = imagesFolder + 'gameImages/lvl1/image.png';