import {
  ColliderLayer,
  engine,
  Entity,
  executeTask,
  GltfContainer,
  Material,
  MeshCollider,
  MeshRenderer,
  raycastSystem,
  Texture,
  Transform,
  TransformType
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from '@dcl/ecs-math'
import { Cell } from './type'
import { cellRelativePosition, globalCoordsToLocal, localCoordsToCell } from './math'
import { BOARD_TRANSFORM, SELL_SIZE_RELATIVE } from '../config'
import { boardTexture } from '../resources/resources'

let lookingAt: Cell | undefined = undefined
export let BOARD: Entity

function createBoard(tranform: TransformType) {
  const board = engine.addEntity()
  Transform.create(board, tranform)
  Material.setPbrMaterial(board, {
    texture: Material.Texture.Common({
      src: boardTexture
    })
  })
  MeshCollider.setPlane(board, [ColliderLayer.CL_PHYSICS, ColliderLayer.CL_CUSTOM1])
  MeshRenderer.setPlane(board)
  BOARD = board
}



function drawPoint(cell: Cell) {
  const point = engine.addEntity()
  Transform.create(point, {
    position: cellRelativePosition(cell),
    scale: Vector3.scale(Vector3.One(), SELL_SIZE_RELATIVE),
    parent: BOARD
  })
  MeshRenderer.setSphere(point)
  MeshCollider.setSphere(point)
  return point
}






export async function initGame() {
  createBoard(BOARD_TRANSFORM)

  engine.addSystem((dt) => {
    Transform.getMutable(BOARD).rotation = Quaternion.multiply(Transform.get(BOARD).rotation, Quaternion.fromEulerDegrees(0, 0.05, 0.1))
  })

  const pointer = engine.addEntity()
  Transform.create(pointer, {
    scale: Vector3.scale(Vector3.One(), 0.02),
    parent: BOARD
  })
  MeshRenderer.setBox(pointer)
  

  drawPoint({ x: 1, y: 0 })

  raycastSystem.registerLocalDirectionRaycast(
    {
      entity: engine.CameraEntity,
      opts: {
        direction: Vector3.Forward(),
        continuous: true,
        collisionMask: ColliderLayer.CL_CUSTOM1
      }
    },
    (hit) => {
      if (hit.hits.length === 0) {
        lookingAt = undefined
        return
      }
      const hitPosition = hit.hits[0].position
      if (hitPosition == undefined) return
      const relativePosition = globalCoordsToLocal(hitPosition as Vector3)

      const cell = localCoordsToCell(relativePosition)

      Transform.getMutable(pointer).position = cellRelativePosition(cell)
      // console.log(localPosition)
    }
  )
}


