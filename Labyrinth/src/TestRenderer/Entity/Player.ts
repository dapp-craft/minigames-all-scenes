import { Board } from '../../BoardEngine/Board'
import { Entity } from '../../BoardEngine/Entity'
import { Entity as DCL_Entity, engine, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { EntityRenderer } from '../../BoardEngine/Renderer/EntityRenderer'
import { BOARD_RENDER } from '../..'
import { Vector3 } from '@dcl/sdk/math'

export class Player extends EntityRenderer {
  private _DCL_Entity: DCL_Entity

  constructor(entity: Entity, board: Board) {
    super(entity, board)
    this._DCL_Entity = engine.addEntity()
    Transform.create(this._DCL_Entity, { position: this._relativePosition(this._entity.position), scale: Vector3.scale(this._cellScale, 0.5), parent: BOARD_RENDER.boardEntity })
    MeshRenderer.setBox(this._DCL_Entity)
    Material.setPbrMaterial(this._DCL_Entity, { albedoColor: { r: 1, g: 0, b: 0, a: 1 } })
  }
  public render(): void {
    Transform.createOrReplace(this._DCL_Entity, { position: this._relativePosition(this._entity.position), scale: this._cellScale, parent: BOARD_RENDER.boardEntity })
  }

  public terminate(): void {
    engine.removeEntity(this._DCL_Entity)
  }
}
