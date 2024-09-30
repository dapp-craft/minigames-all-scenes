import * as utils from '@dcl-sdk/utils'
import { getPlayer } from '@dcl/sdk/players'
import { gameLogic } from '..'
import { GameData, progressState, sceneParentEntity } from '../state'
import { engine, Entity } from '@dcl/sdk/ecs'
import { initStatusBoard } from './initStatusBoard'
import { fetchPlayerProgress, updatePlayerProgress } from './syncData'
import { progress, ui } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../common/locators'

export let gameDataEntity: Entity
export let sessionStartedAt: number

let timer: ui.Timer3D

export const initGame = async () => {
  console.log('INIT GAME')

  await fetchPlayerProgress();

  initStatusBoard()

  await initCountdownNumbers()

  // await initCounter()
}

export function getReadyToStart() {
  console.log('Get Ready to start!')
  utils.timers.setTimeout(() => startGame(), 2000)
}

export function exitCallback() {
  gameLogic.stopGame()
  GameData.createOrReplace(gameDataEntity, {
    playerAddress: '',
    playerName: '',
    moves: 0,
  })
}

async function startGame() {
  const localPlayer = getPlayer()
  sessionStartedAt = Date.now();

  countdown(() => {
    gameLogic.stopGame()
  }, 30)


  const res = await gameLogic.startGame();
  console.log(res)

  progressState.moves = res.correct - res.miss
  console.log(progressState)
  await updatePlayerProgress(progressState);

  GameData.createOrReplace(gameDataEntity, {
    playerAddress: localPlayer?.userId,
    playerName: localPlayer?.name,
    // moves: res.correct - res.miss
  })
}

async function initCountdownNumbers() {
  const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
  timer = new ui.Timer3D(
    {
      parent: sceneParentEntity,
      position: data.get('counter_timer')?.position,
      rotation: Quaternion.fromEulerDegrees(0, 0, 0),
      scale: Vector3.create(.5, .5, .5)
    },
    1,
    1,
    false,
    10
  )
  console.log(timer)
  timer.hide()
}

export async function countdown(cb: () => void, number: number) {
  let currentValue = number
  let time = 1

  engine.addSystem(
    (dt: number) => {
      time += dt

      if (time >= 1) {
        time = 0
        if (currentValue > 0) {
          timer.show()
          timer.setTimeAnimated(currentValue--)
        } else {
          timer.hide()
          engine.removeSystem('countdown-system')
          cb && cb()
        }
      }
    },
    undefined,
    'countdown-system'
  )
}