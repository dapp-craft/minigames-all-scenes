import { Animator, GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { draft, floor, frame, gameZone, grass, ground, terminal, wall } from '../resources/resources'
import { toadsGameState } from '../state'

const staticModels = [
    draft,
    floor,
    frame,
    grass,
    ground,
    wall,
    gameZone,
    terminal,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, model)
        if (model == wall) toadsGameState.listOfEntity.set('wall', enitity)
    })
}