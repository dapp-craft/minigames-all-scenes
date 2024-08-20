import { GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { floorShape, signShape, stairsShape } from '../resources/resources'

const staticModels = [
    floorShape,
    signShape,
    stairsShape,
]

export const setupStaticModels = () => {
    console.log('Setting up static models')
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        // TODO move scene center to a global variable
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
    })
}