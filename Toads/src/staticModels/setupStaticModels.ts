import { ColliderLayer, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { draft, floor, frame, gameZone, grass, ground, logo, rules, terminal, text, wall, whack } from '../resources/resources'
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
    rules,
    logo,
    text
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