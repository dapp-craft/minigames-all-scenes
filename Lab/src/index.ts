import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { queue, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { STATIC_MODELS } from './resources'
import { Vector3 } from '@dcl/sdk/math'
import { setupEffects } from '../../common/effects'
import { playLevel, positions } from './game'

let interruptPlay: Function

const handlers = {
    start: async () => {
        const aborter = new Promise<never>((_, r) => interruptPlay = r)
        await playLevel(1, aborter).catch(_ => {})
        queue.setNextPlayer()
    },
    exit: () => {
        interruptPlay()
    },
    restart: () => {},
    toggleMusic: () => {},
    toggleSfx: () => {}
}

const libraryReady = initMiniGame('e5ec213a-628f-4ef7-8f6f-0cb543da0701', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

executeTask(async () => {
    for (const model of STATIC_MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, model)
        Transform.create(entity, { parent: sceneParentEntity })
    }
})


export async function main() {
    setupEffects(Vector3.create(0, 2.5, -5))
    const locators = await readGltfLocators(`locators/obj_locators_unique.gltf`)
    for (const [name, value] of locators) {
        if (name.match(/obj_flask_/)) positions.push(value.position)
    }
    await libraryReady
}
