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
import { Dispenser } from '../../common/dispenser'
;(globalThis as any).DEBUG_NETWORK_MESSAGES = false

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

export let DISPENSER: Dispenser

export function main() {
  setupStaticModels()

  initGame()

  setupUI()

  DISPENSER = new Dispenser("5CvD0OZdQpK8Zm8EzDoQTQGNveSvc0jKiVR7IFIlxrU=.BC1H4tn3F/oTtK5KvQtmDGmhVFU2WBvfi15LTeE6ti4=", {
    notAvailable: 'Complete the 2nd level in order to get the reward!',
    beforeClaim: 'Claim your reward!',
    afterClaim: 'Revard has been given!'
  })
}
