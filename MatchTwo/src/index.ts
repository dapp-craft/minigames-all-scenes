import { GAME_ID, SESSION_DURATION } from './config'
import { gameState, getReadyToStart, initGame, startLevel, exitGame } from './game/game'
import { setupUI } from './ui'
import { setupStaticModels } from './staticModels'
import { SFX_ENABLED, setSfxStatus } from './game/sound'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { toggleBackgroundMusic } from './SoundManager'
import { LEVEL, MOVES, TIME } from '@dcl-sdk/mini-games/src/ui/scoreboard/columnData'
(globalThis as any).DEBUG_NETWORK_MESSAGES = false

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
  },
  scene: {
    rotation: 90
  }
})

export function main() {
  setupStaticModels()

  initGame()

  setupUI()

}
