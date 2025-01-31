import { engine, Entity, Transform, Material, MeshRenderer } from '@dcl/sdk/ecs'
import { CellRenderer } from '../../../BoardEngine/Renderer/CellRenderer'
import { Cell, CellData } from '../../../BoardEngine/Cell'
import { Board } from '../../../BoardEngine/Board'
import { BOARD_RENDER } from '../../index'

export class StartCellRenderer extends CellRenderer {
    private _entity: Entity
    public constructor(cellData: CellData, board: Board) {
        super(cellData, board)
        this._entity = engine.addEntity()
        Transform.create(this._entity, {position: this._relativePosition(cellData.position, board), scale: this._cellScale, parent: BOARD_RENDER.boardEntity})
        MeshRenderer.setPlane(this._entity)
        Material.setPbrMaterial(this._entity, {albedoColor: {r: 0.5, g: 0.8, b: 0.5, a: 1}})
    }

    public terminate(): void {
        engine.removeEntity(this._entity)
    }

    public render(): void {
        Transform.createOrReplace(this._entity, {position: this._relativePosition(this._cellData.position, this._board), scale: this._cellScale, parent: BOARD_RENDER.boardEntity})
    }
}
