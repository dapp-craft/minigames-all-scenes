import {
  EasingFunction,
  Entity,
  GltfContainer,
  MeshRenderer,
  Transform,
  TransformType,
  Tween,
  Vector3Type,
  engine
} from '@dcl/sdk/ecs'
import { getImage } from './image'
import { createTile } from '../gameObjects/tile'
import { Tile } from '../components/definitions'
import { getTilePosition } from './tileCalculation'
import { Vector3 } from '@dcl/sdk/math'
import { shuffleMatrix } from './shuffle'

const TileMoveDirection = {
  UP: { row: -1, column: 0 },
  DOWN: { row: 1, column: 0 },
  LEFT: { row: 0, column: -1 },
  RIGHT: { row: 0, column: 1 }
}

export class Board {
  readonly size: number
  private matrix: number[][]
  readonly image: string

  readonly startTime = Date.now()
  public steps = 0

  public mainEntity: Entity = engine.addEntity()

  private onSolve: (time: number, steps: number) => void

  constructor(position: TransformType, size: number, lvl: number, onSolved: (time: number, steps: number) => void = () => {}) {
    // Setup the main entity
    this.onSolve = onSolved
    this.size = size
    this.matrix = Array.from({ length: this.size }, (_, rowIndex) =>
      Array.from({ length: this.size }, (_, colIndex) => rowIndex * this.size + colIndex + 1)
    )
    this.matrix[this.size - 1][this.size - 1] = -1
    this.image = getImage(lvl)

    Transform.create(this.mainEntity, position)


    for (const i of this.matrix) {
      for (const tileNumber of i) {
        if (tileNumber === -1) continue
        createTile(this, tileNumber)
      }
    }

    shuffleMatrix(this.matrix, 100)

    for (let i = 1; i < this.size * this.size; i++) {
      this.updateTile(i)
    }
  }

  public moveMultipleTiles(tileNumber: number): void {
    this.validateTileNumber(tileNumber)
    let tilesToMove: number[] = []

    const { row, column } = this.getRowColumn(tileNumber)

    // Up
    for (let i = row - 1; i >= 0; i--) {
      tilesToMove.push(this.matrix[i + 1][column])
      if (this.matrix[i][column] === -1) {
        tilesToMove.reverse()
        tilesToMove.forEach((tile) => this.moveOneTile(tile))
        return
      }
    }
    tilesToMove = []

    // Down
    for (let i = row + 1; i < this.size; i++) {
      tilesToMove.push(this.matrix[i - 1][column])
      if (this.matrix[i][column] === -1) {
        tilesToMove.reverse()
        tilesToMove.forEach((tile) => this.moveOneTile(tile))
        return
      }
    }
    tilesToMove = []

    // Left
    for (let i = column - 1; i >= 0; i--) {
      tilesToMove.push(this.matrix[row][i + 1])
      if (this.matrix[row][i] === -1) {
        tilesToMove.reverse()
        tilesToMove.forEach((tile) => this.moveOneTile(tile))
        return
      }
    }
    tilesToMove = []

    // Right
    for (let i = column + 1; i < this.size; i++) {
      tilesToMove.push(this.matrix[row][i - 1])
      if (this.matrix[row][i] === -1) {
        tilesToMove.reverse()
        tilesToMove.forEach((tile) => this.moveOneTile(tile))
        return
      }
    }
  }

  private updateTile(tileNumber: number): void {
    this.validateTileNumber(tileNumber)

    let tile
    for (const [t] of engine.getEntitiesWith(Tile)) {
      if (Tile.get(t).number === tileNumber) {
        tile = t
        break
      }
    }

    const { row, column } = this.getRowColumn(tileNumber)

    const position = getTilePosition(this.size, row, column)
    // Transform.getMutable(tile!).position = position

    Tween.createOrReplace(tile!, {
      mode: Tween.Mode.Move({
        start: Transform.getMutable(tile!).position,
        end: position
      }),
      duration: 500,
      easingFunction: EasingFunction.EF_EASECUBIC
    })
  }

  private moveOneTile(tileNumber: number): void {
    this.validateTileNumber(tileNumber)

    const direction = this.getMoveDirection(tileNumber)
    if (direction === undefined) return
    const { row, column } = this.getRowColumn(tileNumber)
    const newRow = row + TileMoveDirection[direction].row
    const newColumn = column + TileMoveDirection[direction].column

    this.matrix[newRow][newColumn] = tileNumber
    this.matrix[row][column] = -1
    this.updateTile(tileNumber)
    this.steps++
    if (this.isSolved()) {
      this.terminate()
      this.onSolve(Date.now() - this.startTime, this.steps)
    }
  }

  private getMoveDirection(tileNumber: number): keyof typeof TileMoveDirection | undefined {
    this.validateTileNumber(tileNumber)

    const { row, column } = this.getRowColumn(tileNumber)
    if (row === undefined || column! === undefined) return undefined
    if (row > 0 && this.matrix[row - 1][column] === -1) {
      console.log('Available move: Up')
      return 'UP'
    }
    if (row! < this.size - 1 && this.matrix[row + 1][column!] === -1) {
      return 'DOWN'
    }
    if (column > 0 && this.matrix[row][column - 1] === -1) {
      return 'LEFT'
    }
    if (column < this.size - 1 && this.matrix[row][column + 1] === -1) {
      return 'RIGHT'
    }
    return undefined
  }

  /**
   * Get the tile position in the matrix
   * @param tileNumber number of the tile in the board starting from 1
   * @returns return the row and column of the tile in the board, starting from 0
   */
  private getRowColumn(tileNumber: number): { row: number; column: number } {
    this.validateTileNumber(tileNumber)
    let row: number
    let column: number
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.matrix[i][j] === tileNumber) {
          row = i
          column = j
          break
        }
      }
    }
    return { row: row!, column: column! }
  }

  /**
   * Validate if the tile number is existing in the board (-1 is invalid)
   * @param tileNumber number of the tile in the board starting from 1
   */
  private validateTileNumber(tileNumber: number) {
    if (!(tileNumber >= 1 && tileNumber < this.size * this.size)) throw new Error('Invalid tile number')
  }

  private isSolved(): boolean {
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        if (this.matrix[i][j] === -1) continue
        if (this.matrix[i][j] !== i * this.size + j + 1) {
          return false
        }
      }
    }
    return true
  }

  public terminate(): void {
    engine.removeEntityWithChildren(this.mainEntity)
  }
}
