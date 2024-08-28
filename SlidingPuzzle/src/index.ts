// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { GltfContainer, MeshRenderer, Transform, TransformType, engine } from '@dcl/sdk/ecs'
import { setupStaticModels } from './staticModels'
import { initGame } from './game/game'
import { initLibrary, sceneParentEntity, ui, queue } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players, { getPlayer } from '@dcl/sdk/players'
import { GAME_ID } from './config'
import { listeners } from '@dcl-sdk/mini-games/src/queue'
import { setupUI } from './ui'

initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: GAME_ID,
  gameTimeoutMs: 1000 * 60 * 5,
  gameArea: {
    topLeft: Vector3.create(1, 0, 0),
    bottomRight: Vector3.create(15, 5, 9),
    exitSpawnPoint: Vector3.create(8, 1, 13)
  }
})

export function main() {
  // Setup Environment models
  setupStaticModels()

  new ui.MenuButton(
    {
      parent: sceneParentEntity,
      position: Vector3.create(0, 1.03, 2),
      rotation: Quaternion.fromEulerDegrees(-45, 180, 0),
      scale: Vector3.create(2, 2, 2)
    },
    ui.uiAssets.shapes.RECT_GREEN,
    ui.uiAssets.icons.playText,
    'PLAY GAME',
    () => {
      queue.addPlayer()
    }
  )

  const width = 2.5
  const height = 2.8
  const scale = 1.2

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

  queue.initQueueDisplay({
    parent: sceneParentEntity,
    position: Vector3.create(0, 2, 2),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: Vector3.create(1, 1, 1)
  })

  initGame()

  setupUI()
}
