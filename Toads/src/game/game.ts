import * as utils from '@dcl-sdk/utils'
import { gameLogic } from '..'
import { progressState, sceneParentEntity } from '../state'
import { engine } from '@dcl/sdk/ecs'
import { updatePlayerProgress } from './syncData'
import { ui } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../common/locators'
import { toadsGameConfig } from '../config'

// export let gameDataEntity: Entity
export let sessionStartedAt: number

let timer: ui.Timer3D
let playButton: ui.MenuButton

export const initGame = async () => {
  console.log('INIT GAME')

  // await fetchPlayerProgress();

  // initStatusBoard()

  await initCountdownNumbers()

  await spawnButton()

}

export function getReadyToStart() {
  console.log('Get Ready to start!')
  utils.timers.setTimeout(() => playButton.disable(), playButton.releaseTime + 200)
  utils.timers.setTimeout(() => startGame(), 2000)
}

export function exitCallback() {
  gameLogic.stopGame()
  // GameData.createOrReplace(gameDataEntity, {
  //   playerAddress: '',
  //   playerName: '',
  //   moves: 0,
  // })
}

async function startGame() {
  // const localPlayer = getPlayer()
  sessionStartedAt = Date.now();

  countdown(() => {
    gameLogic.stopGame()
  }, toadsGameConfig.gameTime / 1000)

  // GameData.createOrReplace(gameDataEntity, {
  //   playerAddress: localPlayer?.userId,
  //   playerName: localPlayer?.name,
  //   // moves: res.correct - res.miss
  // })

  const res = await gameLogic.startGame();
  console.log(res)

  playButton.enable()

  progressState.moves = res.correct - res.miss
  console.log(progressState)
  await updatePlayerProgress(progressState);
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

const spawnButton = async () => {
  const data = await readGltfLocators(`locators/obj_locators_unique.gltf`)
  playButton = new ui.MenuButton(
    {...data.get("button_start")!, parent: sceneParentEntity},
    ui.uiAssets.shapes.SQUARE_GREEN,
    ui.uiAssets.icons.play,
    ``,
    () => {
      getReadyToStart()
    },
    true,
    500
  )
}