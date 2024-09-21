import { PBGltfContainer } from "@dcl/sdk/ecs";


const modelsFolder = 'models/';
const imagesFolder = 'images/';


export const STATIC_MODELS = [
    {src: modelsFolder + 'obj_draft.gltf'},
    // {src: modelsFolder + 'obj_gamezone.gltf'},
]

export const boardTexture = imagesFolder + 'grid_6x6.png';

export const mainCarModel = {src: modelsFolder + 'obj_car03.gltf'};
export const carModels = {
    2: {src: modelsFolder + 'obj_car02.gltf'},
    3: {src: modelsFolder + 'obj_car01.gltf'},
}
