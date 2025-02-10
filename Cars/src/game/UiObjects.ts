import { ui } from '@dcl-sdk/mini-games/src'
import { Color4 } from '@dcl/sdk/math'
import { MAX_LEVEL } from '../config'
import { gameState, inGame, startLevel } from './index'
import { levelButtonPositions, setLevelButtonPositions } from './locators/levelButtonPositions'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { TextShape, Transform, engine, TextAlignMode, Entity, MeshRenderer } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import { readStaticUIPositions, staticUIPositions } from './locators/staticUI'

export const levelButtons: ui.MenuButton[] = []

const DIFFICULTIES = ['EASY', 'MEDIUM', 'HARD'] as const
type Difficulty = typeof DIFFICULTIES[number]
const DIFFICULTY_COLORS = {
  'EASY': ui.uiAssets.shapes.SQUARE_GREEN,
  'MEDIUM': ui.uiAssets.shapes.SQUARE_YELLOW,
  'HARD': ui.uiAssets.shapes.SQUARE_RED
} as const

export async function setupGameUI() {
  await Promise.all([setLevelButtonPositions(), setLevelUiPositions(), readStaticUIPositions()])

  for (let index = 0; index < MAX_LEVEL; index++) {
    const level = index + 1
    const levelDifficulty = Math.floor(index / 5)
    const positionInRow = index % 5
    const difficulty = DIFFICULTIES[levelDifficulty]
    const button = new ui.MenuButton(
      levelButtonPositions[difficulty][positionInRow],
      DIFFICULTY_COLORS[difficulty],
      ui.uiAssets.numbers[index % 5 + 1 as any],
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

  // Static UI
  const labelEasy = engine.addEntity()
  Transform.create(labelEasy, staticUIPositions.label_easy)
  TextShape.createOrReplace(labelEasy, {
    text: 'EASY',
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
    fontSize: 3,
    textColor: Color4.Green()
  })

  const labelMedium = engine.addEntity()
  Transform.create(labelMedium, staticUIPositions.label_medium)
  TextShape.createOrReplace(labelMedium, {
    text: 'MEDIUM',
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
    fontSize: 3,
    textColor: Color4.Yellow()
  })

  const labelHard = engine.addEntity()
  Transform.create(labelHard, staticUIPositions.label_hard)
  TextShape.createOrReplace(labelHard, {
    text: 'HARD',
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
    fontSize: 3,
    textColor: Color4.Red()
  }) 
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
