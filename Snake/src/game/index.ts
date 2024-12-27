import { Vector3 } from '@dcl/sdk/math'
import { SnakeHead } from './objects/snakeHead'
import { InputController } from './controllers/inputController'
import { engine } from '@dcl/sdk/ecs'
import { BoardRenderer } from './controllers/boardRender'
import { GameController } from './controllers/gameController'
import { queue } from '@dcl-sdk/mini-games/src'
import { setupEffects } from '../../../common/effects'
import { setupGameUI } from './UiObjects'
import { updatePlayerProgress } from './syncData'
import { log } from './utils'
const inputController = new InputController()

export let gameController: GameController

export function initGame() {
  gameController = new GameController(20, 15)
  console.log("gameController created")

  inputController.gameController = gameController

  gameController.onFinishCallback = onFinish
  
  const renderController = new BoardRenderer(gameController)
  console.log("renderController created")
  
  setupEffects(Vector3.create(0, 2.5, -6), Vector3.create(0, 1.2, 0))

  setupGameUI().catch(e => {
    console.error(e)
    throw e
  })
}

export async function startGame() {
  log('Begin', startGame)
  
  gameController.start().catch(e => {
    console.error(e)
    throw e
  })
  log('Finish', startGame)
}

export async function onFinish() {
  log('Begin', onFinish)
  queue.setNextPlayer()
  log('Finish', onFinish)
}

export function finishGameButtonHandler() {
  console.log('Before terminate 1')
  gameController.terminate()
  console.log('After terminate 1')
}
