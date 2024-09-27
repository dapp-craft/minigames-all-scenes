import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { exitGame, gameState, getReadyToStart, initGame, startLevel } from './game'
import { GAME_ID } from './config'
import { STATIC_MODELS } from './resources/resources'
import { setSfxStatus, SFX_ENABLED } from './game/sfx'
import { Color4 } from '@dcl/sdk/math'

const handlers = {
  start: getReadyToStart,
  exit: exitGame,
  restart: () => {
    startLevel(gameState.level)
  },
  toggleMusic: () => {},
  toggleSfx: () => {
    setSfxStatus(!SFX_ENABLED)
  }
}

const libraryReady = initMiniGame(
  GAME_ID,
  TIME_LEVEL,
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers,
  { textColor: Color4.Black(), fontSize: 3 }
)

executeTask(async () => {
  for (const model of STATIC_MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, model)
    Transform.create(entity, { parent: sceneParentEntity })
  }
})

export async function main() {
  // await libraryReady
  initGame()
}
