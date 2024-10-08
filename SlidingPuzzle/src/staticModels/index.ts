import { GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { floorShape, signShape, stairsShape, pillarsShape, gamezoneShape, titleShape, frameShape, textShape, plantsShape, benchShape, terminalShape, } from '../resources/resources'

const staticModels = [
    floorShape,
    signShape,
    stairsShape,
    pillarsShape,
    gamezoneShape,
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
        // TODO move scene center to a global variable
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
    })
}