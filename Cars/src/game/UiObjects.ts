import { ui } from '@dcl-sdk/mini-games/src'
import { Color4 } from '@dcl/sdk/math'
import { MAX_LEVEL } from '../config'
import { gameState, inGame, startLevel } from './index'
import { levelButtonPositions, setLevelButtonPositions } from './locators/levelButtonPositions'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { TextShape, Transform, engine, TextAlignMode, Entity } from '@dcl/sdk/ecs'
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
        startLevel(Number(level))
      }
    )
    button.disable()
    levelButtons.push(button)
  }
  const moveCounterEntity = engine.addEntity()
  syncEntity(moveCounterEntity, [TextShape.componentId], 9000)
  setupMoveCouner(moveCounterEntity)

  const timerEntity = engine.addEntity()
  syncEntity(timerEntity, [TextShape.componentId], 9001)
  seteupTimer(timerEntity)
}

function setupMoveCouner(moveCounter: Entity) {
  Transform.create(moveCounter, UiLocators['counter_moves'])

  engine.addSystem(() => {
    if (!inGame) return
    TextShape.createOrReplace(moveCounter, {
      text: `Moves: ${gameState.moves}`,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
      fontSize: 3,
      textColor: Color4.Black()
    })
  })
}

function seteupTimer(timer: Entity) {
  Transform.create(timer, UiLocators['counter_stopwatch'])

  engine.addSystem(() => {
    if (!inGame) return
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
