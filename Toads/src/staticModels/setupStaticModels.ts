import { ColliderLayer, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { fence, floor, frame, gameZone, gifts, ground, rules, snow, snowflake, snowman, terminal, text, wall, whack } from '../resources/resources'
import { toadsGameState } from '../state'

const staticModels = [
    fence,
    floor,
    frame,
    gifts,
    ground,
    rules,
    snow,
    snowflake,
    snowman,
    terminal,
    text,
    wall,
    whack,
    gameZone,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, {...model})
        if (model == whack) {
            toadsGameState.listOfEntity.set('ground', enitity)
            GltfContainer.getMutable(enitity).visibleMeshesCollisionMask = ColliderLayer.CL_CUSTOM5
        }
    })
}