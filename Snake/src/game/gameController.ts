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
    this._snake.addTail()
    this._snake.addTail()
    this._snake.addTail()
    this._snake.addTail()
    this._snake.addTail()
    this._snake.addTail()
  }

  public finish() {
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
  }

  private update() {
    // Move the snake
    if (this._snake) this._snake.move()

    // Check if snake eats the food
    if (this._snake && this._food) {
      if (this._snake.position.x === this._food.position.x && this._snake.position.y === this._food.position.y) {
        this._snake.addTail()
        this._food.terminate()
        this._food = undefined
        // Update score
        this.score += 1
      }
    }
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
}
const SPEED = [1, 0.8, 0.6, 0.5] // Itervals between moves in seconds
