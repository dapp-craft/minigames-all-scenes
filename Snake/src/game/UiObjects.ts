import { ui, queue } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { MeshRenderer, TextAlignMode, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import { gameController } from './index'

export const levelButtons: ui.MenuButton[] = []

export async function setupGameUI() {
  await Promise.all([setLevelUiPositions()])

  setupScore()
}

function setupScore() {
  const moveCounter = engine.addEntity()
  Transform.create(moveCounter, UiLocators['counter_score'])
  TextShape.createOrReplace(moveCounter, {
    text: `Score: ${0}`,
    fontSize: 3,
    textColor: Color4.White(),
    textAlign: TextAlignMode.TAM_MIDDLE_LEFT
  })
  syncEntity(moveCounter, [TextShape.componentId], 5200)

  engine.addSystem(() => {
    const text = `Score: ${gameController.score}`
    if (TextShape.get(moveCounter).text == text) return
    if (!gameController.inGame) return
    TextShape.createOrReplace(moveCounter, {
      text,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  })
}
