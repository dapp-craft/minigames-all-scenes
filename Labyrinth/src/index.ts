import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { init } from './game.ts'

// const handlers = {
//     start: () => {},
//     exit: () => {},
//     restart: () => {},
//     toggleMusic: () => {},
//     toggleSfx: () => {}
// }

// const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

const MODELS: string[] = ['models/obj_floor.gltf']

executeTask(async () => {
  for (const model of MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, { src: model })
    Transform.create(entity, { position: { x: 8, y: 0, z: 8 } })
  }
})

export async function main() {
  await init()
}
