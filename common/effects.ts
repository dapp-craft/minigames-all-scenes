import { ui, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Animator, Billboard, GltfContainer, Transform, VisibilityComponent, engine, Entity } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import { timers } from '@dcl-sdk/utils'

const winEntities: Entity[] = []
let gameoverEntities: Entity[] = []
let countdown: ui.Timer3D

export function setupEffects(position: Vector3) {
    let entity: Entity
    for (let angle of [135, 90, 45]) {
        winEntities.push((entity = engine.addEntity()))
        GltfContainer.create(entity, { src: 'mini-game-assets/models/winAnim.glb' })
        Transform.create(entity, {
            parent: sceneParentEntity,
            position: { ...position, y: 0.75 },
            scale: Vector3.One(),
            rotation: Quaternion.fromEulerDegrees(0, angle, 0)
        })
        Animator.create(entity, {
            states: [{ clip: 'armature_psAction', playing: false, loop: false, shouldReset: true }]
        })
    }

    winEntities.push((entity = engine.addEntity()))
    GltfContainer.create(entity, {
        src: 'mini-game-assets/models/winAnimFollow.glb'
    })
    Transform.create(entity, {
        parent: sceneParentEntity,
        position,
        scale: Vector3.create(0.3, 0.3, 0.3)
    })
    Billboard.create(entity, {})
    Animator.create(entity, {
        states: [{ clip: 'RaysAnim', playing: false, loop: false, shouldReset: true }]
    })

    winEntities.push((entity = engine.addEntity()))
    GltfContainer.create(entity, {
        src: 'mini-game-assets/models/winAnimText.glb'
    })
    Transform.create(entity, {
        parent: sceneParentEntity,
        position,
        scale: Vector3.create(0.8, 0.8, 0.8)
    })
    Billboard.create(entity, {})
    Animator.create(entity, {
        states: [{ clip: 'Animation', playing: false, loop: false, shouldReset: true }]
    })

    gameoverEntities.push(entity = engine.addEntity())
    GltfContainer.create(entity, {
        src: 'mini-game-assets/models/gameOverAnimText.glb'
    }) 
    Transform.create(entity, {
        parent: sceneParentEntity,
        position,
        scale: Vector3.create(0.8, 0.8, 0.8)
    })
    Billboard.create(entity, {})
    Animator.create(entity, {
        states: [{ clip: 'Animation', playing: false, loop: false, shouldReset: true }]
    })

    for (let entity of [...winEntities, ...gameoverEntities]) {
        VisibilityComponent.create(entity, { visible: false })
        syncEntity(entity, [VisibilityComponent.componentId, Animator.componentId])
    }

    countdown = new ui.Timer3D({ parent: sceneParentEntity, position }, 1, 1, false, 10)
    countdown.hide()
}

function toggleEntities(state: boolean, entries: Iterable<Entity>) {
    for (const entity of entries) {
        VisibilityComponent.getMutable(entity).visible = state
        Animator.getMutable(entity).states[0].playing = state
    }
}

let winResolve: Function, winReject: Function
export async function runWinAnimation(duration: number = 3000) {
    winReject?.()
    let animFinished = new Promise<void>((...cbs) => [winResolve, winReject] = cbs)
    toggleEntities(true, winEntities)
    await Promise.race([new Promise<void>(r => timers.setTimeout(r, duration)), animFinished])
        .then(() => toggleEntities(false, winEntities))
        .catch(() => {})
}
export function cancelWinAnimation() {
    winReject?.()
    toggleEntities(false, winEntities)
}

let gameoverResolve: Function, gameoverReject: Function
export async function runGameoverAnimation(duration: number = 3000) {
    gameoverReject?.()
    let animFinished = new Promise<void>((...cbs) => [gameoverResolve, gameoverReject] = cbs)
    toggleEntities(true, gameoverEntities)
    await Promise.race([new Promise<void>(r => timers.setTimeout(r, duration)), animFinished])
        .then(() => toggleEntities(false, gameoverEntities))
        .catch(() => {})
}
export function cancelGamoverAnimation() {
    gameoverReject?.()
    toggleEntities(false, gameoverEntities)
}

let countownResolve: Function, countownReject: Function
export async function runCountdown(value: number = 3) {
    countownReject?.()
    let animFinished = new Promise<void>((...cbs) => [countownResolve, countownReject] = cbs)
    countdown.show()
    await new Array(value)
        .fill(null)
        .reduce(async prev => {
            await prev
            countdown.setTimeAnimated(value--)
            return Promise.race([new Promise<void>(r => timers.setTimeout(r, 1000)), animFinished])
        }, Promise.resolve())
        .then(countdown.hide.bind(countdown))
        .catch(() => {})
}
export function cancelCountdown() {
    countownReject?.()
    countdown.hide()
}
