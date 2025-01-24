import { engine, executeTask, GltfContainer, Transform } from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Board } from './BoardEngine/Board'
import { BoardRender } from './BoardEngine/Renderer/BoardRender'
import { ZeroCellRenderer } from './TestRenderer/Cell/ZeroCellRenderer'
import { OneCellRenderer } from './TestRenderer/Cell/OneCellRenderer'
import { Player } from './TestRenderer/Entity/Player'
import { InputSystem } from './InputSystem/InputSystem'

// const handlers = {
//     start: () => {},
//     exit: () => {},
//     restart: () => {},
//     toggleMusic: () => {},
//     toggleSfx: () => {}
// }

// const libraryReady = initMiniGame('', TIME_LEVEL_MOVES, readGltfLocators(`locators/obj_locators_default.gltf`), handlers)

const MODELS: string[] = ['models/obj_floor.gltf']

executeTask(async () => {
  for (const model of MODELS) {
    const entity = engine.addEntity()
    GltfContainer.create(entity, { src: model })
    Transform.create(entity, { position: { x: 8, y: 0, z: 8 } })
  }
})

export type CustomCellTypes = 'Empty' | 'Wall'
export type CustomEntityTypes = 'Player' | 'NPC'

export const BOARD = new Board<CustomCellTypes, CustomEntityTypes>(30, 30, 'Empty')

export const BOARD_RENDER = new BoardRender(BOARD)

export async function main() {
  // await libraryReady

  BOARD_RENDER.addCellRenderer('Empty', ZeroCellRenderer)
  BOARD_RENDER.addCellRenderer('Wall', OneCellRenderer)
  BOARD_RENDER.addEntityRenderer('Player', Player)

  BOARD_RENDER.rerender()

  // TODO: initialize entity instance in board class
  const player = BOARD.addEntity({ x: 3, y: 3 }, "Player", BOARD, ["Empty", "Wall"])

  new InputSystem(player, BOARD)

  utils.timers.setInterval(() => {
    BOARD.setCellType(0, 0, BOARD.getCellType(0, 0) === "Wall" ? "Empty" : "Wall")
  }, 1000)

  // Horizontal wall
  for (let i = 0; i < BOARD.width; i++) {
    BOARD.setCellType(i, 4, "Wall")
  }
}
