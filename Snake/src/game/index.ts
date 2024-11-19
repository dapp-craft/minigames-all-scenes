import { Vector3 } from '@dcl/sdk/math'
import { Board } from './objects/board'
import { SnakeHead } from './objects/snakeHead'
import { InputController } from './inputController'
import { engine } from '@dcl/sdk/ecs'
import { BoardRenderer } from './boardRender'
import { GameController } from './gameController'

const BoardPosition = Vector3.create(0.019831180572509766 + 8, 3.940518856048584, -5.991234302520752 + 8)

const inputController = new InputController()

const gameController = new GameController(20, 15)

const renderController = new BoardRenderer(BoardPosition, gameController)

export async function initGame() {
  inputController.gameController = gameController
}

export function startGame() {
  gameController.start()
}

export function finishGame() {
  gameController.finish()
}
