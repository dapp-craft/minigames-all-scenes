import {
  ColliderLayer,
  engine,
  Entity,
  executeTask,
  GltfContainer,
  InputAction,
  inputSystem,
  Material,
  MeshCollider,
  MeshRenderer,
  PointerEventType,
  PointerLock,
  raycastSystem,
  Texture,
  Transform,
  TransformType
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from '@dcl/ecs-math'
import { CarDirection, Cell } from './type'
import { cellRelativePosition, globalCoordsToLocal, localCoordsToCell, getDirectionVector } from './math'
import { BOARD_TRANSFORM, CELL_SIZE_PHYSICAL, CELL_SIZE_RELATIVE } from '../config'
import { boardTexture, carModels } from '../resources/resources'
import { Car } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { syncEntity } from '@dcl/sdk/network'

let lookingAt: Cell | undefined = undefined
export let BOARD: Entity
export let BOARD_COLLIDER: Entity

const selectedCar: {
  car: Entity | undefined,
  startCell: Cell | undefined
  currentCell: Cell | undefined
} = {
  car: undefined,
  startCell: undefined,
  currentCell: undefined
}

function createBoard(tranform: TransformType) {
  const board = engine.addEntity()
  Transform.create(board, tranform)
  Material.setPbrMaterial(board, {
    texture: Material.Texture.Common({
      src: boardTexture
    })
  })
  MeshRenderer.setPlane(board)
  BOARD = board

  const boardCollider = engine.addEntity()
  Transform.create(boardCollider, {
    position: Vector3.create(0, 0, -0.025),
    parent: board
  })
  MeshCollider.setPlane(boardCollider, [ColliderLayer.CL_PHYSICS, ColliderLayer.CL_CUSTOM1])
  BOARD_COLLIDER = boardCollider

}

function drawPoint(cell: Cell, id: number) {
  const point = engine.addEntity()
  Transform.create(point, {
    position: cellRelativePosition(cell),
    scale: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
    rotation: Quaternion.Identity(),
    parent: BOARD
  })
  GltfContainer.create(point, carModels[2])
  Car.create(point, {
    position: cell,
    direction: Math.floor(Math.random() * 4) as CarDirection,
    length: 2,
    inGame: true
  })
  syncEntity(point, [Car.componentId], id)
  return point
}

export async function initGame() {
  createBoard(BOARD_TRANSFORM)

  drawPoint({ x: 4, y: 4 }, 1000)
  drawPoint({ x: 1, y: 1 }, 1001)
  drawPoint({ x: 3, y: 3 }, 1002)

  setUpRaycast()

  setUpInputSystem()

  setUpSynchronizer()
}

function setUpRaycast() {
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

      // Update lookingAt
      if (hit.hits.length === 0) {
        lookingAt = undefined
        return
      }
      const hitPosition = hit.hits[0].position
      if (hitPosition == undefined) {
        lookingAt = undefined
        return
      }
      const relativePosition = globalCoordsToLocal(hitPosition as Vector3)
      lookingAt = localCoordsToCell(relativePosition)

      // Update selectedCar
      if (selectedCar.car == undefined) return
      if (lookingAt.x == selectedCar.currentCell?.x && lookingAt.y == selectedCar.currentCell?.y) return
      selectedCar.currentCell = lookingAt
      let {x: xd, y: yd} = movementDelta(selectedCar.startCell as Cell, selectedCar.currentCell as Cell)
      if (Car.get(selectedCar.car).direction === CarDirection.up || Car.get(selectedCar.car).direction === CarDirection.down){
        xd = 0
      } else {
        yd = 0
      }
      Car.getMutable(selectedCar.car).position.x += xd
      Car.getMutable(selectedCar.car).position.y += yd
      selectedCar.startCell = selectedCar.currentCell
    }
  )
}

function getCarAt(cell: Cell) {
  for (const [entity, name] of engine.getEntitiesWith(Car)){
    const car = Car.get(entity)
    if (!car.inGame) continue
      const length = car.length
      const direction = getDirectionVector(car.direction)
      const yD = direction.y
      const xD = direction.x
      for (let i = 0; i < length; i++){
        if (car.position.x + xD * i === cell.x && car.position.y + yD * i === cell.y)
        return entity
      }
  }
  return undefined
}

function setUpInputSystem(){
  engine.addSystem(function(){
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN) && PointerLock.get(engine.CameraEntity).isPointerLocked){
      if (lookingAt){
        const car = getCarAt(lookingAt)
        if (car == undefined) return
        console.log(car)
        selectedCar.car = car
        selectedCar.startCell = lookingAt 
      }
    }

    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP) && PointerLock.get(engine.CameraEntity).isPointerLocked){
      selectedCar.car = undefined
      selectedCar.startCell = undefined
      selectedCar.currentCell = undefined
    }
  })
}


function movementDelta(start: Cell, end: Cell) {
  // TODO: movement only in direvtion of the car
  return {
    x: end.x - start.x,
    y: end.y - start.y
  }
}