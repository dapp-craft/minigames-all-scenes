// We define the empty imports so the auto-complete feature works as expected.
import { Vector3 } from '@dcl/sdk/math'
import { engine } from '@dcl/sdk/ecs'
import { initLibrary } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import { GAME_ID, SESSION_DURATION } from './config'
import players from '@dcl/sdk/players'
import { initGame } from './game/game'

initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: GAME_ID,
  gameTimeoutMs: SESSION_DURATION,
  // gameArea: {
  //   topLeft: Vector3.create(1, 0, 0),
  //   bottomRight: Vector3.create(15, 5, 9),
  //   exitSpawnPoint: Vector3.create(8, 1, 13)
  // }
})

export function main() {
  initGame()
}
