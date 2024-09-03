import { ui, queue } from '@dcl-sdk/mini-games/src'
import { sceneParentEntity } from '../globals'
import { Vector3, Quaternion } from '@dcl/sdk/math'

const width = 2
const height = 3
const scale = 1

export function setupGameUI() {
  new ui.ScoreBoard(
    {
      parent: sceneParentEntity,
      position: Vector3.create(-7.07, 3.02, 3.25),
      rotation: Quaternion.fromEulerDegrees(0, -90, 0),
      scale: Vector3.create(0.875, 0.78, 1)
    },
    width,
    height,
    scale,
    {
      placementStart: 0.06,
      nameStart: 0.08,
      timeStart: 0.7,
      levelStart: 0.96,
      nameHeader: 'PLAYER',
      timeHeader: 'TIME',
      levelHeader: 'LEVEL'
    }
  )

  new ui.MenuButton(
    {
      parent: sceneParentEntity,
      position: Vector3.create(0.008361, 1.28328, 2.94125),
      rotation: Quaternion.fromEulerDegrees(-50, 180, 0),
      scale: Vector3.create(1.25, 1.25, 1.25)
    },
    ui.uiAssets.shapes.RECT_GREEN,
    ui.uiAssets.icons.playText,
    'PLAY GAME',
    () => {
      queue.addPlayer()
    }
  )

}
