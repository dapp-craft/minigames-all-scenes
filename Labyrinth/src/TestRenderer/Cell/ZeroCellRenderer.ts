import { engine, Entity, Transform, Material, MeshRenderer } from '@dcl/sdk/ecs'
import { CellRenderer } from '../../BoardEngine/Renderer/CellRenderer'
import { Cell } from '../../BoardEngine/Cell'
import { Board } from '../../BoardEngine/Board'
import { BOARD_RENDER } from '../..'

export class ZeroCellRenderer extends CellRenderer {
  private _entity: Entity
  public constructor(cell: Cell, board: Board) {
    super(cell, board)
    this._entity = engine.addEntity()
    Transform.create(this._entity, {
      position: this._relativePosition(cell.position, board),
      scale: this._cellScale,
      parent: BOARD_RENDER.boardEntity
    })
    MeshRenderer.setPlane(this._entity)
    Material.setPbrMaterial(this._entity, { albedoColor: { r: 0, g: 0, b: 0, a: 1 } })
  }

  public terminate(): void {
    engine.removeEntity(this._entity)
  }

  public render(): void {
    Transform.createOrReplace(this._entity, {
      position: this._relativePosition(this._cell.position, this._board),
      scale: this._cellScale,
      parent: BOARD_RENDER.boardEntity
    })
  }
}
