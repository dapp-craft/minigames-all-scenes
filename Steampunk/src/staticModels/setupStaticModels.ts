import { ColliderLayer, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { display, image1, frame, gameZone, grass, ground, logo, rules, terminal, text, wall, whack, test } from '../resources/resources'
import { steampunkGameState } from '../gameState'

const staticModels = [
    display,
    // image1,
    // test,
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
        GltfContainer.create(enitity, { ...model })
        if (model == display) {
            steampunkGameState.listOfEntity.set('display', enitity)
            // GltfContainer.deleteFrom(enitity)
        }
        if (model == image1) {
            steampunkGameState.listOfEntity.set('target', enitity)
        }
    })
}