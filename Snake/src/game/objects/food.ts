import { MeshRenderer, Transform, engine } from '@dcl/sdk/ecs'
import { Direction, Drawable, MoveDelta, Position, SnakePart } from './type'
import { syncEntity } from '@dcl/sdk/network'

export class Food implements Drawable {
  readonly position: Position
  readonly entity

  constructor(pos: Position) {
    this.position = pos
    this.entity = engine.addEntity()
    syncEntity(this.entity, [Transform.componentId, MeshRenderer.componentId])
  }

  public terminate() {
    engine.removeEntity(this.entity)
  }
}
