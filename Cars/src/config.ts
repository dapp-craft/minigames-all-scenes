// Game

import { TransformType } from "@dcl/sdk/ecs"
import { Quaternion, Vector3 } from "@dcl/sdk/math"

/**
 * Number of rows and columns of the board
 */
export const BOARD_SIZE = 6
/**
 * Physical size of the board in meters
 */
export const BOARD_PHYSICAL_SIZE = 4
export const SELL_SIZE_RELATIVE = 1 / BOARD_SIZE
export const SELL_SIZE_PHYSICAL = BOARD_PHYSICAL_SIZE / BOARD_SIZE

export const BOARD_TRANSFORM: TransformType = {
  position: Vector3.create(8, 0.7, 8),
  scale: Vector3.create(BOARD_PHYSICAL_SIZE, BOARD_PHYSICAL_SIZE, BOARD_PHYSICAL_SIZE),
  rotation: Quaternion.fromEulerDegrees(90, 90, 0)
}
