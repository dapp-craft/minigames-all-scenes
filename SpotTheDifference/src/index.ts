import { engine, Entity, GltfContainer, InputAction, inputSystem, PointerEventType, Transform } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import * as utils from '@dcl-sdk/utils'
import { initMiniGame } from '../../common/library'
import { TIME_LEVEL } from '@dcl-sdk/mini-games/src/ui'
import { LEVELS } from './game/levels'
import { GameObject } from './game/object'
import { generateLevelObjects, init } from './game'

const root = engine.addEntity()
Transform.create(root, {position: {x: 8, y: 0, z: 8}})

let alt = false

const handlers = {
    start: () => {
        gameObjects = generateLevelObjects(LEVELS[1].difficulty, LEVELS[1].total)
        gameObjects.forEach(o => o.toggle(alt))
    },
    exit: () => {
        gameObjects.forEach(o => o.destroy())
        gameObjects = []
    },
    restart: () => {
        handlers.exit()
        handlers.start()
    },
    toggleMusic: () => {},
    toggleSfx: () => {}
}

initMiniGame('059739aa-376f-4bcd-adc5-4081d808bc9a', TIME_LEVEL, readGltfLocators(`locators/obj_locators.gltf`), handlers)
let gameObjects: GameObject[] = []

const STATIC_MODELS = [
    'models/obj_exterior_base.gltf',
    'models/obj_floor_base.gltf'
]


export async function main() {
    const staticModels: Entity[] = []
    for (const model of STATIC_MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, {src: model})
        Transform.create(entity, {parent: root})
        staticModels.push(entity)
    }

    await init(root)
    
    engine.addSystem(() => {
        if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
            // objects.forEach((o, i) => utils.timers.setTimeout(() => o.toggle(), Math.random() * 1000))
            alt = !alt
            gameObjects.forEach(o => o.toggle(alt))
            staticModels.forEach(o => GltfContainer.getMutable(o).src = alt ? GltfContainer.get(o).src.replace('base', 'alt') : GltfContainer.get(o).src.replace('alt', 'base'))
        } else if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_UP)) {
            handlers.restart()
        }
    })
}
