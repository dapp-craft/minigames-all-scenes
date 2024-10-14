import { Entity, Transform, TransformType, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'

export let BOARD: Entity

export function initBoard() {
  BOARD = engine.addEntity()
  Transform.create(BOARD, BOARD_TRANSFORM)
}

export const BOARD_TRANSFORM: TransformType = {
  position: { x: 8, y: 2.6636881828308105, z: 1.0992899895 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: Quaternion.fromAngleAxis(180, Vector3.create(0, 1, 0))
}
