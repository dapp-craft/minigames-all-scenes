import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { SCORE } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { finishGameButtonHandler, initGame, startGame } from './game'
import { STATIC_MODELS } from './resources'
import '../../common/cleaner'
import { setSfxStatus, SFX_ENABLED, soundManager } from './game/sound'

(globalThis as any).DEBUG_NETWORK_MESSAGES = false


const handlers = {
  start: startGame,
  exit: finishGameButtonHandler,
  restart: startGame,
  toggleMusic: () => {soundManager.setThemeStatus(!soundManager.getThemeStatus())},
  toggleSfx: () => setSfxStatus(!SFX_ENABLED)
}


const libraryReady = initMiniGame(
  '607f24d8-fb0c-4518-9cc4-9529ba924792',
  [SCORE],
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers,
  {
    scene: {
      rotation: 90
    }
  }
)

const MODELS: string[] = ['models/obj_floor.gltf']

executeTask(async () => {
  for (const model of STATIC_MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, model)
    Transform.create(entity, { parent: sceneParentEntity })
  }
})

export function main() {
  // await libraryReady

  initGame()
}


