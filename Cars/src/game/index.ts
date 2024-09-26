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
import { BOARD_PHYSICAL_SIZE, BOARD_SIZE, CELL_SIZE_PHYSICAL, CELL_SIZE_RELATIVE, SYNC_ENTITY_ID } from '../config'
import { Car } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { BOARD, createBoard } from './objects/board'
import { createCar, createMainCar, getAllCars, getAllCarsExceptMain, getInGameCars, MAIN_CAR } from './objects/car'
import { calculateFinalDelta, createAvailabilityMap, getMovementDelta, markCarCellsAsAvailable } from './logic/board'
import { getLevel, MAX_LEVEL } from './levels'
import { fetchPlayerProgress, playerProgress, updatePlayerProgress } from './syncData'
import { getPlayer } from '@dcl/sdk/players'
import { countdown, initCountdownNumbers, setupWinAnimations, startWinAnimation } from './gameEffects'
import { queue } from '@dcl-sdk/mini-games/src'
import { movePlayerTo } from '~system/RestrictedActions'
import { playMoveCarSound } from './sfx'
import { levelButtons, setupGameUI } from './UiObjects'

let lookingAt: Cell | undefined = undefined

let inputAvailable = false

let lastStart = 0
let moveMade = false

export const gameState: {
  playerAddress: string
  playerName: string
  levelStartTime: number
  levelFinishTime: number
  level: number
  moves: number
} = {
  playerAddress: '',
  playerName: '',
  levelStartTime: 0,
  levelFinishTime: 0,
  level: 0,
  moves: 0
}

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
  initCountdownNumbers()

  setupWinAnimations()

  createBoard()

  setUpRaycast()

  setUpInputSystem()

  setUpSynchronizer()

  setupGameUI()

  createMainCar(SYNC_ENTITY_ID)

  for (let i = 0; i < (BOARD_SIZE * BOARD_SIZE) / 2 - 1; i++) {
    createCar(SYNC_ENTITY_ID + 1 + i)
  }

  await fetchPlayerProgress()
}

export function getReadyToStart() {
  console.log('Get ready to start')

  const levetToStart = (playerProgress?.level ?? 0) + 1 > MAX_LEVEL ? MAX_LEVEL : (playerProgress?.level ?? 0) + 1

  gameState.playerName = getPlayer()?.name ?? 'Underfined'
  gameState.playerAddress = getPlayer()?.userId ?? 'Underfined'

  for (let i = 0; i < levetToStart; i++) {
    levelButtons[i].enable()
  }

  utils.timers.setTimeout(() => {
    startLevel(levetToStart)
  }, 2000)
}

export function startLevel(level: number) {
  console.log('Start level', level)
  const start = ++lastStart

  clearInputBuffer()

  getAllCars().forEach((car) => {
    removeCarFromGame(car)
  })

  countdown(() => {
    if (start != lastStart) return
    gameState.levelStartTime = Date.now()
    gameState.levelFinishTime = 0
    gameState.level = level
    gameState.moves = 0
    inputAvailable = true
    loadLevel(level)
  }, 3)
}

function finishLevel() {
  clearInputBuffer()

  gameState.levelFinishTime = Date.now()

  updatePlayerProgress(gameState)
  if (queue.getQueue().length > 1) {
    exitGame()
  } else {
    const levelToStart = gameState.level == MAX_LEVEL ? 1 : gameState.level + 1
    levelButtons[levelToStart].enable()
    startLevel(levelToStart)
  }
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
      if (!inputAvailable) return
      // Update lookingAt
      if (hit.hits.length === 0) {
        inputBuffer.currentCell = undefined
        lookingAt = undefined
        return
      }
      const hitPosition = hit.hits[0].position
      if (hitPosition == undefined) {
        inputBuffer.currentCell = undefined
        lookingAt = undefined
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
      if (!inputAvailable) return
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
      if (!inputAvailable) return
      moveMade = false
      clearInputBuffer()
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

  if (finalDelta.x != 0 || finalDelta.y != 0) {
    playMoveCarSound()
    if (!moveMade) {
      gameState.moves += 1
      moveMade = true
    }
  }
  Car.getMutable(car).position = { x: carData.position.x + finalDelta.x, y: carData.position.y + finalDelta.y }
  inputBuffer.startCell = { x: start.x + finalDelta.x, y: start.y + finalDelta.y }

  if (isSolved()) {
    inputAvailable = false
    startWinAnimation(finishLevel)
  }
}

function isSolved() {
  const mainCar = Car.get(MAIN_CAR)
  if (mainCar.position.x == 5) {
    Car.getMutable(MAIN_CAR).position = { x: 9, y: 3 }
    return true
  }
  return false
}

function loadLevel(level: number) {
  const loadedLevel = getLevel(level)

  if (!loadedLevel.mainCar) throw new Error(`Could not init level ${level}`)
  Car.getMutable(MAIN_CAR).inGame = true
  Car.getMutable(MAIN_CAR).position = loadedLevel.mainCar.position
  // DIRTY HACK TO ROTATE THE MAIN CAR
  // TODO: rewrite level loading
  Car.getMutable(MAIN_CAR).position.x += 1
  Car.getMutable(MAIN_CAR).direction = CarDirection.right
  Car.getMutable(MAIN_CAR).length = loadedLevel.mainCar.length

  Car.getMutable(MAIN_CAR).inGame = true

  getAllCarsExceptMain().forEach((car, i) => {
    if (Car.get(car).isMain) return
    if (!loadedLevel.cars[i]) return
    const carData = loadedLevel.cars[i]
    Car.getMutable(car).inGame = true
    Car.getMutable(car).position = carData.position
    Car.getMutable(car).direction = carData.direction
    Car.getMutable(car).length = carData.length
  })
}

function removeCarFromGame(car: Entity) {
  Car.getMutable(car).inGame = false
  Car.getMutable(car).position = { x: -1, y: -1 }
  Car.getMutable(car).direction = CarDirection.right
}

export function exitGame() {
  clearInputBuffer()
  movePlayerTo({
    newRelativePosition: Vector3.create(8, 1, 14)
  })
  gameState.level = 1
  gameState.levelFinishTime = 0
  gameState.levelStartTime = 0
  gameState.moves = 0
  queue.setNextPlayer()
}

function clearInputBuffer() {
  inputBuffer.selectedCar = undefined
  inputBuffer.startCell = undefined
  inputBuffer.currentCell = undefined
}
