import { Animator, GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { floor, wall, ground, railings, gameZone, kitty, bus, rocket, panel, terminal, clouds, frame, text, bench } from '../resources/resources'
import { readGltfLocators } from '../../../common/locators'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { entityList } from '../state'

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
    bench,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
    })
}

export const setupStaticModelsFromGltf = async () => {
    const rocketData = await readGltfLocators(`locators/obj_rocket.gltf`)
    const busData = await readGltfLocators(`locators/obj_bus.gltf`)

    const rocketEntity = engine.addEntity()
    const leftBusEntity = engine.addEntity()
    const rightBusEntity = engine.addEntity()

    Transform.create(rocketEntity, rocketData.get('obj_rocket.001'))
    Transform.getMutable(rocketEntity).parent = sceneParentEntity
    GltfContainer.create(rocketEntity, rocket)
    Animator.create(rocketEntity, {
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

    Transform.create(leftBusEntity, busData.get('obj_bus.001'))
    Transform.getMutable(leftBusEntity).parent = sceneParentEntity
    GltfContainer.create(leftBusEntity, bus)
    Animator.create(leftBusEntity, {
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

    Transform.create(rightBusEntity, busData.get('obj_bus.002'))
    Transform.getMutable(rightBusEntity).parent = sceneParentEntity
    GltfContainer.create(rightBusEntity, bus)
    Animator.create(rightBusEntity, {
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