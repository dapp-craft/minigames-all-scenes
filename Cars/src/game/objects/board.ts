import {
  ColliderLayer,
  Entity,
  Material,
  MeshCollider,
  MeshRenderer,
  Transform,
  TransformType,
  engine
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/ecs-math'
import { BOARD_PHYSICAL_SIZE, COLLIDER_OFFSET_COEFFICIENT } from '../../config'
import { boardTexture } from '../../resources/resources'
import { Quaternion } from '@dcl/sdk/math'

export let BOARD: Entity

const BOARD_TRANSFORM: TransformType = {
  position: Vector3.create(8, 0.04820071533322334, 4.2141509056),
  scale: Vector3.create(BOARD_PHYSICAL_SIZE, BOARD_PHYSICAL_SIZE, BOARD_PHYSICAL_SIZE),
  rotation: Quaternion.fromEulerDegrees(90, 180, 0)
}

export function createBoard() {
  const board = engine.addEntity()
  Transform.create(board, BOARD_TRANSFORM)
  // Material.setPbrMaterial(board, {
  //   texture: Material.Texture.Common({
  //     src: boardTexture
  //   })
  // })
  // MeshRenderer.setPlane(board)
  BOARD = board

  const boardCollider = engine.addEntity()
  Transform.create(boardCollider, {
    position: Vector3.create(0, 0, BOARD_PHYSICAL_SIZE * COLLIDER_OFFSET_COEFFICIENT),
    parent: board
  })
  MeshCollider.setPlane(boardCollider, [ColliderLayer.CL_PHYSICS, ColliderLayer.CL_CUSTOM1])
}
