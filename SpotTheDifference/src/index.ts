import { engine, Entity, executeTask, GltfContainer, GltfContainerLoadingState, InputAction, inputSystem, LoadingState, PointerEventType, Transform, VisibilityComponent } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import * as utils from '@dcl-sdk/utils'
import { initMiniGame } from '../../common/library'
import { TIME_LEVEL } from '@dcl-sdk/mini-games/src/ui'
import { LEVELS } from './game/levels'
import { GameObject } from './game/object'
import { generateLevelObjects, init } from './game'
import { VARIANT } from './game/types'
import { queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { movePlayerTo } from '~system/RestrictedActions'
import { Vector3 } from '@dcl/sdk/math'
import { setupWinAnimations, startWinAnimation } from './game/gameEfffects'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { ui } from './ui'

const root = engine.addEntity()
Transform.create(root, {position: {x: 8, y: 0, z: 8}})

let alt = false
let currentLevel = 1 as keyof typeof LEVELS

const handlers = {
    start: async () => {
        gameObjects = generateLevelObjects(LEVELS[currentLevel].difficulty, LEVELS[currentLevel].total)
        gameObjects.forEach(o => o.toggle(alt))
        const targets = new Set(gameObjects.filter(o => o.differs))
        for (let i = 0; i < LEVELS[currentLevel].goal; i++) {
            let t = await Promise.race(Array.from(targets).map(t => t.isMarked))
            targets.delete(t)
            console.log("found", t) 
        }
        console.log("win")
        let pos = await positions.then(data => Vector3.add(data.get('area_playSpawn')!.position, Transform.get(sceneParentEntity).position))
        movePlayerTo({newRelativePosition: pos, cameraTarget: Vector3.add(pos, Vector3.scale(Vector3.Backward(), 5))})
        handlers.exit()
        await new Promise<void>(r => startWinAnimation(r))
        if (LEVELS[currentLevel + 1 as keyof typeof LEVELS]) {
            currentLevel++
            handlers.start()
        }
        else queue.setNextPlayer()
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
let positions = readGltfLocators(`locators/obj_locators_default.gltf`)

initMiniGame('059739aa-376f-4bcd-adc5-4081d808bc9a', TIME_LEVEL, positions, handlers)
let gameObjects: GameObject[] = []

const STATIC_MODELS = {
    [VARIANT.BASE]: [
        'models/obj_exterior_base.gltf',
        'models/obj_floor_base.gltf',
        'models/obj_panel_base.gltf',
        'models/obj_gamezone.gltf'
    ],
    [VARIANT.ALT]: [
        'models/obj_exterior_alt.gltf',
        'models/obj_floor_alt.gltf',
        'models/obj_panel_alt.gltf'
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
    setupWinAnimations()
    ReactEcsRenderer.setUiRenderer(ui)
    
    engine.addSystem(() => {
        if (!queue.isActive()) return
        if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) executeTask(async () => {
            alt = !alt
            await Promise.all(gameObjects.map(o => o.toggle(alt)))
            staticModels[VARIANT.ALT].forEach(o => VisibilityComponent.getMutable(o).visible = alt)
            staticModels[VARIANT.BASE].forEach(o => VisibilityComponent.getMutable(o).visible = !alt)
        }); else if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_UP)) {
            handlers.restart()
        }
    })
}
