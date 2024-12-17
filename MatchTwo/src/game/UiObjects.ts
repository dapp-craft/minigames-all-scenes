import { ui, queue } from '@dcl-sdk/mini-games/src'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { TILES_LEVEL } from '../config'
import { exitGame, gameState, startLevel } from './game'
import * as utils from '@dcl-sdk/utils'
import { SFX_ENABLED, setSfxStatus } from './sound'
import { levelButtonPositions } from './locators/levelButtonPositions'
import { TextAlignMode, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { statusBoardPositions } from './locators/statusBoardPositions'

export const levelButtons: ui.MenuButton[] = []
const levelButtonCooldown = 1000
let lastLevelButtonPress = 0
export function setupGameUI() {
  Object.keys(TILES_LEVEL).forEach((level, index) => {
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
  })

  setupMoveCouner()
  seteupStopwatch()
  setupFoundPairs()
}

function setupMoveCouner() {
  const moveCounter = engine.addEntity()
  Transform.create(moveCounter, statusBoardPositions['counter_moves'])
  Transform.getMutable(moveCounter).parent = sceneParentEntity

  engine.addSystem(() => {
    TextShape.createOrReplace(moveCounter, {
      text: `Moves: ${gameState.moves}`,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
      fontSize: 3,
      textColor: Color4.White()
    })
  })
}

function seteupStopwatch() {
  const timer = engine.addEntity()
  Transform.create(timer, statusBoardPositions['counter_stopwatch'])
  Transform.getMutable(timer).parent = sceneParentEntity
  console.log('Timer', statusBoardPositions['counter_stopwatch'])

  engine.addSystem(() => {
    if (gameState.levelStartTime == 0) {
      TextShape.createOrReplace(timer, {
        text: `Time: --:--`,
        textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
        fontSize: 3,
        textColor: Color4.White()
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
      textColor: Color4.White()
    })
  })
}

function setupFoundPairs() {
  const foundPairs = engine.addEntity()
  Transform.create(foundPairs, statusBoardPositions['counter_foundPairs'])
  Transform.getMutable(foundPairs).parent = sceneParentEntity

  engine.addSystem(() => {
    if (gameState.levelStartTime == 0) {
      TextShape.createOrReplace(foundPairs, {
        text: `Pairs: --/--`,
        textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
        fontSize: 3,
        textColor: Color4.White()
      })
      return
    }

    TextShape.createOrReplace(foundPairs, {
      text: `Pairs: ${gameState.pairFound}/${gameState.tilesCount / 2}`,
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT,
      fontSize: 3,
      textColor: Color4.White()
    })
  })
}
