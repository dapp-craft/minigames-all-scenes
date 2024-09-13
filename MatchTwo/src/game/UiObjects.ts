import { ui, queue } from '@dcl-sdk/mini-games/src'
import { sceneParentEntity } from '../globals'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { TILES_LEVEL } from '../config'
import { exitGame, startLevel } from './game'
import * as utils from '@dcl-sdk/utils'
import { SFX_ENABLED, setSfxStatus } from './sound'

const width = 2
const height = 3
const scale = 1

export const levelButtons: ui.MenuButton[] = []
const levelButtonCooldown = 1000
let lastLevelButtonPress = 0
export function setupGameUI() {

  Object.keys(TILES_LEVEL).forEach((level, index) => {
    const button = new ui.MenuButton(
      {
        parent: sceneParentEntity,
        position: Vector3.create(-5, 4.02 - (index + 1) * 0.5, -4),
        scale: Vector3.create(1.5, 1.5, 1.5),
        rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
      },
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

}
