import { Vector3 } from '@dcl/sdk/math'
import { Board } from './objects/board'
import { SnakeHead } from './objects/snakeHead'
import { InputController } from './inputController'
import { engine } from '@dcl/sdk/ecs'
import { BoardRenderer } from './boardRender'
import { GameController } from './gameController'
import { queue } from '@dcl-sdk/mini-games/src'
import { initCamera, activateCamera, deactivateCamera } from './camera'
import { setupEffects } from '../../../common/effects'
import { setupGameUI } from './UiObjects'
import { updatePlayerProgress } from './syncData'
import { log } from './utils'

const inputController = new InputController()

export const gameController = new GameController(20, 15)


export async function initGame() {
  log('Start Initializing gameController', initGame)
  inputController.gameController = gameController
  log('Finish Initializing inputController', initGame)

  gameController.onFinishCallback = onFinish
  
  log('Start Initializing renderController', initGame)
  const renderController = new BoardRenderer(gameController)
  log('Finish Initializing renderController', initGame)
  
  log('Start Initializing setupEffects', initGame)
  setupEffects(Vector3.create(0, 2.5, -6), Vector3.create(0, 1.2, 0))
  log('Finish Initializing setupEffects', initGame)

  log('Start Initializing setupGameUI', initGame)
  setupGameUI()
  log('Finish Initializing setupGameUI', initGame)

  log('Start Initializing initCamera', initGame)
  initCamera()
  log('Finish Initializing initCamera', initGame)
}

export async function startGame() {
  log('Start Camera activation', startGame)
  activateCamera()
  log('Finish Camera activation', startGame)
  gameController.start()
}

export async function onFinish() {
  deactivateCamera()
  queue.setNextPlayer()
}

export function finishGameButtonHandler() {
  gameController.terminate()
  deactivateCamera()
}
