import { Drawable, Position, SnakePart } from './type'
import { engine, Entity } from '@dcl/sdk/ecs'

export class SnakeBody implements SnakePart, Drawable {
  public next: SnakePart | undefined
  public prev: SnakePart | undefined
  private _position: Position

  public entity: Entity

  public get position() {
    return this._position
  }

  constructor(pos: Position, prev: SnakePart) {
    this._position = pos
    this.prev = prev
    this.entity = engine.addEntity()
  }

  public move() {
    if (!this.prev) return
    this._position = { ...this.prev.position }
  }

  public terminate() {
    console.log('Snake body terminated')
    console.log('Before terminate 9')
    engine.removeEntity(this.entity)
    console.log('After terminate 9')
  }
}
