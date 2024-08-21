// We define the empty imports so the auto-complete feature works as expected.
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { GltfContainer, MeshRenderer, Transform, TransformType, engine } from '@dcl/sdk/ecs'
import { setupStaticModels } from './staticModels'
import { Board } from './game/gameLogic/board'
import { initLibrary, sceneParentEntity, ui, queue } from '@dcl-sdk/mini-games/src'
import { syncEntity } from '@dcl/sdk/network'
import players from '@dcl/sdk/players'

initLibrary(engine, syncEntity, players, {
  environment: 'dev',
  gameId: 'e05b3729-9504-40e9-8a49-c2145e568d62',
  gameTimeoutMs: 1000 * 60,
  gameArea: {
    topLeft: Vector3.create(1,0,3),
    bottomRight: Vector3.create(15, 3, 9),
    exitSpawnPoint: Vector3.create(8, 1, 13)
  }
})


const BOARD_TRANSFORM: TransformType = {
  position: { x: 8, y: 2.6636881828308105, z: 1.0992899895 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: Quaternion.fromAngleAxis(180, Vector3.create(0, 1, 0))
}

export function main() {
  // Setup Environment models
  setupStaticModels()


  let board

  const onSolved = (time: number, steps: number) => {
    console.log('Solved in', time, 'ms and', steps, 'steps')
    board = new Board(BOARD_TRANSFORM, 3, 1, onSolved)
  }

  board = new Board(BOARD_TRANSFORM, 3, 1, onSolved)



  new ui.MenuButton(
    {
      parent: sceneParentEntity,
      position: Vector3.create(0, 1.03, 2),
      rotation: Quaternion.fromEulerDegrees(-45, 180, 0),
      scale: Vector3.create(1.2, 1.2, 1.2)
    },
    ui.uiAssets.shapes.RECT_GREEN,
    ui.uiAssets.icons.playText,
    "PLAY GAME",
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
      position: Vector3.create(-6.9904998779296875, 3.4545814990997314, 3.1500000953674316),
      rotation: Quaternion.fromEulerDegrees(0, -90, 0)
    },
    width,
    height,
    scale,
    ui.TIME_LEVEL
  )

}