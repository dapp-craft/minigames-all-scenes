import { EasingFunction, Entity, GltfContainer, MeshRenderer, Transform, TransformType, Tween, Vector3Type, engine } from '@dcl/sdk/ecs'
import { getImage } from './image'
import { createTile } from '../gameObjects/tile'
import { Tile } from '../components/definitions'
import { getTilePosition } from './tileCalculation'
import { Vector3 } from '@dcl/sdk/math'
import { shuffleMatrix } from './shuffle'

const TileMoveDirection = {
  "UP": {row: -1, column: 0},
  "DOWN": {row: 1, column: 0},
  "LEFT": {row: 0, column: -1},
  "RIGHT": {row: 0, column: 1}
}


export class Board {
  readonly size: number
  private matrix: number[][]
  readonly image: string


  public mainEntity: Entity = engine.addEntity()

  constructor(position: TransformType, size: number, lvl: number) {
    // Setup the main entity
    Transform.create(this.mainEntity, position)

    this.size = size
    this.matrix = Array.from({ length: this.size }, (_, rowIndex) =>
      Array.from({ length: this.size }, (_, colIndex) => rowIndex * this.size + colIndex + 1)
    )
    this.matrix[this.size - 1][this.size - 1] = -1

    this.image = getImage(lvl)

    for (const i of this.matrix) {
      for (const tileNumber of i) {
        if (tileNumber === -1) continue
        createTile(this, tileNumber)
      }
    }

    shuffleMatrix(this.matrix, 100)

    this.updateAllTiles()
    
  }

  public updateAllTiles(): void {

    const tiles: { [key: number]: Entity } = {}
    for (const [tile] of engine.getEntitiesWith(Tile)) {
      tiles[Tile.get(tile).number] = tile
    }

    for (let row = 0; row < this.size; row++) {
      for (let column = 0; column < this.size; column++) {
        const tileNumber = this.matrix[row][column]
        if (tileNumber === -1) continue
        const tile = tiles[tileNumber]
        const position = getTilePosition(this.size, row, column)
        Transform.getMutable(tile).position = position
      }
    }
  }

  public updateTile(tileNumber: number): void {
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
        end: position,
      }),
      duration: 500,
      easingFunction: EasingFunction.EF_EASECUBIC
    })
  }

  public moveTile(tileNumber: number): void {
    this.validateTileNumber(tileNumber)

    const direction = this.getMoveDirection(tileNumber)
    if (direction === undefined) return
    const { row, column } = this.getRowColumn(tileNumber)
    const newRow = row + TileMoveDirection[direction].row
    const newColumn = column + TileMoveDirection[direction].column

    this.matrix[newRow][newColumn] = tileNumber
    this.matrix[row][column] = -1
    this.updateTile(tileNumber)
    
  }

  public getMoveDirection(tileNumber: number): keyof typeof TileMoveDirection | undefined{
    this.validateTileNumber(tileNumber)

    const { row, column } = this.getRowColumn(tileNumber)
    if (row === undefined || column! === undefined) return undefined
    if (row > 0 && this.matrix[row - 1][column] === -1) {
      console.log("Available move: Up")
      return "UP"
    }
    if (row! < this.size - 1 && this.matrix[row + 1][column!] === -1) {
      console.log("Available move: Down")
      return "DOWN"
    }
    if (column > 0 && this.matrix[row][column - 1] === -1) {
      console.log("Available move: Left")
      return "LEFT"
    }
    if (column < this.size - 1 && this.matrix[row][column + 1] === -1) {
      console.log("Available move: Right")
      return "RIGHT"
    }
    console.log("No available moves")
    return undefined
  }

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

  private validateTileNumber(tileNumber: number) {
    if (!(tileNumber >= 1 && tileNumber < this.size * this.size)) throw new Error("Invalid tile number")
  }
}
