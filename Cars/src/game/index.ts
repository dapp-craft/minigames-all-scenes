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
import { Quaternion, Vector3, Color4 } from '@dcl/ecs-math'
import { CarDirection, Cell } from './type'
import { globalCoordsToLocal, localCoordsToCell, getDirectionVector, cellRelativePosition } from './logic/math'
import { BOARD_PHYSICAL_SIZE, BOARD_SIZE, CELL_SIZE_PHYSICAL, CELL_SIZE_RELATIVE } from '../config'
import { Car } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { BOARD, createBoard } from './objects/board'
import { createCar, getInGameCars } from './objects/car'
import { calculateFinalDelta, createAvailabilityMap, getMovementDelta, markCarCellsAsAvailable } from './logic/board'

let lookingAt: Cell | undefined = undefined

const inputBuffer: {
  selectedCar: Entity | undefined
  startCell: Cell | undefined
  currentCell: Cell | undefined
} = {
  selectedCar: undefined,
  startCell: undefined,
  currentCell: undefined
}

export async function initGame() {
  createBoard()

  createCar({ x: 4, y: 4 }, 2000)
  createCar({ x: 1, y: 1 }, 1001)
  createCar({ x: 3, y: 3 }, 1002)

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
        inputBuffer.currentCell = undefined
        return
      }
      const hitPosition = hit.hits[0].position
      if (hitPosition == undefined) {
        inputBuffer.currentCell = undefined
        return
      }
      const relativePosition = globalCoordsToLocal(hitPosition as Vector3)
      lookingAt = localCoordsToCell(relativePosition)

      // Update selectedCar
      if (inputBuffer.startCell == undefined) return
      inputBuffer.currentCell = lookingAt
      processMovement(inputBuffer.startCell, inputBuffer.currentCell)
    }
  )
}

function getCarAt(cell: Cell) {
  return getInGameCars().find((car) => {
    const carComponent = Car.get(car)
    const direction = getDirectionVector(carComponent.direction)
    const x = carComponent.position.x
    const y = carComponent.position.y
    const length = carComponent.length
    const xD = direction.x
    const yD = direction.y
    for (let i = 0; i < length; i++) {
      if (x + xD * i === cell.x && y + yD * i === cell.y) return true
    }
    return false
  })
}

function setUpInputSystem() {
  engine.addSystem(function () {
    if (
      inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN) &&
      PointerLock.get(engine.CameraEntity).isPointerLocked
    ) {
      if (lookingAt) {
        const car = getCarAt(lookingAt)
        if (car == undefined) return
        console.log(car)
        inputBuffer.selectedCar = car
        inputBuffer.startCell = lookingAt
      }
    }

    if (
      inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP) &&
      PointerLock.get(engine.CameraEntity).isPointerLocked
    ) {
      inputBuffer.selectedCar = undefined
      inputBuffer.startCell = undefined
      inputBuffer.currentCell = undefined
    }
  })
}

function processMovement(start: Cell, end: Cell) {
  if (!start || !end || !inputBuffer.selectedCar) return
  if (start.x === end.x && start.y === end.y) return

  const car = inputBuffer.selectedCar
  const carData = Car.get(car)

  const availabilityMap = createAvailabilityMap()
  markCarCellsAsAvailable(availabilityMap, car)

  const movementD = getMovementDelta(start, end, car)

  const finalDelta = calculateFinalDelta(car, movementD, availabilityMap, start)

  Car.getMutable(car).position = {x: carData.position.x + finalDelta.x, y: carData.position.y + finalDelta.y}
  inputBuffer.startCell = { x: start.x + finalDelta.x, y: start.y + finalDelta.y }
}