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
  raycastSystem,
  Texture,
  Transform,
  TransformType
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from '@dcl/ecs-math'
import { CarDirection, Cell } from './type'
import { cellRelativePosition, globalCoordsToLocal, localCoordsToCell, getDirectionVector } from './math'
import { BOARD_TRANSFORM, SELL_SIZE_RELATIVE } from '../config'
import { boardTexture } from '../resources/resources'
import { Car } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { syncEntity } from '@dcl/sdk/network'

let lookingAt: Cell | undefined = undefined
export let BOARD: Entity

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
  MeshCollider.setPlane(board, [ColliderLayer.CL_PHYSICS, ColliderLayer.CL_CUSTOM1])
  MeshRenderer.setPlane(board)
  BOARD = board
}

function drawPoint(cell: Cell, id: number) {
  const point = engine.addEntity()
  Transform.create(point, {
    position: cellRelativePosition(cell),
    scale: Vector3.scale(Vector3.One(), SELL_SIZE_RELATIVE),
    parent: BOARD
  })
  MeshRenderer.setSphere(point)
  MeshCollider.setSphere(point)
  Car.create(point, {
    position: cell,
    direction: CarDirection.left,
    length: 1,
    inGame: true
  })
  syncEntity(point, [Car.componentId], id)
  return point
}

export async function initGame() {
  createBoard(BOARD_TRANSFORM)

  drawPoint({ x: 3, y: 3 }, 1000)
  drawPoint({ x: 1, y: 1 }, 1001)
  drawPoint({ x: 2, y: 2 }, 1002)

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
      const {x: xd, y: yd} = movementDelta(selectedCar.startCell as Cell, selectedCar.currentCell as Cell)
      Car.getMutable(selectedCar.car).position.x += xd
      Car.getMutable(selectedCar.car).position.y += yd
      selectedCar.startCell = selectedCar.currentCell
    }
  )
}

function getCarAt(cell: Cell) {
  for (const [entity, name] of engine.getEntitiesWith(Car)){
    const car = Car.get(entity)
    if (car.position.x === cell.x && car.position.y === cell.y){
      return entity
    }
  }
  return undefined
}

function setUpInputSystem(){
  engine.addSystem(function(){
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN)){
      if (lookingAt){
        const car = getCarAt(lookingAt)
        if (car == undefined) return
        console.log(car)
        selectedCar.car = car
        selectedCar.startCell = lookingAt 
      }
    }

    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP)){
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