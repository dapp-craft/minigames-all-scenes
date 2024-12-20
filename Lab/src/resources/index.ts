import { ColliderLayer, PBGltfContainer } from '@dcl/sdk/ecs'

const modelsFolder = 'models/'
const imagesFolder = 'images/'
const soundsFolder = 'sounds/'

export const STATIC_MODELS = [
    { src: modelsFolder + 'obj_floor.gltf' },
    { src: modelsFolder + 'obj_frame.gltf' },
    { src: modelsFolder + 'obj_gamezone.gltf' },
    { src: modelsFolder + 'obj_glass.gltf' },
    { src: modelsFolder + 'obj_ground.gltf' },
    { src: modelsFolder + 'obj_terminal.gltf' },
    { src: modelsFolder + 'obj_text.gltf' },
    { src: modelsFolder + 'obj_wall.gltf' },
    { src: modelsFolder + 'obj_station.gltf' },
    { src: modelsFolder + 'obj_rules.gltf' }
]

export const FLASK_MODEL = { src: modelsFolder + 'obj_flask.gltf' }
export const PIPE_MODEL = { src: modelsFolder + 'obj_pipe.gltf' }

// SOUNDS
export const GAME_SOUNDS = {
    first: soundsFolder + 'choice_1.mp3',
    second: soundsFolder + 'choice_2.mp3',
    error: soundsFolder + 'error.mp3',
    pour: soundsFolder + 'pour.mp3',
    win: soundsFolder + 'win.mp3'
}
export const THEME_SOUND = soundsFolder + 'lab_ost.mp3'
