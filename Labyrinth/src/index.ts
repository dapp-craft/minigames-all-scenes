import { engine, Entity, executeTask, GltfContainer, Material, MeshRenderer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity } from '@dcl-sdk/mini-games/src'
import { TIME_LEVEL_MOVES } from '@dcl-sdk/mini-games/src/ui'
import { readGltfLocators } from '../../common/locators'
import { initMiniGame } from '../../common/library'
import { Board } from './BoardEngine/Board'
import { BoardRender } from './BoardEngine/Renderer/BoardRender'
import { CellRenderer } from './BoardEngine/Renderer/CellRenderer'
import { Cell } from './BoardEngine/Cell'

// const handlers = {
//     start: () => {},
//     exit: () => {},
//     restart: () => {},
//     toggleMusic: () => {},
//     toggleSfx: () => {}
// }

// const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

const MODELS: string[] = [
    'models/obj_floor.gltf'
]

executeTask(async () => {
    for (const model of MODELS) {
        const entity = engine.addEntity()
        GltfContainer.create(entity, {src: model})
        Transform.create(entity, {position: {x: 8, y: 0, z: 8}})
    }
})

const BOARD = new Board(5, 5);

const BOARD_RENDER = new BoardRender(BOARD);

class ZeroCellRenderer extends CellRenderer {
    private _entity: Entity
    public constructor(cell: Cell, board: Board) {
        super(cell, board)
        this._entity = engine.addEntity()
        Transform.create(this._entity, {position: this._relativePosition(cell.position, board), scale: this._cellScale, parent: BOARD_RENDER.boardEntity})
        MeshRenderer.setPlane(this._entity)
        Material.setPbrMaterial(this._entity, {albedoColor: {r: 0, g: 0, b: 0, a: 1}})

    }

    public terminate(): void {
        engine.removeEntity(this._entity)
    }

    public render(): void {
        Transform.createOrReplace(this._entity, {position: this._relativePosition(this._cell.position, this._board), scale: this._cellScale, parent: BOARD_RENDER.boardEntity})
    }
}

class OneCellRenderer extends CellRenderer {
    private _entity: Entity
    public constructor(cell: Cell, board: Board) {
        super(cell, board)
        this._entity = engine.addEntity()
        Transform.create(this._entity, {position: this._relativePosition(cell.position, board), scale: this._cellScale, parent: BOARD_RENDER.boardEntity})
        MeshRenderer.setPlane(this._entity)
        Material.setPbrMaterial(this._entity, {albedoColor: {r: 0, g: 1, b: 0, a: 1}})

    }

    public terminate(): void {
        engine.removeEntity(this._entity)
    }

    public render(): void {
        Transform.createOrReplace(this._entity, {position: this._relativePosition(this._cell.position, this._board), scale: this._cellScale, parent: BOARD_RENDER.boardEntity})
    }
}


export async function main() {
    // await libraryReady

    BOARD_RENDER.addCellRenderer(0, ZeroCellRenderer)
    BOARD_RENDER.addCellRenderer(1, OneCellRenderer)
    BOARD_RENDER.render()
    console.log("\n" + BOARD);
    
    utils.timers.setInterval(() => {
        BOARD.getCell(0, 0).type = BOARD.getCell(0, 0).type === 0 ? 1 : 0
    }, 1000)
}
