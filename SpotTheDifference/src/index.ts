import { engine, Entity, GltfContainer, GltfContainerLoadingState, InputAction, inputSystem, LoadingState, PointerEventType, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import * as utils from '@dcl-sdk/utils'
import { initMiniGame } from '../../common/library'
import { TIME_LEVEL } from '@dcl-sdk/mini-games/src/ui'
import { LEVELS } from './game/levels'
import { GameObject } from './game/object'
import { generateLevelObjects, init } from './game'
import { VARIANT } from './game/types'

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

const STATIC_MODELS = {
    [VARIANT.BASE]: [
        'models/obj_exterior_base.gltf',
        'models/obj_floor_base.gltf'
    ],
    [VARIANT.ALT]: [
        'models/obj_exterior_alt.gltf',
        'models/obj_floor_alt.gltf'
    ]
}

export async function main() {
    const staticModels = {
        [VARIANT.BASE]: [] as Entity[],
        [VARIANT.ALT]: [] as Entity[]
    }
    for (const [variant, models] of Object.entries(STATIC_MODELS)) {
        for (const model of models) {
            const entity = engine.addEntity()
            GltfContainer.create(entity, {src: model})
            Transform.create(entity, {parent: root})
            VisibilityComponent.create(entity, {visible: variant === VARIANT.BASE})
            staticModels[variant as keyof typeof staticModels].push(entity)
        }
    }

    await init(root)
    
    engine.addSystem(() => {
        if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) {
            // objects.forEach((o, i) => utils.timers.setTimeout(() => o.toggle(), Math.random() * 1000))
            alt = !alt
            gameObjects.forEach(o => o.toggle(alt))
            staticModels[VARIANT.ALT].forEach(o => VisibilityComponent.getMutable(o).visible = alt)
            staticModels[VARIANT.BASE].forEach(o => VisibilityComponent.getMutable(o).visible = !alt)
        } else if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_UP)) {
            handlers.restart()
        }
    })
}
