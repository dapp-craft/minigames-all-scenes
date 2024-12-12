import { MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Direction, Drawable, MoveDelta, Position, SnakePart } from './type'

export class Food implements Drawable {
  readonly position: Position
  readonly entity

  constructor(pos: Position) {
    this.position = pos
    this.entity = engine.addEntity()
  }

  public terminate() {
    engine.removeEntity(this.entity)
  }
}
