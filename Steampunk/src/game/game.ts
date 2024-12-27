import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity, ui } from "@dcl-sdk/mini-games/src"
import { gameLogic } from '..'
import { readGltfLocators } from '../../../common/locators'
import { engine, TextShape } from '@dcl/sdk/ecs'
import { updatePlayerProgress } from './syncData'
import { runCountdown } from '../../../common/effects'
import { steampunkGameState } from '../gameState'
import { timeBeforeStart } from '../gameConfig'

export let startTimeOut: utils.TimerId
export let levelButtons: ui.MenuButton[] = []

export const initGame = () => {
  console.log('INIT GAME')

  spawnButton()
}

export function getReadyToStart() {
  console.log('Get Ready to start!')
  runCountdown(timeBeforeStart)
  startTimeOut = utils.timers.setTimeout(() => startGame(), timeBeforeStart * 1000 + 200)
}

async function startGame() {
  console.log("Start game")
  let res = await gameLogic.startGame()

  console.log("Response after game: ")
  console.log(res)

  // if (res.playerLevel[levelAmount - 1]) {
  console.log("Update Player Progress")
  await updatePlayerProgress(res);
  // }
  // queue.setNextPlayer()
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
          // timer.show()
          TextShape.getMutable(steampunkGameState.listOfEntity.get('timerEntity')).text = `${currentValue}`
          // timer.setTimeAnimated(currentValue--)
          currentValue--
        } else {
          // timer.hide()
          TextShape.getMutable(steampunkGameState.listOfEntity.get('timerEntity')).text = ``
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
  for (let i = 1; i <= 3; i++) {
    let button = new ui.MenuButton(
      { ...steampunkGameState.locatorsData.get(`button_level_${i}`), parent: sceneParentEntity },
      ui.uiAssets.shapes.SQUARE_GREEN,
      ui.uiAssets.numbers[i],
      `Level ${i}`,
      () => {
        gameLogic.startGame(i)
      },
      false,
      500
    )
    levelButtons.push(button)
  }
}
