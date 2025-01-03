import { ui, queue } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { MAX_LEVEL } from './levels'
import { gameState, startLevel } from './index'
import * as utils from '@dcl-sdk/utils'
import { levelButtonPositions, setLevelButtonPositions } from './locators/levelButtonPositions'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { MeshRenderer, TextShape, Transform, engine, TextAlignMode } from '@dcl/sdk/ecs'
const width = 2
const height = 3
const scale = 1

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
        startLevel(Number(level))
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

  engine.addSystem(() => {
    TextShape.createOrReplace(moveCounter, {
      text: `Moves: ${gameState.moves}`,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
      fontSize: 3,
      textColor: Color4.Black()
    })
  })
}

function seteupTimer() {
  const timer = engine.addEntity()
  Transform.create(timer, UiLocators['counter_stopwatch'])

  engine.addSystem(() => {
    if (gameState.levelStartTime == 0) {
      TextShape.createOrReplace(timer, {
        text: `Time: --:--`,
        textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
        fontSize: 3,
        textColor: Color4.Black()
      })
      return
    }

    const gameElapsedTime = (Date.now() - gameState.levelStartTime) / 1000
    const minutes = Math.max(Math.floor(gameElapsedTime / 60), 0)
    const seconds = Math.max(Math.round(gameElapsedTime) - minutes * 60, 0)

    TextShape.createOrReplace(timer, {
      text: `Time: ${minutes.toLocaleString('en-US', {
        minimumIntegerDigits: 2,
        useGrouping: false
      })}:${seconds.toLocaleString('en-US', { minimumIntegerDigits: 2, useGrouping: false })}`,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
      fontSize: 3,
      textColor: Color4.Black()
    })
  })
}
