import { Vector3 } from '@dcl/sdk/math'
import { Board } from './objects/board'
import { SnakeHead } from './objects/snakeHead'
import { InputController } from './inputController'
import { engine } from '@dcl/sdk/ecs'
import { BoardRenderer } from './boardRender'
import { GameController } from './gameController'
import { queue } from '@dcl-sdk/mini-games/src'
import { initCamera, activateCamera, deactivateCamera } from './camera'

const inputController = new InputController()

const gameController = new GameController(20, 15)

const renderController = new BoardRenderer(gameController)

export async function initGame() {
  inputController.gameController = gameController
  gameController.onFinishCallback = onFinish

  initCamera()
}

export async function startGame() {
  activateCamera()
  // activateCamera()
  gameController.start()
}

export async function onFinish() {
  deactivateCamera()
  queue.setNextPlayer()
}

export function finishGameButtonHandler() {
  gameController.finish()
  onFinish()
}
