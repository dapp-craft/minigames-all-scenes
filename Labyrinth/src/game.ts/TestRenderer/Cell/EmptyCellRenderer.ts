import { engine, Entity, Transform, Material, MeshRenderer, MaterialTransparencyMode } from '@dcl/sdk/ecs'
import { CellRenderer } from '../../../BoardEngine/Renderer/CellRenderer'
import { Cell, CellData } from '../../../BoardEngine/Cell'
import { Board } from '../../../BoardEngine/Board'
import { BOARD_RENDER } from '../../index'
import { Color4 } from '@dcl/sdk/math'

export class ZeroCellRenderer extends CellRenderer {
  private _entity: Entity
  public constructor(cellData: CellData, board: Board) {
    super(cellData, board)
    this._entity = engine.addEntity()
    Transform.create(this._entity, {
      position: this._relativePosition(cellData.position, board),
      scale: this._cellScale,
      parent: BOARD_RENDER.boardEntity
    })
    MeshRenderer.setPlane(this._entity)
    Material.createOrReplace(this._entity, {
      material: {
        $case: 'pbr',
        pbr: {
          emissiveColor: { r: 0.9, g: 0.9, b: 0.9 },
          emissiveIntensity: 0.9,
          roughness: 1.0,
          specularIntensity: 0,
          metallic: 0,
          transparencyMode: MaterialTransparencyMode.MTM_AUTO
        }
      }
    })
  }

  public terminate(): void {
    engine.removeEntity(this._entity)
  }

  public render(): void {
    Transform.createOrReplace(this._entity, {
      position: this._relativePosition(this._cellData.position, this._board),
      scale: this._cellScale,
      parent: BOARD_RENDER.boardEntity
    })
  }
}
