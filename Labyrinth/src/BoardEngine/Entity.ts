import { Vector3 } from '@dcl/sdk/math'
import { Board } from './Board'
import { Direction, Position, DirectionPositionDelta, EntityType, CellType } from './Types'
import { Entity as DCL_Entity } from '@dcl/sdk/ecs'

export type EntityData = {
  id: number
  type: EntityType
  position: Position
}

export class Entity<TCellType extends CellType, TEntityType extends EntityType = EntityType> {
  private _entityCount: number = 1

  protected _id: number
  protected _position: Position
  protected _board: Board
  protected _type: TEntityType
  protected _cellScale: { x: number; y: number; z: number }
  protected _allowedCellTypes: TCellType[]

  constructor(position: Position, type: TEntityType, board: Board) {
    this._allowedCellTypes = []
    this._position = position
    this._type = type
    this._board = board
    this._cellScale = { x: 1 / board.width, y: 1 / board.height, z: 1 / board.height }
    this._id = this._entityCount
    this._entityCount++
  }

  public get allowedCellTypes(): TCellType[] {
    return [...this._allowedCellTypes]
  }

  public set allowedCellTypes(cellTypes: TCellType[]) {
    this._allowedCellTypes = cellTypes
  }

  public get type(): EntityType {
    return this.data.type
  }

  public get id(): number {
    return this._id
  }

  public get data(): EntityData {
    return {
      id: this._id,
      type: this._type,
      position: this._position
    }
  }

  public get position(): Position {
    return { x: this._position.x, y: this._position.y }
  }

  public set position(position: Position) {
    this._position = position
  }

  public getMovePosition(direction: Direction): Position {
    return {
      x: this._position.x + DirectionPositionDelta[direction].x,
      y: this._position.y + DirectionPositionDelta[direction].y
    }
  }
}
