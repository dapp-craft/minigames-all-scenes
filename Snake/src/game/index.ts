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

const inputController = new InputController()

export const gameController = new GameController(20, 15)

const renderController = new BoardRenderer(gameController)

export async function initGame() {
  inputController.gameController = gameController
  gameController.onFinishCallback = onFinish

  setupEffects(Vector3.create(0, 2.5, -6), Vector3.create(0, 1.2, 0))

  setupGameUI()

  initCamera()
}

export async function startGame() {
  activateCamera()
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
