import { ui, queue } from '@dcl-sdk/mini-games/src'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { MAX_LEVEL } from './levels'
import { startLevel } from './index'
import * as utils from '@dcl-sdk/utils'
import { levelButtonPositions, setLevelButtonPositions } from './locators/levelButtonPositions'
const width = 2
const height = 3
const scale = 1

export const levelButtons: ui.MenuButton[] = []
const levelButtonCooldown = 1000
let lastLevelButtonPress = 0
export async function setupGameUI() {

  await setLevelButtonPositions()

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

}
