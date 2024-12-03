import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { LEVEL, MOVES, TIME } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { exitGame, gameState, getReadyToStart, initGame, startLevel } from './game'
import { GAME_ID } from './config'
import { STATIC_MODELS } from './resources/resources'
import { setSfxStatus, SFX_ENABLED, soundManager } from './game/sfx'
import { Color4 } from '@dcl/sdk/math'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

const handlers = {
  start: getReadyToStart,
  exit: exitGame,
  restart: () => {
    startLevel(gameState.level)
  },
  toggleMusic: () => {
    soundManager.themePlaying(!soundManager.getThemeStatus())
  },
  toggleSfx: () => {
    setSfxStatus(!SFX_ENABLED)
  }
}

const libraryReady = initMiniGame(
  GAME_ID,
  [MOVES, LEVEL, TIME],
  readGltfLocators(`locators/obj_locators_default.gltf`),
  handlers,
  { labels: { textColor: Color4.Black() }, scoreboard: { sortDirection: 'asc' } }
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

// https://exploration-games.decentraland.zone/api/games/67ad1757-6796-4817-ac29-5bf1987d24f9/leaderboard?sort=time&direction=DESC
