import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { finishGameButtonHandler, initGame, startGame } from './game'
import { STATIC_MODELS } from './resources'

const handlers = {
  start: startGame,
  exit: finishGameButtonHandler,
  restart: startGame,
  toggleMusic: () => {},
  toggleSfx: () => {}
}

const libraryReady = initMiniGame(
  '',
  TIME_LEVEL_MOVES,
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers
)

const MODELS: string[] = ['models/obj_floor.gltf']

executeTask(async () => {
  for (const model of STATIC_MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, model)
    Transform.create(entity, { parent: sceneParentEntity })
  }
})

export async function main() {
  await libraryReady

  initGame()
}
