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
import { generateLevel, getLevelSize } from './utils/levelGenerator'

export function initGame() {
  initBoard()

  initTiles()

  setupSynchronizer()

  startLevel(1)
}

function initTiles() {
  for (let i = 0; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    createTile(i + 1)
  }
}

function startLevel(level: keyof typeof levelImages) {
  const size = getLevelSize(level)
  const matrix = generateLevel(size)
  reSetTiles(level, matrix)
}

function reSetTiles(level: keyof typeof levelImages, matrix: number[][]) {
  const size = getLevelSize(level)
  if (size != matrix.length) throw new Error('Matrix size does not match the level size')
  matrix.forEach((row) => {
    console.log(row.join(' '))
  })

  const tiles = getAllTiles()
  tiles.forEach(disableTile)

  const tilesInGame = tiles.filter((tile) => Tile.get(tile).index < size * size)
  tilesInGame.sort((a, b) => Tile.get(a).index - Tile.get(b).index)

  console.log(
    'Tiles in game:',
    tilesInGame.map((tile) => Tile.get(tile).index)
  )

  tilesInGame.forEach((tile, index) => {
    const row = matrix.findIndex((row) => row.includes(index + 1))
    if (row === -1) throw new Error(`Tile Number ${index + 1} not found in matrix!`)
    const column = matrix[row].indexOf(index + 1)
    const tileData = Tile.getMutableOrNull(tile)
    if (tileData == null) throw new Error('Tile component not found')
    tileData.boardSize = size
    tileData.image = levelImages[level]
    tileData.position = { x: column, y: row }
    tileData.inGame = true

    console.log(`Tile ${index + 1} at (${column}, ${row}), ${tileData.inGame}`)
  })
}

function disableTile(tile: Entity) {
  const tileData = Tile.getMutableOrNull(tile)
  if (tileData == null) throw new Error('Tile component not found')

  if (tileData.boardSize !== 3) tileData.boardSize = 3
  if (tileData.image !== '') tileData.image = ''
  if (tileData.position.x !== 0 && tileData.position.y !== 0) tileData.position = { x: 0, y: 0 }
  if (tileData.inGame !== false) tileData.inGame = false
}
