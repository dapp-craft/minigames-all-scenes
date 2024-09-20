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
import { globalCoordsToLocal, localCoordsToCell, getDirectionVector, cellRelativePosition } from './math'
import { BOARD_PHYSICAL_SIZE, BOARD_SIZE, CELL_SIZE_PHYSICAL, CELL_SIZE_RELATIVE } from '../config'
import { Car } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { BOARD, createBoard } from './objects/board'
import { createCar, getInGameCars } from './objects/car'

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

function createAvailabilityMap() {
  const availabilityMap = Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(0))

  getInGameCars().forEach((car_) => {
    const carData = Car.get(car_)
    const { x: xd, y: yd } = getDirectionVector(carData.direction)
    for (let i = 0; i < carData.length; i++) {
      availabilityMap[carData.position.y + yd * i][carData.position.x + xd * i] = 1
    }
  })

  return availabilityMap
}

function markCarCellsAsAvailable(availabilityMap: number[][], car: Entity) {
  const carData = Car.get(car)
  const { x: xd, y: yd } = getDirectionVector(carData.direction)
  for (let i = 0; i < carData.length; i++) {
    availabilityMap[carData.position.y + yd * i][carData.position.x + xd * i] = 0
  }
}

function getMovementDelta(start: Cell, end: Cell, car: Entity): { x: number; y: number } {
  const carData = Car.get(car)
  const delta = {
    x: end.x - start.x,
    y: end.y - start.y
  }
  if (carData.direction === CarDirection.up || carData.direction === CarDirection.down) delta.x = 0
  if (carData.direction === CarDirection.left || carData.direction === CarDirection.right) delta.y = 0
  return delta
}

function isPositionAvailable(cell: Cell, car: Entity, availabilityMap: number[][]): boolean {
  const carData = Car.get(car)
  const { x: xd, y: yd } = getDirectionVector(carData.direction)
  for (let i = 0; i < carData.length; i++) {
    const newY = cell.y + yd * i
    const newX = cell.x + xd * i
    if (newY < 0 || newY >= BOARD_SIZE || newX < 0 || newX >= BOARD_SIZE || availabilityMap[newY][newX] === 1) {
      return false
    }
  }
  return true
}

function calculateFinalDelta(
  car: Entity,
  movementD: { x: number; y: number },
  availabilityMap: number[][],
  start: Cell
): Cell {
  if (!Car.getOrNull(car)) console.error('Car not found')
  const carData = Car.get(car)
  const distance = Math.abs(movementD.x + movementD.y)
  let finalDelta = { x: 0, y: 0 }
  for (let i = 0; i <= distance; i++) {
    const xd = movementD.x === 0 ? 0 : Math.sign(movementD.x)
    const yd = movementD.y === 0 ? 0 : Math.sign(movementD.y)
    const possiblePosition: Cell = {
      x: carData.position.x + xd * i,
      y: carData.position.y + yd * i
    }

    if (isPositionAvailable(possiblePosition, car, availabilityMap)) {
      finalDelta = { x: xd * i, y: yd * i }
    } else {
      break
    }
  }

  return finalDelta
}
