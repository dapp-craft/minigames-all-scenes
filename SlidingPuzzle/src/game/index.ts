import {
  Animator,
  Billboard,
  EasingFunction,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MaterialTransparencyMode,
  MeshCollider,
  MeshRenderer,
  TextureFilterMode,
  Transform,
  TransformType,
  Tween,
  Vector3Type,
  VisibilityComponent,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { MAX_BOARD_SIZE } from '../config'
import { createTile, getAllTiles } from './gameObjects/tile'
import { Tile } from './components'
import { initBoard } from './gameObjects'
import { setupSynchronizer } from './synchronizer'
import * as utils from '@dcl-sdk/utils'
import { levelImages } from '../resources/resources'

export function initGame() {
  initBoard()

  initTiles()

  setupSynchronizer()

  utils.timers.setTimeout(() => {
    Tile.getMutable(getAllTiles()[0]).inGame = true
  }, 1000)
  utils.timers.setTimeout(() => {
    Tile.getMutable(getAllTiles()[0]).image = levelImages[2]
  }, 4000)
  utils.timers.setTimeout(() => {
    Tile.getMutable(getAllTiles()[0]).position.x = 1
  }, 2000)
  utils.timers.setTimeout(() => {
    Tile.getMutable(getAllTiles()[0]).boardSize = 5
  }, 3000)
}

function initTiles() {
  for (let i = 0; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    createTile(i + 1)
  }
}
