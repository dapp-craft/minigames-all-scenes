import { Vector3 } from '@dcl/sdk/math'
import { Board } from './Board'
import { Direction, Position, DirectionPositionDelta, EntityType } from './Types'
import { Entity as DCL_Entity } from '@dcl/sdk/ecs'

export class Entity {
  private _entityCount: number = 1

  protected _id: number
  protected _position: Position
  protected _board: Board
  protected _type: EntityType
  protected _cellScale: { x: number; y: number; z: number }

  private _subscriberCount: number = 0
  // Subscribers are functions that are called when the entity moves
  private _subscribers: Map<number, (entity: Entity) => void> = new Map()

  constructor(position: Position, type: EntityType, board: Board) {
    this._position = position
    this._type = type
    this._board = board
    this._cellScale = { x: 1 / board.width, y: 1 / board.height, z: 1 / board.height }
    this._id = this._entityCount
    this._entityCount++
  }

  public get type(): EntityType {
    return this._type
  }

  public get id(): number {
    return this._id
  }

  public get position(): Position {
    return { x: this._position.x, y: this._position.y }
  }

  public set position(position: Position) {
    this._position = position
    this._subscribers.forEach((subscriber) => subscriber(this))
  }

  public getMovePosition(direction: Direction): Position {
    return {
      x: this._position.x + DirectionPositionDelta[direction].x,
      y: this._position.y + DirectionPositionDelta[direction].y
    }
  }
}
