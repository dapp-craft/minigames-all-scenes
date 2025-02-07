import { CellType, Direction, Position } from './Types'

export type CellData<T extends CellType = CellType> = {
  type: T
  position: Position
}

export class Cell<TCellType extends CellType = CellType> {
  private _type: TCellType
  private _cells: Map<Direction, Cell<TCellType> | null>
  private _position: Position

  constructor(x: number, y: number, type: TCellType) {
    this._type = type
    this._position = { x, y }
    this._cells = new Map([
      [Direction.TOP, null],
      [Direction.RIGHT, null],
      [Direction.BOTTOM, null],
      [Direction.LEFT, null]
    ])
  }

  public get type(): TCellType {
    return this.data.type
  }

  public set type(type: TCellType) {
    this._type = type
  }

  public get data(): CellData<TCellType> {
    return {
      type: this._type,
      position: this._position
    }
  }

  public getNeighbor(direction: Direction): Cell<TCellType> | null {
    return this._cells.get(direction) || null
  }

  public getAllNeighbors(): Cell<TCellType>[] {
    return Array.from(this._cells.values()).filter((cell): cell is Cell<TCellType> => cell !== null)
  }

  public toString(): string {
    return `Cell: (${this._position.x}, ${this._position.y}) with type ${this._type}`
  }

  public isNeighbor(cell: Cell<TCellType>): boolean {
    return this.getAllNeighbors().includes(cell)
  }

  public get position(): Position {
    return { x: this._position.x, y: this._position.y }
  }

  public static areAdjacent<T extends CellType>(cell1: Cell<T>, cell2: Cell<T>): boolean {
    const pos1 = cell1.position
    const pos2 = cell2.position

    const xDiff = Math.abs(pos1.x - pos2.x)
    const yDiff = Math.abs(pos1.y - pos2.y)

    return (xDiff === 1 && yDiff === 0) || (xDiff === 0 && yDiff === 1)
  }

  public static connect<T extends CellType>(cell1: Cell<T>, cell2: Cell<T>) {
    if (!Cell.areAdjacent(cell1, cell2)) {
      throw new Error(`Cells are not adjacent:\n   ${cell1.toString()} and\n   ${cell2.toString()}`)
    }

    const pos1 = cell1.position
    const pos2 = cell2.position

    // Determine the direction based on relative positions
    if (pos1.x === pos2.x) {
      if (pos1.y > pos2.y) {
        cell1.setNeighbor(Direction.TOP, cell2)
        cell2.setNeighbor(Direction.BOTTOM, cell1)
        return
      } else {
        cell1.setNeighbor(Direction.BOTTOM, cell2)
        cell2.setNeighbor(Direction.TOP, cell1)
        return
      }
    } else {
      if (pos1.x > pos2.x) {
        cell1.setNeighbor(Direction.LEFT, cell2)
        cell2.setNeighbor(Direction.RIGHT, cell1)
        return
      } else {
        cell1.setNeighbor(Direction.RIGHT, cell2)
        cell2.setNeighbor(Direction.LEFT, cell1)
        return
      }
    }
  }

  private setNeighbor(direction: Direction, cell: Cell<TCellType> | null): void {
    this._cells.set(direction, cell)
  }
}
