import { ColliderLayer, GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { steampunkGameState } from '../gameState'
import { display, floor, frame, grass, wall, terminal, rules, text, image1, bench, chest02, dresser01, drums01, fence, gamezone, hydrants, lamp01, pipes, smoker01, table01, table02, tree01, tree02, tree03, wheels01 } from '../resources/resources'

const staticModels = [
    display,
    // image1,
    // test,
    floor,
    bench,
    chest02,
    dresser01,
    drums01,
    fence,
    frame,
    grass,
    hydrants,
    lamp01,
    pipes,
    smoker01,
    table01,
    table02,
    // terminal,
    text,
    tree01,
    tree02,
    tree03,
    wall,
    wheels01,
    rules,
    gamezone
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