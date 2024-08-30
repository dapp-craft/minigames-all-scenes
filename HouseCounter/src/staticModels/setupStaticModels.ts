import { GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { floor, wall, ground, railings } from '../resources/resources'

const staticModels = [
    floor,
    wall,
    ground,
    railings,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
    })
}