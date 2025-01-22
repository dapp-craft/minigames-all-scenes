import { Entity as DCL_Entity } from '@dcl/sdk/ecs'
import { Entity, EntityData } from '../Entity'
import { Position } from '../Types'
import { Board } from '../Board'
import { Vector3 } from '@dcl/sdk/math'

export abstract class EntityRenderer {
  protected _entityData: EntityData
  protected _board: Board
  protected _cellScale: Vector3
  constructor(entityData: EntityData, board: Board) {
    this._entityData = entityData
    this._board = board
    this._cellScale = { x: 1 / board.width, y: 1 / board.height, z: 1 / board.height }
  }

  /**
   * Implement this method to render the entity
   */
  public abstract update(entityData: EntityData): void

  /**
   * Implement this method to terminate the entity renderer
   */
  public abstract terminate(): void

  protected _relativePosition(position: Position): Vector3 {
    const bWidth = this._board.width
    const bHeight = this._board.height
    const cellScale = { x: 1 / this._board.width, y: 1 / this._board.height, z: 1 }

    return {
      x: (position.x - bWidth / 2) / bWidth + cellScale.x / 2,
      y: (position.y - bHeight / 2) / bHeight + cellScale.y / 2,
      z: -0.001
    }
  }
}

