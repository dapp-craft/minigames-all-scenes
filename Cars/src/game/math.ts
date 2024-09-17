import { Transform } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { BOARD_SIZE, SELL_SIZE_RELATIVE } from '../config'
import { Cell } from './type'
import { BOARD } from '.'

export function globalCoordsToLocal(position: Vector3) {
  const boardPos = Transform.get(BOARD).position
  const boardScale = Transform.get(BOARD).scale
  const boardRot = Transform.get(BOARD).rotation
  const fromBoardCenter = Vector3.subtract(position, boardPos)
  const fromBoardCenterScaled = Vector3.scale(fromBoardCenter, 1 / boardScale.x)
  const length = Vector3.length(fromBoardCenterScaled)
  const fromBoardCenterScaledRotated = Vector3.rotate(fromBoardCenterScaled, inverseQuaternion(boardRot))
  const flatVector = Vector3.create(fromBoardCenterScaledRotated.x, fromBoardCenterScaledRotated.y, 0)
  const result = Vector3.scale(Vector3.normalize(flatVector), length)
  return result
}

export function localCoordsToCell(position: Vector3): Cell {
  const zeroPoint = { x: 0, y: 0 }
  zeroPoint.x += Math.floor((position.x + 0.5) / SELL_SIZE_RELATIVE)
  zeroPoint.y += Math.floor((position.y + 0.5) / SELL_SIZE_RELATIVE)
  
  // We need this check because the
  // position of raycast hit point with transformation to local coordinates may be a little bit out of board
  if (zeroPoint.x < 0) zeroPoint.x = 0
  if (zeroPoint.y < 0) zeroPoint.y = 0
  if (zeroPoint.x > BOARD_SIZE - 1) zeroPoint.x = BOARD_SIZE - 1
  if (zeroPoint.y > BOARD_SIZE - 1) zeroPoint.y = BOARD
  return zeroPoint
}

export function cellRelativePosition(cell: Cell): Vector3 {
  const zeroPoint = Vector3.create(-0.5 + 0.5 * SELL_SIZE_RELATIVE, -0.5 + 0.5 * SELL_SIZE_RELATIVE, 0)
  return Vector3.add(
    Vector3.add(zeroPoint, Vector3.scale(Vector3.create(SELL_SIZE_RELATIVE, 0, 0), cell.x)),
    Vector3.scale(Vector3.create(0, SELL_SIZE_RELATIVE, 0), cell.y)
  )
}

function inverseQuaternion(quaternion: Quaternion) {
  let normSquared = Quaternion.lengthSquared(quaternion)
  let conjugate = {
    w: quaternion.w,
    x: -quaternion.x,
    y: -quaternion.y,
    z: -quaternion.z
  }
  return {
    w: conjugate.w / normSquared,
    x: conjugate.x / normSquared,
    y: conjugate.y / normSquared,
    z: conjugate.z / normSquared
  }
}


export function getDirectionVector(direction: number) {
  switch (direction) {
    case 0:
      return Vector3.Up()
    case 1:
      return Vector3.Down()
    case 2:
      return Vector3.Left()
    case 3:
      return Vector3.Right()
  }
  return Vector3.Zero()
}