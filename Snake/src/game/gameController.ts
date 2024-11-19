import { MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Board } from './objects/board'
import { Food } from './objects/food'
import { SnakeHead } from './objects/snakeHead'
import { SnakeBody } from './objects/snakeBody'
import { Direction, Drawable, Position, SnakePart } from './objects/type'
import { BoardRenderer } from './boardRender'

export class GameController {
  private _boardSize: { width: number; height: number }
  private _snake: SnakeHead | undefined = undefined
  private _food: Food | undefined = undefined

  public boardRenderer: BoardRenderer | undefined

  public onStartCallback: () => void = () => {}
  public onFinishCallback: () => void = () => {}

  private _inGame: boolean = false // Game state
  private score: number = 0

  private timer: number = 0
  private speed: number = 0
  private system = (dt: number) => {
    this.timer += dt
    if (this.timer >= SPEED[this.speed]) {
      this.timer = 0
      this.update()
    }
  }

  constructor(width: number, height: number) {
    this._boardSize = { width, height }
    engine.addSystem(this.system)
  }

  public start() {
    if (this._snake) {
      let snakePart: SnakePart | undefined = this._snake
      if (snakePart) {
        while (snakePart) {
          snakePart.terminate()
          snakePart = snakePart.next
        }
      }
    }

    if (this._food) {
      this._food.terminate()
    }

    this._snake = new SnakeHead({ x: 0, y: 0 })
    this._snake.addTail()
    this._snake.addTail()

    this._inGame = true
    this.score = 0
    this.addFood()
    this.onStartCallback()
  }

  public finish() {
    console.log('Game Over')
    let snakePart: SnakePart | undefined = this._snake
    if (snakePart) {
      while (snakePart) {
        snakePart.terminate()
        snakePart = snakePart.next
      }
    }

    if (this._food) {
      this._food.terminate()
    }

    this._inGame = false
    this.onFinishCallback()
  }

  private update() {
    if (!this._inGame) return

    // Move the snake
    if (this._snake) this._snake.move()

    // Check if snake eats the food
    if (this._snake && this._food) {
      if (this._snake.position.x === this._food.position.x && this._snake.position.y === this._food.position.y) {
        this._snake.addTail()
        this._food.terminate()
        this._food = undefined

        // Update score
        let scoreToAdd = 1
        if (this.speed == SPEED.length - 1) {
          // MAX speed
          scoreToAdd = +2
        }

        let snakeLength = this._snake.getLength()
        let multiplier = 1
        if (snakeLength > 20) multiplier = 1.5
        if (snakeLength > 40) multiplier = 2

        this.score += scoreToAdd * multiplier

        // Generate new food
        this.addFood()
      }
    }

    this.checkState()
  }

  public setSnakeDirection(dir: Direction) {
    if (this._snake) this._snake.direction = dir
  }

  public get snake(): SnakePart | undefined {
    return this._snake
  }

  public get food() {
    return this._food
  }

  public get boardSize() {
    return this._boardSize
  }

  public get inGame() {
    return this._inGame
  }

  private addFood() {
    if (!this._snake) {
      throw new Error('Failed to add Food: Snake is not initialized')
    }
    let pos
    do {
      pos = generateFoodPosition(this._boardSize)
    } while (!validateFoodPosition(pos, this._snake))
    this._food = new Food(pos)
  }

  private checkState() {
    // Check if the snake is out of the board
    if (this._snake) {
      const head = this._snake
      if (
        head.position.x < 0 ||
        head.position.x >= this._boardSize.width ||
        head.position.y < 0 ||
        head.position.y >= this._boardSize.height
      ) {
        this.finish()
      }
    }
  }

  private modifySpeed() {}
}

const SPEED = [1, 0.8, 0.6, 0.5] // Itervals between moves in seconds

function generateFoodPosition(boardSize: { width: number; height: number }) {
  return {
    x: Math.floor(Math.random() * boardSize.width),
    y: Math.floor(Math.random() * boardSize.height)
  }
}

function validateFoodPosition(pos: Position, snake: SnakeHead) {
  let snakePart: any = snake
  while (snakePart) {
    if (snakePart.position.x === pos.x && snakePart.position.y === pos.y) {
      return false
    }
    snakePart = snakePart.next
  }
  return true
}
