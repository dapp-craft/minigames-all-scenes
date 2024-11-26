import { GltfContainer, Transform, engine } from '@dcl/sdk/ecs'
import { text, bench, bench01, bucket01, bush01, bush02, chest01, chest03, drums01, fence, floor, frame, gear01, gear02, gear03, gear04, gear05, gear06, gear07, gear08, grass, hydrants, lamp01, lamp02, num00, num01, num02, pipes, rules, smoker01, stone01, stone02, stone03, table02, terminal, tree01, tree02, tree03, vase01, wall, well01, wheels01 } from '../resources/resources'
import { steampunkGameState } from '../gameState'

const staticModels = [
    text,
    bench,
    bench01,
    bucket01,
    bush01,
    bush02,
    chest01,
    chest03,
    drums01,
    fence,
    floor,
    frame,
    gear01,
    gear02,
    gear03,
    gear04,
    gear05,
    gear06,
    gear07,
    gear08,
    grass,
    hydrants,
    lamp01,
    lamp02,
    num00,
    num01,
    num02,
    pipes,
    // rules,
    smoker01,
    stone01,
    stone02,
    stone03,
    table02,
    terminal,
    text,
    tree01,
    tree02,
    tree03,
    vase01,
    wall,
    well01,
    wheels01
]

export const setupStaticModels = () => {
    staticModels.forEach((model) => {
        const enitity = engine.addEntity()
        Transform.create(enitity, { position: { x: 8, y: 0, z: 8 } })
        GltfContainer.create(enitity, { ...model })
        // if (model == frame) {
            steampunkGameState.listOfEntity.set('display', enitity)
        //     // GltfContainer.deleteFrom(enitity)
        // }
        // if (model == image1) {
        //     steampunkGameState.listOfEntity.set('target', enitity)
        // }
    })
}