import { engine } from '@dcl/sdk/ecs'
import { Drawable, Position } from './type'

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
