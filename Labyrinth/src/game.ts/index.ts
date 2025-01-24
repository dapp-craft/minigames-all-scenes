import { Board } from '../BoardEngine/Board'
import { BoardRender } from '../BoardEngine/Renderer/BoardRender'
import { InputSystem } from './InputSystem/InputSystem'
import { loadLevel } from './levels'
import { ZeroCellRenderer } from './TestRenderer/Cell/EmptyCellRenderer'
import { FinishCellRenderer } from './TestRenderer/Cell/FinishCellRenderer'
import { StartCellRenderer } from './TestRenderer/Cell/StartCellRenderer'
import { WallCellRenderer } from './TestRenderer/Cell/WallCellRenderer'
import { Player } from './TestRenderer/Entity/Player'
import { CustomCellTypes, CustomEntityTypes } from './types'

export const BOARD = new Board<CustomCellTypes, CustomEntityTypes>(41, 41, 'Empty')

export const BOARD_RENDER = new BoardRender(BOARD)

BOARD_RENDER.addCellRenderer('Empty', ZeroCellRenderer)
BOARD_RENDER.addCellRenderer('Wall', WallCellRenderer)
BOARD_RENDER.addCellRenderer('Finish', FinishCellRenderer)
BOARD_RENDER.addCellRenderer('Start', StartCellRenderer)
BOARD_RENDER.addEntityRenderer('Player', Player)

export async function init() {
  await BOARD_RENDER.rerender()
  BOARD.setCellType(0, 0, "Finish")
  BOARD.setCellType(1, 0, "Wall")
  new InputSystem(BOARD)


  startLevel(1)
}


async function startLevel(level: 1) {
    const levelData = await loadLevel(level)
    for (let y = 0; y < levelData.board.length; y++) {
        for (let x = 0; x < levelData.board[y].length; x++) {
            BOARD.setCellType(x, y, levelData.board[y][x])
        }
    }
    BOARD.setCellType(levelData.start.x, levelData.start.y, "Start")
    BOARD.setCellType(levelData.finish.x, levelData.finish.y, "Finish")
    
}

