import * as utils from '@dcl-sdk/utils'
import { gameLogic } from '..'
import { progressState, sceneParentEntity } from '../state'
import { CameraModeArea, CameraType, engine } from '@dcl/sdk/ecs'
import { updatePlayerProgress } from './syncData'
import { ui } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { readGltfLocators } from '../../../common/locators'
import { soundConfig, toadsGameConfig } from '../config'
import { soundManager } from '../globals'
import { cancelCountdown, runCountdown } from '../../../common/effects'

export let sessionStartedAt: number

let timer: ui.Timer3D
let playButton: ui.MenuButton
let startTimeOut: utils.TimerId
let buttonDisableTimeOut: utils.TimerId

export const initGame = async () => {
  console.log('INIT GAME')

  await initCountdownNumbers()

  await spawnButton()
}

export function getReadyToStart() {
  console.log('Get Ready to start!')
  playButton.disable()
  soundManager.playSound('enterSounds', soundConfig.volume)
  utils.timers.clearTimeout(startTimeOut)
  utils.timers.clearTimeout(buttonDisableTimeOut)
  exitCallback(false)
  buttonDisableTimeOut = utils.timers.setTimeout(() => playButton.disable(), playButton.releaseTime + 200)
  CameraModeArea.createOrReplace(engine.PlayerEntity, {
    area: Vector3.create(1, 1, 1),
    mode: CameraType.CT_FIRST_PERSON,
  })
  runCountdown().then(() => startGame())
}

export function exitCallback(exit: boolean = true) {
  cancelCountdown()
  utils.timers.setTimeout(() => {
    if (exit == true){
      CameraModeArea.deleteFrom(engine.PlayerEntity)
      soundManager.playSound('exitSounds', soundConfig.volume)
    }
    gameLogic.stopGame()
    gameLogic.resetData()
    engine.removeSystem('countdown-system')
    timer.hide()
  }, 100)

}

async function startGame() {
  sessionStartedAt = Date.now();

  countdown(() => {
    gameLogic.stopGame()
    soundManager.playSound('exitSounds', soundConfig.volume)
  }, toadsGameConfig.gameTime / 1000)

  const res = await gameLogic.startGame();
  console.log(res)

  playButton.enable()

  progressState.moves = res
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
    110
  )
  console.log(timer)
  timer.hide()
}

export async function countdown(cb: () => void, number: number, stop?: boolean) {
  let currentValue = number
  let time = stop ? 0 : 1

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
    { ...data.get("button_start")!, parent: sceneParentEntity },
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