import { Entity } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Vector3 } from '@dcl/ecs-math'
import { CarDirection, Cell } from './type'
import { BOARD_SIZE, SYNC_ENTITY_ID } from '../config'
import { Car, CarsSpec } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { BOARD, createBoard } from './objects/board'
import {
  createCar,
  createMainCar,
  getAllCars,
  getAllCarsExceptMain,
  getCarsState,
  MAIN_CAR,
  removeCarFromGame,
  updateCarsState
} from './objects/car'
import { getLevel } from './levels'
import { MAX_LEVEL } from '../config'
import { fetchPlayerProgress, playerProgress, updatePlayerProgress } from './syncData'
import { getPlayer } from '@dcl/sdk/players'
import { runCountdown, setupEffects, cancelCountdown, cancelWinAnimation } from '../../../common/effects'
import { queue, ui } from '@dcl-sdk/mini-games/src'
import { playStartLevelSound, playWinSound } from './sfx'
import { levelButtons, setupGameUI } from './UiObjects'
import { initSelector, selectCar } from './selector'
import { initKeyboardInput } from './keyboardInput'
import { CreateStateSynchronizer } from './stateSync'

export let lookingAt: Cell | undefined = undefined

/**
 * Flag indicates if input is processed
 */
export let inputAvailable = false

export function setInputAvailable(value: boolean) {
  inputAvailable = value
}

const SyncState_ = CreateStateSynchronizer('carsState', CarsSpec, {
  update: async (state) => {
    if (inGame) return
    updateCarsState(state)
  }
})
export let SyncState: InstanceType<typeof SyncState_>

/**
 * Stores the last start
 * Is used to process multiple start requests in a row
 */
let lastStart = 0

/**
 * Flag indicates if a car has been moved in the current input cycle
 */
let moveMade = false

export let inGame = false

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

export const inputBuffer: {
  selectedCar: Entity | undefined
  startCell: Cell | undefined
  currentCell: Cell | undefined
} = {
  selectedCar: undefined,
  startCell: undefined,
  currentCell: undefined
}

export async function initGame() {
  setupEffects(Vector3.create(0, 2.5, -4))

  createBoard()

  initSelector()

  setUpSynchronizer()

  setupGameUI()

  initKeyboardInput()

  createMainCar(SYNC_ENTITY_ID)

  for (let i = 0; i < (BOARD_SIZE * BOARD_SIZE) / 2 - 1; i++) {
    createCar(SYNC_ENTITY_ID + 1 + i)
  }

  SyncState = new SyncState_()
  SyncState.start()

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

  startLevel(levetToStart)
}

export async function startLevel(level: number) {
  console.log('Start level', level)
  inputAvailable = false
  const start = ++lastStart
  inGame = true

  levelButtons.forEach((button, i) => {
    const buttonIndex = i
    const buttonDifficulty = Math.floor(buttonIndex / 5) as 0 | 1 | 2
    const buttonColor = {
      0: ui.uiAssets.shapes.SQUARE_GREEN,
      1: ui.uiAssets.shapes.SQUARE_YELLOW,
      2: ui.uiAssets.shapes.SQUARE_RED
    }
    button.buttonShapeEnabled = level === i + 1 ? ui.uiAssets.shapes.SQUARE_PURPLE : buttonColor[buttonDifficulty]
    if (button.enabled) button.enable()
  })

  playStartLevelSound()
  selectCar(undefined)

  clearInputBuffer()

  getAllCars().forEach((car) => {
    removeCarFromGame(car)
  })
  SyncState.send(getCarsState())

  await runCountdown()
  if (start != lastStart) return
  console.log('Start:', start, lastStart)
  gameState.levelStartTime = Date.now()
  gameState.levelFinishTime = 0
  gameState.level = level
  gameState.moves = 0
  loadLevel(level)
  SyncState.send(getCarsState())

  utils.timers.setTimeout(() => {
    if (start != lastStart) return
    inputAvailable = true
  }, 1000)
}

export function finishLevel() {
  clearInputBuffer()

  gameState.levelFinishTime = Date.now()

  updatePlayerProgress()
  if (queue.getQueue().length > 1) {
    exitGame()
  } else {
    const levelToStart = gameState.level == MAX_LEVEL ? 1 : gameState.level + 1
    levelButtons[levelToStart - 1].enable()
    if (!inGame) return
    startLevel(levelToStart)
  }
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

export function exitGame() {
  clearInputBuffer()
  cancelCountdown()
  cancelWinAnimation()
  selectCar(undefined)
  inGame = false
  lastStart = 0
  inputAvailable = false
  console.log('Exit game')

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
