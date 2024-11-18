import { engine, executeTask, GltfContainer, MeshRenderer, Transform, Entity } from '@dcl/sdk/ecs'
import { Direction, MoveDelta, Position, SnakePart } from './type'
import { SnakeHead } from './snakeHead'
import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const CELL_SIZE = 1 / 3

export class Board {
  private _position: Position
  private _width: number
  private _height: number

  private _snake: SnakeHead | undefined = undefined

  private _entity: Entity

  constructor(pos: Vector3, width: number, height: number) {
    this._position = pos
    this._width = width
    this._height = height

    this._entity = engine.addEntity()
    Transform.create(this._entity, {
      position: pos,
      scale: Vector3.create(CELL_SIZE, CELL_SIZE, CELL_SIZE),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    })

    const shapeEntity = engine.addEntity()
    Transform.create(shapeEntity, {
      rotation: Quaternion.fromEulerDegrees(90, 0, 0),
      scale: Vector3.create(1 / CELL_SIZE, 1 / CELL_SIZE, 1 / CELL_SIZE),
      parent: this._entity
    })
  }

  public setSnake(snake: SnakeHead) {
    this._snake = snake
  }
}

class Food {
  public position: Position

  constructor(pos: Position) {
    this.position = pos
  }
}
