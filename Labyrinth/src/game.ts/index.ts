import { Quaternion } from '@dcl/sdk/math'
import { Board } from '../BoardEngine/Board'
import { BoardRender } from '../BoardEngine/Renderer/BoardRender'
import { initSynhonizer } from '../BoardEngine/Synchronization'
import { InputSystem } from './InputSystem/InputSystem'
import { loadLevel } from './levels'
import { ZeroCellRenderer } from './TestRenderer/Cell/EmptyCellRenderer'
import { FinishCellRenderer } from './TestRenderer/Cell/FinishCellRenderer'
import { StartCellRenderer } from './TestRenderer/Cell/StartCellRenderer'
import { WallCellRenderer } from './TestRenderer/Cell/WallCellRenderer'
import { Player } from './TestRenderer/Entity/Player'
import { CustomCellTypes, CustomEntityTypes } from './types'
import * as utils from '@dcl-sdk/utils'
Board.init<CustomCellTypes, CustomEntityTypes>(41, 41, 'Empty')
export const BOARD = Board.getInstance<CustomCellTypes, CustomEntityTypes>()

export const BOARD_RENDER = new BoardRender({ position: { x: 8, y: 3, z: 2 }, scale: { x: 5, y: 5, z: 5 }, rotation: Quaternion.fromEulerDegrees(0, 180, 0) }, BOARD)

BOARD_RENDER.addCellRenderer('Empty', ZeroCellRenderer)
BOARD_RENDER.addCellRenderer('Wall', WallCellRenderer)
BOARD_RENDER.addCellRenderer('Finish', FinishCellRenderer)
BOARD_RENDER.addCellRenderer('Start', StartCellRenderer)
BOARD_RENDER.addEntityRenderer('Player', Player)

export const INPUT_SYSTEM = new InputSystem(BOARD)

export const gameState = {
  inGame: false,
  level: 1,
  timeStart: 0,
  timeEnd: 0,
  isMoving: false
}

export async function init() {
  initSynhonizer()
  await BOARD_RENDER.rerender()

  //   startLevel(1)
}

export async function startLevel(level: 1) {
  BOARD.synchronization = "SENDER"
  const levelData = await loadLevel(level)
  BOARD.setSize(levelData.board[0].length, levelData.board.length)
  for (let y = 0; y < levelData.board.length; y++) {
    for (let x = 0; x < levelData.board[y].length; x++) {
      BOARD.setCellType(x, y, levelData.board[y][x])
    }
  }
  BOARD.setCellType(levelData.start.x, levelData.start.y, 'Start')
  BOARD.setCellType(levelData.finish.x, levelData.finish.y, 'Finish')

  gameState.inGame = true
  gameState.level = level
  gameState.timeStart = Date.now()
  gameState.isMoving = false

  const player = BOARD.addEntity(levelData.start, 'Player', ['Empty', 'Finish', 'Start'])

  INPUT_SYSTEM.updatePlayerEntity(player)

//   utils.timers.setTimeout(() => {
    // BOARD.setSize(10, 10)
//     // Fill board with random walls
//     for (let y = 0; y < BOARD.height; y++) {
//       for (let x = 0; x < BOARD.width; x++) {
//         BOARD.setCellType(x, y, Math.random() < 0.5 ? 'Wall' : 'Empty')
//       }
//     }
//   }, 3000)

//   utils.timers.setTimeout(() => {
//     BOARD.setSize(20, 20)
//     // Fill board with random walls
//     for (let y = 0; y < BOARD.height; y++) {
//       for (let x = 0; x < BOARD.width; x++) {
//         BOARD.setCellType(x, y, Math.random() < 0.5 ? 'Wall' : 'Empty')
//       }
//     }
//   }, 6000)
}
