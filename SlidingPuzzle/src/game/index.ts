import { Entity } from '@dcl/sdk/ecs'
import { MAX_BOARD_SIZE, MAX_LEVEL } from '../config'
import { createTile, getAllTiles, getTileAtPosition } from './gameObjects/tile'
import { Tile } from './components'
import { initBoard } from './gameObjects'
import { setupSynchronizer } from './synchronizer'
import { levelImages } from '../resources/resources'
import { generateLevel, getLevelSize } from './utils/levelGenerator'
import { boardMatrix } from './utils/boardMatrix'
import { levelButtons, setupGameUI } from './UiObjects'
import { queue } from '@dcl-sdk/mini-games/src'
import { fetchPlayerProgress, playerProgress, updatePlayerProgress } from './syncData'
import { getPlayer } from '@dcl/sdk/players'
import * as utils from '@dcl-sdk/utils'

export const stateVariables = {
  inGame: false,
  moves: 0,
  levelStartTime: 0,
  levelFinishTime: 0,
  level: 1,
  playerName: '',
  playerAddress: ''
}

const TileMoveDirection = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
}

export async function initGame() {
  setupGameUI()

  initBoard()

  initTiles()

  setupSynchronizer()

  await fetchPlayerProgress()
}

function initTiles() {
  for (let i = 0; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    createTile(i + 1)
  }
}

export function getReadyToStart() {
  console.log('Get ready to start')

  const levetToStart = (playerProgress?.level ?? 0) + 1 > MAX_LEVEL ? MAX_LEVEL : (playerProgress?.level ?? 0) + 1
  stateVariables.playerName = getPlayer()?.name ?? 'Underfined'
  stateVariables.playerAddress = getPlayer()?.userId ?? 'Underfined'
  for (let i = 0; i < levetToStart; i++) {
    levelButtons[i].enable()
  }

  utils.timers.setTimeout(() => {
    startLevel(levetToStart)
  }, 2000)
}

export function startLevel(level: keyof typeof levelImages) {
  const size = getLevelSize(level)
  const matrix = generateLevel(size)
  reSetTiles(level, matrix)
  stateVariables.inGame = true
  stateVariables.moves = 0
  stateVariables.levelStartTime = Date.now()
  stateVariables.levelFinishTime = 0
  stateVariables.level = level
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
  })
}

function disableTile(tile: Entity) {
  const tileData = Tile.getMutableOrNull(tile)
  if (tileData == null) throw new Error('Tile component not found ')

  if (tileData.boardSize !== 3) tileData.boardSize = 3
  if (tileData.image !== '') tileData.image = ''
  if (tileData.position.x !== 0 && tileData.position.y !== 0) tileData.position = { x: 0, y: 0 }
  if (tileData.inGame !== false) tileData.inGame = false
}

export function onTileClick(tile: Entity) {
  if (!stateVariables.inGame) return
  if (!isMovePossible(tile)) return
  const moveDirection = getMoveDirection(tile)
  moveMultipleTiles(tile, moveDirection)
}

function moveMultipleTiles(tile: Entity, direction: keyof typeof TileMoveDirection) {
  const tilePosition = Tile.get(tile).position
  const tilesToMove = []
  switch (direction) {
    case 'UP':
      for (let i = tilePosition.y; i >= 0; i--) {
        if (boardMatrix()[i][tilePosition.x] === -1) break
        tilesToMove.push(getTileAtPosition({ x: tilePosition.x, y: i }))
      }
      break
    case 'DOWN':
      for (let i = tilePosition.y; i < boardMatrix().length; i++) {
        if (boardMatrix()[i][tilePosition.x] === -1) break
        tilesToMove.push(getTileAtPosition({ x: tilePosition.x, y: i }))
      }
      break
    case 'LEFT':
      for (let i = tilePosition.x; i >= 0; i--) {
        if (boardMatrix()[tilePosition.y][i] === -1) break
        tilesToMove.push(getTileAtPosition({ x: i, y: tilePosition.y }))
      }
      break
    case 'RIGHT':
      for (let i = tilePosition.x; i < boardMatrix().length; i++) {
        if (boardMatrix()[tilePosition.y][i] === -1) break
        tilesToMove.push(getTileAtPosition({ x: i, y: tilePosition.y }))
      }
      break
  }

  tilesToMove.forEach((tile) => {
    const pos = Tile.getMutable(tile).position
    pos.x += TileMoveDirection[direction].x
    pos.y += TileMoveDirection[direction].y
  })

  stateVariables.moves++
  if (isSolved()) finishLevel()
}

function isMovePossible(tile: Entity) {
  const board = boardMatrix()
  const size = board.length
  const tilePosition = Tile.get(tile).position

  for (let i = 0; i < size; i++) {
    if (board[tilePosition.y][i] === -1) {
      return true
    }
  }

  for (let i = 0; i < size; i++) {
    if (board[i][tilePosition.x] === -1) {
      return true
    }
  }

  return false
}

function getMoveDirection(tile: Entity): keyof typeof TileMoveDirection {
  if (!isMovePossible(tile)) throw new Error('If you read this, CRY TT')

  const board = boardMatrix()
  const size = board.length
  const tilePosition = Tile.get(tile).position

  for (let i = tilePosition.y - 1; i >= 0; i--) {
    if (board[i][tilePosition.x] === -1) {
      return 'UP'
    }
  }

  for (let i = tilePosition.y + 1; i < size; i++) {
    if (board[i][tilePosition.x] === -1) {
      return 'DOWN'
    }
  }

  for (let i = tilePosition.x - 1; i >= 0; i--) {
    if (board[tilePosition.y][i] === -1) {
      return 'LEFT'
    }
  }

  for (let i = tilePosition.x + 1; i < size; i++) {
    if (board[tilePosition.y][i] === -1) {
      return 'RIGHT'
    }
  }

  // This should never happen
  throw new Error('If you read this, CRY TT')
}

function isSolved() {
  const matrix = boardMatrix()
  const size = matrix.length

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] === -1) continue
      if (matrix[i][j] !== i * size + j + 1) {
        return false
      }
    }
  }
  return true
}

function finishLevel() {
  stateVariables.levelFinishTime = Date.now()

  updatePlayerProgress()
  if (queue.getQueue().length > 1) {
    exitGame()
  } else {
    const levelToStart = stateVariables.level == MAX_LEVEL ? 1 : stateVariables.level + 1
    console.log('Level to start', levelToStart)
    levelButtons[levelToStart - 1].enable()
    startLevel(levelToStart)
  }
}
export function exitGame() {
  stateVariables.level = 1
  stateVariables.levelFinishTime = 0
  stateVariables.levelStartTime = 0
  stateVariables.moves = 0
  queue.setNextPlayer()
}
