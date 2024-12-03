import { Entity } from '@dcl/sdk/ecs'
import { BOARD_SIZE } from '../../config'
import { Car } from '../components/definitions'
import { getInGameCars } from '../objects/car'
import { CarDirection, CarType, Cell } from '../type'
import { getDirectionVector } from './math'

export function createAvailabilityMap() {
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

export function markCarCellsAsAvailable(availabilityMap: number[][], car: Entity) {
  const carData = Car.get(car)
  const { x: xd, y: yd } = getDirectionVector(carData.direction)
  for (let i = 0; i < carData.length; i++) {
    availabilityMap[carData.position.y + yd * i][carData.position.x + xd * i] = 0
  }
}

export function markCarCellsAsAvailableCarData(availabilityMap: number[][], carData: CarType) {
  const { x: xd, y: yd } = getDirectionVector(carData.direction)
  for (let i = 0; i < carData.length; i++) {
    availabilityMap[carData.position.y + yd * i][carData.position.x + xd * i] = 0
  }
}

export function getMovementDelta(start: Cell, end: Cell, car: Entity): { x: number; y: number } {
  const carData = Car.get(car)
  const delta = {
    x: end.x - start.x,
    y: end.y - start.y
  }
  if (carData.direction === CarDirection.up || carData.direction === CarDirection.down) delta.x = 0
  if (carData.direction === CarDirection.left || carData.direction === CarDirection.right) delta.y = 0
  return delta
}

export function isPositionAvailable(cell: Cell, car: Entity, availabilityMap: number[][]): boolean {
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

export function isPositionAvailableCarData(cell: Cell, carData: CarType, availabilityMap: number[][]): boolean {
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

export function calculateFinalDelta(
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
