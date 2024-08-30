import { GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { floorShape, pillarsShape, titleShape, frameShape, textShape, plantsShape, benchShape, terminalShape, gameZone, wall, ground } from '../resources/resources'

const staticModels = [
    floorShape,
    gameZone,
    wall,
    ground,
    pillarsShape,
    titleShape,
    frameShape,
    textShape,
    plantsShape,
    benchShape, 
    terminalShape,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
    })
}