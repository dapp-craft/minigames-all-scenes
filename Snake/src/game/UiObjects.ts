import { ui, sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { Color4 } from '@dcl/sdk/math'
import { setLevelUiPositions, UiLocators } from './locators/UILocators'
import { Entity, TextAlignMode, TextShape, Transform, engine } from '@dcl/sdk/ecs'
import { syncEntity } from '@dcl/sdk/network'
import { gameController } from './index'

export const levelButtons: ui.MenuButton[] = []

export async function setupGameUI() {
  const moveCounter = engine.addEntity()
  syncEntity(moveCounter, [TextShape.componentId], 5200)

  const speedEntity = engine.addEntity()
  syncEntity(speedEntity, [TextShape.componentId], 5201)

  await Promise.all([setLevelUiPositions()])

  setupScore(moveCounter)
  setupSpeed(speedEntity)
}

function setupScore(moveCounter: Entity) {
  if (!Transform.has(moveCounter)) Transform.create(moveCounter, UiLocators['counter_length'])
  Transform.getMutable(moveCounter).parent = sceneParentEntity
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
  if (!Transform.has(speedEntity)) Transform.create(speedEntity, UiLocators['counter_speed'])
  Transform.getMutable(speedEntity).parent = sceneParentEntity
  if (!TextShape.has(speedEntity)) {
    TextShape.createOrReplace(speedEntity, {
      text: `Speed: ${0}`,
      fontSize: 3,
      textColor: Color4.White(),
      textAlign: TextAlignMode.TAM_MIDDLE_LEFT
    })
  }

  engine.addSystem(() => {
    const text = `Speed: ${gameController.speed + 1}`
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
