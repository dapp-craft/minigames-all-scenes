import { Animator, ColliderLayer, GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { floor, wall, ground, railings, gameZone, kitty, bus, rocket, panel, terminal, clouds, frame, text, bench, rules } from '../resources/resources'
import { readGltfLocators } from '../../../common/locators'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { entityList, gameState } from '../state'

const staticModels = [
    floor,
    wall,
    ground,
    railings,
    gameZone,
    panel,
    terminal,
    clouds,
    frame,
    text,
    rules,
    bench,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
        if (model == panel) GltfContainer.getMutable(enitity).invisibleMeshesCollisionMask = ColliderLayer.CL_PHYSICS
    })
}

export const setupStaticModelsFromGltf = async () => {
    const rocketData = await readGltfLocators(`locators/obj_rocket.gltf`)
    const busData = await readGltfLocators(`locators/obj_bus.gltf`)

    const rocketEntity = gameState.syncModels[0]
    const leftBusEntity = gameState.syncModels[1]
    const rightBusEntity = gameState.syncModels[2]

    Transform.createOrReplace(rocketEntity, rocketData.get('obj_rocket.001'))
    Transform.getMutable(rocketEntity).parent = sceneParentEntity
    GltfContainer.createOrReplace(rocketEntity, rocket)
    Animator.createOrReplace(rocketEntity, {
        states: [
            {
                clip: 'idle1',
                playing: true,
                loop: true,
            },
            {
                clip: 'idle2',
                playing: true,
                loop: true,
            },
            {
                clip: 'stand',
                playing: true,
                loop: true,
            },
        ],
    })
    Animator.playSingleAnimation(rocketEntity, 'stand')
    entityList.set('rocket', rocketEntity)

    Transform.createOrReplace(leftBusEntity, busData.get('obj_bus.001'))
    Transform.getMutable(leftBusEntity).parent = sceneParentEntity
    GltfContainer.createOrReplace(leftBusEntity, bus)
    Animator.createOrReplace(leftBusEntity, {
        states: [
            {
                clip: 'idle1',
                playing: true,
                loop: true,
            },
            {
                clip: 'stand',
                playing: true,
                loop: true,
            },
        ],
    })
    Animator.playSingleAnimation(leftBusEntity, 'stand')
    entityList.set('leftBusEntity', leftBusEntity)

    Transform.createOrReplace(rightBusEntity, busData.get('obj_bus.002'))
    Transform.getMutable(rightBusEntity).parent = sceneParentEntity
    GltfContainer.createOrReplace(rightBusEntity, bus)
    Animator.createOrReplace(rightBusEntity, {
        states: [
            {
                clip: 'idle1',
                playing: true,
                loop: true,
            },
            {
                clip: 'stand',
                playing: true,
                loop: true,
            },
        ],
    })
    Animator.playSingleAnimation(rightBusEntity, 'stand')
    entityList.set('rightBusEntity', rightBusEntity)
}