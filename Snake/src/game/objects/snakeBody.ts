import { syncEntity } from '@dcl/sdk/network'
import { Direction, Drawable, MoveDelta, Position, SnakePart } from './type'
import { engine, executeTask, GltfContainer, MeshRenderer, Transform, Entity } from '@dcl/sdk/ecs'

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
    syncEntity(this.entity, [Transform.componentId, MeshRenderer.componentId])
  }

  public move() {
    if (!this.prev) return
    this._position = { ...this.prev.position }
  }

  public terminate() {
    console.log('Snake body terminated')
    engine.removeEntity(this.entity)
  }
}
