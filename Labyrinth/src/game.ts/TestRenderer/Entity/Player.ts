import { Board } from '../../../BoardEngine/Board'
import { Entity } from '../../../BoardEngine/Entity'
import { Entity as DCL_Entity, engine, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import { EntityRenderer } from '../../../BoardEngine/Renderer/EntityRenderer'
import { BOARD_RENDER } from '../../index'
import { Vector3 } from '@dcl/sdk/math'
import { EntityData } from '../../../BoardEngine/Entity'

export class Player extends EntityRenderer {
  private _DCL_Entity: DCL_Entity

  constructor(entityData: EntityData, board: Board) {
    super(entityData, board)
    this._DCL_Entity = engine.addEntity()
    Transform.create(this._DCL_Entity, { position: this._relativePosition(this._entityData.position), scale: Vector3.scale(this._cellScale, 0.5), parent: BOARD_RENDER.boardEntity })
    MeshRenderer.setBox(this._DCL_Entity)
    Material.setPbrMaterial(this._DCL_Entity, { albedoColor: { r: 1, g: 0, b: 0, a: 1 } })
  }
  
  public update(entityData: EntityData): void {
    this._entityData = entityData
    Transform.createOrReplace(this._DCL_Entity, { position: this._relativePosition(entityData.position), scale: Vector3.scale(this._cellScale, 0.5), parent: BOARD_RENDER.boardEntity })
  }

  public terminate(): void {
    engine.removeEntity(this._DCL_Entity)
  }
}
