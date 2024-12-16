import { Vector3 } from '@dcl/sdk/math'
import { SnakeHead } from './objects/snakeHead'
import { InputController } from './controllers/inputController'
import { engine } from '@dcl/sdk/ecs'
import { BoardRenderer } from './controllers/boardRender'
import { GameController } from './controllers/gameController'
import { queue } from '@dcl-sdk/mini-games/src'
import { initCamera, activateCamera, deactivateCamera } from './camera'
import { setupEffects } from '../../../common/effects'
import { setupGameUI } from './UiObjects'
import { updatePlayerProgress } from './syncData'
import { log } from './utils'
const inputController = new InputController()

export let gameController: GameController

export async function initGame() {
  gameController = new GameController(20, 15)

  inputController.gameController = gameController

  gameController.onFinishCallback = onFinish
  
  const renderController = new BoardRenderer(gameController)
  
  setupEffects(Vector3.create(0, 2.5, -6), Vector3.create(0, 1.2, 0))

  setupGameUI()

  initCamera()
}

export async function startGame() {
  log('Begin', startGame)
  activateCamera()
  gameController.start()
  log('Finish', startGame)
}

export async function onFinish() {
  log('Begin', onFinish)
  deactivateCamera()
  queue.setNextPlayer()
  log('Finish', onFinish)
}

export function finishGameButtonHandler() {
  console.log('Before terminate 1')
  gameController.terminate()
  console.log('After terminate 1')
  deactivateCamera()
}
