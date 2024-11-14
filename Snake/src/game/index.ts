import { Vector3 } from '@dcl/sdk/math'
import { Board } from './objects/board'
import { SnakeHead } from './objects/snakeHead'
import { InputController } from './inputController'
import { engine } from '@dcl/sdk/ecs'
import { BoardRenderer } from './boardRender'
import { GameController } from './gameController'

const BoardPosition = Vector3.create(8, 3, 8)

const inputController = new InputController()

const gameController = new GameController(10, 10)

const renderController = new BoardRenderer(BoardPosition, gameController)

export async function initGame() {
  gameController.start()
  inputController.gameController = gameController
  console.log('Game started')
  console.log('Snake:', gameController.snake)
}
