import { Animator, ColliderLayer, GltfContainer, MeshCollider, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { draft, floor, frame, gameZone, grass, ground, terminal, wall, whack } from '../resources/resources'
import { toadsGameState } from '../state'

const staticModels = [
    draft,
    floor,
    frame,
    grass,
    ground,
    wall,
    whack,
    gameZone,
    terminal,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, {...model, visibleMeshesCollisionMask: ColliderLayer.CL_CUSTOM5})
        if (model == whack) toadsGameState.listOfEntity.set('ground', enitity)
    })
}