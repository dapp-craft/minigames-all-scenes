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
import { ZeroCellRenderer } from './TestRenderer/Cell/ZeroCellRenderer'
import { OneCellRenderer } from './TestRenderer/Cell/OneCellRenderer'
import { Player } from './TestRenderer/Entity/Player'
import { Entity as LabyrinthEntity } from './BoardEngine/Entity'
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

export const BOARD = new Board(30, 30)

export const BOARD_RENDER = new BoardRender(BOARD)

export async function main() {
  // await libraryReady

  BOARD_RENDER.addCellRenderer(0, ZeroCellRenderer)
  BOARD_RENDER.addCellRenderer(1, OneCellRenderer)
  BOARD_RENDER.addEntityRenderer(0, Player)

  BOARD_RENDER.rerender()

  const player = new LabyrinthEntity({ x: 3, y: 3 }, 0, BOARD)
  BOARD.addEntity(player)


  console.log('\n' + BOARD)

  new InputSystem(player.id, BOARD)

  utils.timers.setInterval(() => {
    BOARD.setCellType(0, 0, BOARD.getCellType(0, 0) === 0 ? 1 : 0)
  }, 1000)

  // Horizontal wall
  for (let i = 0; i < BOARD.width; i++) {
    BOARD.setCellType(i, 5, 1)
  }
}
