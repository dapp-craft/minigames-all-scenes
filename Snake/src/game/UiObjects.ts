import { ui, queue } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import * as utils from '@dcl-sdk/utils'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { Entity, MeshRenderer, TextAlignMode, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import { gameController } from './index'

export const levelButtons: ui.MenuButton[] = []

export async function setupGameUI() {
  await Promise.all([setLevelUiPositions()])

  const moveCounter = engine.addEntity()
  syncEntity(moveCounter, [TextShape.componentId], 5200)
  setupScore(moveCounter)

  const speedEntity = engine.addEntity()
  syncEntity(speedEntity, [TextShape.componentId], 5201)
  setupSpeed(speedEntity)
}

function setupScore(moveCounter: Entity) {
  Transform.create(moveCounter, UiLocators['counter_length'])
  if (!TextShape.has(moveCounter)) {
    TextShape.createOrReplace(moveCounter, {
      text: `Length: ${0}`,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  }

  engine.addSystem(() => {
    const text = `Length: ${gameController.score}`
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

function setupSpeed(speedEntity: Entity) {
  Transform.create(speedEntity, UiLocators['counter_speed'])
  if (!TextShape.has(speedEntity)) {
    TextShape.createOrReplace(speedEntity, {
      text: `Speed: ${0}`,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  }

  engine.addSystem(() => {
    const text = `Speed: ${gameController.speed}`
    if (TextShape.get(speedEntity).text == text) return
    if (!gameController.inGame) return
    TextShape.createOrReplace(speedEntity, {
      text,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  })
}
