import { ui, queue } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { stateVariables, startLevel } from './index'
import * as utils from '@dcl-sdk/utils'
import { levelButtonPositions, setLevelButtonPositions } from './locators/levelButtonPositions'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { MeshRenderer, TextAlignMode, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { MAX_LEVEL } from '../config'
import { syncEntity } from '@dcl/sdk/network'

export const levelButtons: ui.MenuButton[] = []

export async function setupGameUI() {
  await Promise.all([setLevelButtonPositions(), setLevelUiPositions()])

  for (let index = 0; index < MAX_LEVEL; index++) {
    const level = index + 1
    const button = new ui.MenuButton(
      levelButtonPositions.levelButtons[index],
      ui.uiAssets.shapes.SQUARE_GREEN,
      ui.uiAssets.numbers[level as any],
      `START LEVEL ${level}`,
      () => {
        startLevel(level)
      }
    )
    button.disable()
    levelButtons.push(button)
  }

  setupMoveCouner()
  seteupTimer()
}

function setupMoveCouner() {
  const moveCounter = engine.addEntity()
  Transform.create(moveCounter, UiLocators['counter_moves'])
  TextShape.createOrReplace(moveCounter, {
    text: `Moves: ${0}`,
    fontSize: 3,
    textColor: Color4.White(),
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT
  })
  syncEntity(moveCounter, [TextShape.componentId], 5200)

  engine.addSystem(() => {
    TextShape.createOrReplace(moveCounter, {
      text: `Moves: ${stateVariables.moves}`,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  })
}

function seteupTimer() {
  const timer = engine.addEntity()
  Transform.create(timer, UiLocators['counter_stopwatch'])
  TextShape.createOrReplace(timer, {
    text: `Time: --:--`,
    fontSize: 3,
    textColor: Color4.White(),
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT
  })
  syncEntity(timer, [TextShape.componentId], 5201)

  engine.addSystem(() => {
    // Only current playing level can update the timer
    if (!stateVariables.inGame) return

    if (stateVariables.levelStartTime == 0) {
      TextShape.createOrReplace(timer, {
        text: `Time: --:--`,
        fontSize: 3,
        textColor: Color4.White(),
        textAlign: TextAlignMode.TAM_MIDDLE_LEFT
      })
      return
    }

    const gameElapsedTime = (Date.now() - stateVariables.levelStartTime) / 1000
    const minutes = Math.max(Math.floor(gameElapsedTime / 60), 0)
    const seconds = Math.max(Math.round(gameElapsedTime) - minutes * 60, 0)

    TextShape.createOrReplace(timer, {
      text: `Time: ${minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })}:${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  })
}
