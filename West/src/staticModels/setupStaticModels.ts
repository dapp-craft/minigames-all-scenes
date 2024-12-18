import { GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { barrel, curtains, fence, floor, gameZone, ground, terminal, text, wall } from '../resources/resources'
// import { toadsGameState } from '../state'

const staticModels = [
    barrel,
    fence,
    floor,
    ground,
    wall,
    gameZone,
    terminal,
    text,
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, {...model})
        // if (model == whack) {
        //     toadsGameState.listOfEntity.set('ground', enitity)
        //     GltfContainer.getMutable(enitity).visibleMeshesCollisionMask = ColliderLayer.CL_CUSTOM5
        // }
    })
}