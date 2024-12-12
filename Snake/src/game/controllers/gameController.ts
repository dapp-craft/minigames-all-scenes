import { DeepReadonly, Entity, MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Food } from '../objects/food'
import { SnakeHead } from '../objects/snakeHead'
import { SnakeBody } from '../objects/snakeBody'
import { CellEnum, Direction, Drawable, Position, SnakePart } from '../objects/type'
import { BoardRenderer } from './boardRender'
import { playGameOverSound, playHitSound, playPowerUpSound, playStartSound } from '../sound'
import { updatePlayerProgress } from '../syncData'
import { runCountdown } from '../../../../common/effects'
import { Board } from '../components'
import { State } from '../synchronization/state'
import { SyncRenderer } from '../synchronization/syncRenderer'

export class GameController {
  private _boardSize: { width: number; height: number }
  private _snake: SnakeHead | undefined = undefined
  private _food: Food | undefined = undefined

  public boardRenderer: BoardRenderer | undefined

  public onStartCallback: () => void = () => {}
  public onFinishCallback: () => void = () => {}

  private _inGame: boolean = false // Game state
  private _isInit: boolean = false
  private _score: number = 0

  private _startTime: number = 0

  private _state = new State(Board)  
  private _syncRender: SyncRenderer
  // Is needed to not allow the snake to change direction several times in one frame
  // Otherwise, it is possible to turn the snake 180 degrees in one frame
  private _directionToUpdate: Direction | undefined = undefined

  private timer: number = 0
  private _speed: number = 0
  private system = (dt: number) => {
    this.timer += dt
    if (this.timer >= SPEED[this._speed]) {
      this.timer = 0
      this.update()
    }
  }

  constructor(width: number, height: number) {
    this._boardSize = { width, height }
    engine.addSystem(this.system)

    this._syncRender = new SyncRenderer(this)
    this._state.subscribe((state) => {
      if (state != undefined)
      this._syncRender.render(state)
    })
  }

  public async start() {
    this._inGame = true
    this._isInit = false
    
    this._syncRender.clean()

    await runCountdown()
    if (!this._inGame) return

    if (this._snake) {
        this._snake.terminate()
    }

    if (this._food) {
      this._food.terminate()
    }

    this._snake = new SnakeHead({ x: 10, y: 7 })
    this._snake.addTail()
    this._snake.addTail()

    
    this._score = 3
    this._startTime = Date.now()

    this.addFood()
    this.onStartCallback()

    this.setSnakeDirection(Direction.UP)
    playStartSound()
    this._isInit = true
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

    this._inGame = false
    playGameOverSound()
    this.onFinishCallback()
    this.upsertProgress()
  }

  private update() {
    if (!this._inGame) return
    if (!this._isInit) return

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
        if (this._speed == SPEED.length - 1) {
          // MAX speed
          scoreToAdd = +2
        }

        this._score += 1

        // Generate new food
        this.addFood()
      }
    }
    this.checkState()
    this.modifySpeed()
    this.updateSyncState()
  }

  public terminate() {
    if (!this._inGame) return
    this._inGame = false
    this._isInit = false
    
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
      return
    }

    this._directionToUpdate = dir
  }

  public updateSyncState():  void {

    if (!this.inGame) return

    const board: CellEnum[][] = []
    for (let i = 0; i < this._boardSize.height; i++) {
      board.push([])
      for (let j = 0; j < this._boardSize.width; j++) {
        board[i].push(CellEnum.EMPTY)
      }
    }

    let snakePart: SnakePart | undefined = this._snake
    while (snakePart) {
      board[snakePart.position.y][snakePart.position.x] = CellEnum.SNAKE
      snakePart = snakePart.next
    }

    if (this._food) {
      board[this._food.position.y][this._food.position.x] = CellEnum.FOOD
    }

    this._state.update({board: board})
    
  }

  public subscribeOnStateChange(callback: (state: any) => void) {
    this._state.subscribe(callback)
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

  public get speed(){
    return this._speed
  }

  public get isInit() {
    return this._isInit
  }

  public get startTime(){
    return this._startTime
  }
  
  public get score() {
    return this._score
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
    this._speed = Math.min(Math.floor(this._score / 5), SPEED.length - 1)
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

  private upsertProgress() {
    updatePlayerProgress(this._score, Date.now() - this._startTime)
  }
}

const SPEED = [0.6, 0.5, 0.4, 0.35, 0.3, 0.25, 0.20, 0.15, 0.10, 0.05] // Itervals between moves in seconds

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
