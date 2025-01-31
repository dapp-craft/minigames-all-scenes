import { CellData } from '../Cell'
import { Position } from '../Types'
import { Vector3 } from '@dcl/sdk/math'
import { Board } from '../Board'

export abstract class CellRenderer {
  protected _cellData: CellData
  protected _board: Board
  protected _cellScale: Vector3

  constructor(cell: CellData, board: Board) {
    this._cellData = cell
    this._board = board
    this._cellScale = { x: 1 / board.width, y: 1 / board.height, z: 1 }
  }
  /**
   * Implement this method to render the cell
   */
  public abstract render(): void

  /**
   * Implement this method to terminate the cell renderer
   * For example, if Cell type has changed
   */
  public abstract terminate(): void

  protected _relativePosition(position: Position, board: Board): Vector3 {
    const bWidth = board.width
    const bHeight = board.height
    const cellScale = { x: 1 / board.width, y: 1 / board.height, z: 1 }

    return {
      x: (position.x - bWidth / 2) / bWidth + cellScale.x / 2,
      y: (position.y - bHeight / 2) / bHeight + cellScale.y / 2,
      z: -0.001
    }
  }
}
