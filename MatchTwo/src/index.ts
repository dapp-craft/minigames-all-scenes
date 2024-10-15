// We define the empty imports so the auto-complete feature works as expected.
import { Vector3 } from '@dcl/sdk/math'
import { engine } from '@dcl/sdk/ecs'
import { initLibrary } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import { GAME_ID, SESSION_DURATION } from './config'
import players from '@dcl/sdk/players'
import { gameState, getReadyToStart, initGame, startLevel, exitGame } from './game/game'
import { setupUI } from './ui'
import { setupStaticModels } from './staticModels'
import { SFX_ENABLED, setSfxStatus } from './game/sound'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { toggleBackgroundMusic } from './SoundManager'
import { LEVEL, MOVES, TIME } from '@dcl-sdk/mini-games/src/ui/scoreboard/columnData'

const handlers = {
  start: () => getReadyToStart(),
  exit: () => exitGame(),
  restart: () => startLevel(gameState.level),
  toggleMusic: () => toggleBackgroundMusic(),
  toggleSfx: () => setSfxStatus(!SFX_ENABLED)
}

initMiniGame(GAME_ID, [MOVES, LEVEL, TIME], readGltfLocators(`locators/obj_locators_default.gltf`), handlers, {
  scoreboard: {
    sortDirection: 'asc'
  }
})

// initLibrary(engine, syncEntity, players, {
//   environment: 'dev',
//   gameId: GAME_ID,
//   gameTimeoutMs: SESSION_DURATION,
//   gameArea: {
//     topLeft: Vector3.create(1, 0, 0),
//     bottomRight: Vector3.create(15, 5, 9),
//     exitSpawnPoint: Vector3.create(8, 1, 13)
//   }
// })

export function main() {
  setupStaticModels()

  initGame()

  setupUI()
}
