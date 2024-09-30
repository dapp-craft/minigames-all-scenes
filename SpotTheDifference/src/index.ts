import { EasingFunction, engine, EngineInfo, Entity, executeTask, GltfContainer, GltfContainerLoadingState, InputAction, inputSystem, LoadingState, Material, MeshCollider, MeshRenderer, PointerEvents, pointerEventsSystem, PointerEventType, Transform, Tween, TweenLoop, TweenSequence, VisibilityComponent } from '@dcl/sdk/ecs'
import { readGltfLocators } from '../../common/locators'
import * as utils from '@dcl-sdk/utils'
import { initMiniGame } from '../../common/library'
import { TIME_LEVEL } from '@dcl-sdk/mini-games/src/ui'
import { LEVELS } from './game/levels'
import { GameObject, resetCooldown } from './game/object'
import { generateLevelObjects, init } from './game'
import { VARIANT } from './game/types'
import { queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { movePlayerTo } from '~system/RestrictedActions'
import { Color3, Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { countdown, initCountdownNumbers, setupWinAnimations, startWinAnimation } from './game/gameEfffects'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { ui } from './ui'
import { Ui3D } from './game/ui3D'
import '../../common/cleaner'

let alt = false
let currentLevel = 1 as keyof typeof LEVELS
let interruptPlay: Function

async function playLevel(level: keyof typeof LEVELS) {
    console.log(`Starting level ${level}`)
    const abort = new Promise<never>((_, r) => interruptPlay = r)
    ui3d.setLevel(level)
    ui3d.setObjects(0, LEVELS[level].goal)
    ui3d.setTime(0)
    try {
        await Promise.race([new Promise<void>(r => countdown(r, 5)), abort])
        gameObjects = generateLevelObjects(LEVELS[level].difficulty, LEVELS[level].total)
        gameObjects.forEach(o => o.toggle(alt))
        const targets = new Set(gameObjects.filter(o => o.differs))
        let elapsed = 0
        engine.addSystem(dt => void ui3d.setTime(elapsed += dt), undefined, 'stopwatch')
        for (let i = 0; i < LEVELS[level].goal; i++) {
            let t = await Promise.race([...Array.from(targets).map(t => t.isMarked), abort])
            targets.delete(t)
            console.log("Found", t) 
            ui3d.setObjects(i+1, LEVELS[level].goal)
        }
        engine.removeSystem('stopwatch')
        console.log(`Win level ${level}`)
        let pos = await positions.then(data => Vector3.add(data.get('area_playSpawn')!.position, Transform.get(sceneParentEntity).position))
        movePlayerTo({newRelativePosition: pos, cameraTarget: Vector3.add(pos, Vector3.scale(Vector3.Backward(), 5))})
        await Promise.race([new Promise<void>(r => startWinAnimation(r)), abort])
    } finally {
        engine.removeSystem('stopwatch')
        ui3d.setObjects()
        ui3d.setLevel()
        ui3d.setTime()
        gameObjects.forEach(o => o.destroy())
        gameObjects = []
    }
}

const handlers = {
    start: async () => {
        console.log("Game START")
        resetCooldown()
        let next: Number | null
        do next = await playLevel(currentLevel)
            .then(() => currentLevel + 1 in LEVELS ? currentLevel++ : null)
            .catch(jump => jump ? currentLevel = jump : null )
        while (next)
        queue.setNextPlayer()
    },
    exit: () => {
        console.log("Game EXIT")
        interruptPlay()
        resetCooldown()
    },
    restart: () => {
        interruptPlay(currentLevel)
    },
    toggleMusic: () => {},
    toggleSfx: () => {}
}
let positions = readGltfLocators(`locators/obj_locators_default.gltf`)

initMiniGame('059739aa-376f-4bcd-adc5-4081d808bc9a', TIME_LEVEL, positions, handlers)
let gameObjects: GameObject[] = []
const ui3d = new Ui3D(level => interruptPlay(level))

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
            Transform.create(entity, {parent: sceneParentEntity})
            VisibilityComponent.create(entity, {visible: variant === VARIANT.BASE})
            staticModels[variant as keyof typeof staticModels].push(entity)
        }
    }

    initCountdownNumbers()
    setupWinAnimations()
    ReactEcsRenderer.setUiRenderer(ui)
    await init(sceneParentEntity)

    const locators = await readGltfLocators('locators/obj_locators_unique.gltf')
    const clock = engine.addEntity()
    const arrowMM = engine.addEntity()
    const arrowHH = engine.addEntity()
    GltfContainer.create(clock, { src: 'models/obj_clock_base.gltf' })
    Transform.create(clock, {...locators.get('obj_clock_base.001'), parent: sceneParentEntity})
    GltfContainer.create(arrowMM, { src: 'models/obj_arrow01_base.gltf' })
    Transform.create(arrowMM, {
        ...locators.get('obj_clock_base.001'), 
        rotation: Quaternion.fromEulerDegrees(0, 0, 20),
        parent: sceneParentEntity
    })
    GltfContainer.create(arrowHH, { src: 'models/obj_arrow02_base.gltf' })
    Transform.create(arrowHH, {
        ...locators.get('obj_clock_base.001'), 
        rotation: Quaternion.fromEulerDegrees(0, 0, 120),
        parent: sceneParentEntity
    })


    pointerEventsSystem.onPointerDown({
        entity: clock,
        opts: {
            button: InputAction.IA_PRIMARY,
            hoverText: "PRESS ME"
        }
    }, () => {
        const events = PointerEvents.get(clock).pointerEvents
        PointerEvents.getMutable(clock).pointerEvents = []
        let r = Transform.get(arrowHH).rotation
        Tween.createOrReplace(arrowHH, {
            mode: {
                $case: 'rotate',
                rotate: {
                    start: r,
                    end: Quaternion.multiply(r, Quaternion.fromEulerDegrees(0, 0, 180))
                }
            },
            duration: 1250,
            easingFunction: EasingFunction.EF_EASEQUAD
        })
        r = Transform.get(arrowMM).rotation
        Tween.createOrReplace(arrowMM, {
            mode: {
                $case: 'rotate',
                rotate: {start: r, end: r}
            },
            duration: 100,
            easingFunction: EasingFunction.EF_LINEAR
        })
        const cycles = 3
        TweenSequence.createOrReplace(arrowMM, {
            sequence: Array(cycles*2).fill(0).map((_,i) => ({
                mode: {
                    $case: 'rotate',
                    rotate: {
                        start: r ,
                        end: r = Quaternion.multiply(r, Quaternion.fromEulerDegrees(0, 0, 180))
                    }
                },
                duration: 1250/cycles/3,
                easingFunction: {0: EasingFunction.EF_EASEINQUAD, [cycles*2-1]: EasingFunction.EF_EASEOUTQUAD}[i] ?? EasingFunction.EF_LINEAR
            }))
        })
        utils.timers.setTimeout(async () => {
            utils.timers.setTimeout(() => {
                Tween.deleteFrom(arrowHH)
                Tween.deleteFrom(arrowMM)
                PointerEvents.getMutable(clock).pointerEvents = Array.from(events)
            }, 500)
            alt = !alt
            await Promise.all(gameObjects.map(o => o.toggle(alt)))
            staticModels[VARIANT.ALT].forEach(o => VisibilityComponent.getMutable(o).visible = alt)
            staticModels[VARIANT.BASE].forEach(o => VisibilityComponent.getMutable(o).visible = !alt)
        }, 1250);
    })
    
    engine.addSystem(() => {
        if (!queue.isActive()) return
        if (inputSystem.isTriggered(InputAction.IA_PRIMARY, PointerEventType.PET_DOWN)) executeTask(async () => {
            // alt = !alt
            // await Promise.all(gameObjects.map(o => o.toggle(alt)))
            // staticModels[VARIANT.ALT].forEach(o => VisibilityComponent.getMutable(o).visible = alt)
            // staticModels[VARIANT.BASE].forEach(o => VisibilityComponent.getMutable(o).visible = !alt)
        }); else if (inputSystem.isTriggered(InputAction.IA_SECONDARY, PointerEventType.PET_UP)) {
            handlers.restart()
        }
    })
}
