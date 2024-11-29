import { MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Board } from './objects/board'
import { Food } from './objects/food'
import { SnakeHead } from './objects/snakeHead'
import { SnakeBody } from './objects/snakeBody'
import { Direction, Drawable, Position, SnakePart } from './objects/type'
import { BoardRenderer } from './boardRender'
import { playGameOverSound, playHitSound, playPowerUpSound, playStartSound } from './sound'
export class GameController {
  private _boardSize: { width: number; height: number }
  private _snake: SnakeHead | undefined = undefined
  private _food: Food | undefined = undefined

  public boardRenderer: BoardRenderer | undefined

  public onStartCallback: () => void = () => {}
  public onFinishCallback: () => void = () => {}

  private _inGame: boolean = false // Game state
  private score: number = 0

  // Is needed to not allow the snake to change direction several times in one frame
  // Otherwise, it is possible to turn the snake 180 degrees in one frame
  private _directionToUpdate: Direction | undefined = undefined

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

    this.setSnakeDirection(Direction.UP)

    playStartSound()
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
    playGameOverSound()
    this.onFinishCallback()
  }

  private update() {
    if (!this._inGame) return

    // Update snake direction
    if (this._directionToUpdate != undefined) {
      if (this._snake) {
        this._snake.direction = this._directionToUpdate
      }
    }

    // Move the snake
    if (this._snake) this._snake.move()

    if (this.checkCollision()) {
      playHitSound()
      this.finish()
      return
    }

    // Check if snake eats the food
    if (this._snake && this._food) {
      if (this._snake.position.x === this._food.position.x && this._snake.position.y === this._food.position.y) {
        this._snake.addTail()
        this._food.terminate()
        this._food = undefined

        playPowerUpSound()

        // Update score
        let scoreToAdd = 1
        if (this.speed == SPEED.length - 1) {
          // MAX speed
          scoreToAdd = +2
        }

        this.score += 4

        // Generate new food
        this.addFood()
      }
    }

    this.checkState()
    this.modifySpeed()
  }

  public setSnakeDirection(dir: Direction) {
    if (!this._snake) return

    const opposite = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    }

    if (opposite[dir] == this._snake?.direction) {
      console.log('Invalid direction')
      return
    }

    this._directionToUpdate = dir
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
        playHitSound()
        this.finish()
      }
    }
  }

  private modifySpeed() {
    this.speed = Math.min(Math.floor(this.score / 5), 10)
  }

  private checkCollision() {
    if (!this._snake) return

    let snakeHeadPos = this._snake.position

    let snakePart: SnakePart | undefined = this._snake.next
    while (snakePart) {
      if (snakePart.position.x === snakeHeadPos.x && snakePart.position.y === snakeHeadPos.y) {
        return true
      }
      snakePart = snakePart.next
    }
    return false
  }
}

const SPEED = [0.85, 0.8, 0.75, 0.7, 0.65, 0.6, 0.55, 0.55, 0.5, 0.5, 0.45] // Itervals between moves in seconds

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
