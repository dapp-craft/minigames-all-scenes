import {
  EasingFunction,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MaterialTransparencyMode,
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
import { getImage, getImageUV } from './image'
// import { createTile } from '../gameObjects/tile'
import { Disc, GameData, Tile } from '../components/definitions'
import { getTilePosition } from './tileCalculation'
import { Color4, Matrix, Quaternion, Vector3 } from '@dcl/sdk/math'
import { shuffleMatrix } from './shuffle'
import { syncEntity } from '@dcl/sdk/network'
import { MAX_BOARD_SIZE, mainEntityId, tileEntityBaseId } from '../config'
import { tileShape } from '../../resources/resources'
import { progress, queue, utilities } from '@dcl-sdk/mini-games/src'
import { getPlayer } from '@dcl/sdk/players'
import { movePlayerTo } from '~system/RestrictedActions'
import * as utils from "@dcl-sdk/utils"

const BOARD_TRANSFORM: TransformType = {
  position: { x: 8, y: 2.6636881828308105, z: 1.0992899895 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: Quaternion.fromAngleAxis(180, Vector3.create(0, 1, 0))
}

export let gameDataEntity: Entity

export let boardEntity: Entity
export let tiles: { [key: number]: Entity } = {}
export let tileImages: { [key: number]: Entity } = {}


const TileMoveDirection = {
  UP: { row: -1, column: 0 },
  DOWN: { row: 1, column: 0 },
  LEFT: { row: 0, column: -1 },
  RIGHT: { row: 0, column: 1 }
}

export function initGame() {

  initGameDataEntity()

  initBoard()

  initTiles()

  hideAllTiles()



  queue.listeners.onActivePlayerChange = (player) => {
    const localPlayer = getPlayer()
    if (player?.address === localPlayer?.userId) {
      startGame()
    } else {
      GameData.createOrReplace(gameDataEntity, { playerAddress: '', playerName: '', moves: 0, levelStartedAt: 0, levelFinishedAt: 0 })
    }
  }

}





function startGame() {
  const level = 1

  const localPlayer = getPlayer()

  Disc.createOrReplace(boardEntity, { size: 3, matrix: [] })
  GameData.createOrReplace(gameDataEntity, {
    playerAddress: localPlayer?.userId,
    playerName: localPlayer?.name,
    moves: 0,
    levelStartedAt: Date.now(),
    levelFinishedAt: 0,
  })

  movePlayerTo({
    newRelativePosition: Vector3.create(8, 1, 4)
  })

  startNewLevel(3, level)
}

function startNewLevel(size: number, level: number) {
  const disc = Disc.getMutable(boardEntity)
  disc.size = size
  disc.lvl = level

  disc.matrix = Array.from({ length: size }, (_, rowIndex) =>
    Array.from({ length: size }, (_, colIndex) => rowIndex * size + colIndex + 1)
  )
  console.log("Matrix init")
  disc.matrix.forEach((row) => console.log(row.join(' ')))
  disc.matrix[size - 1][size - 1] = -1

  disc.matrix = shuffleMatrix(disc.matrix, 100)
  console.log("Matrix shuffled")
  disc.matrix.forEach((row) => console.log(row.join(' ')))

  setImage(level)

  setTiles()

  for (let i = 1; i < size * size; i++) {
    updateTile(i)
  }

}

function initGameDataEntity() {
  gameDataEntity = engine.addEntity()
  GameData.create(gameDataEntity, {
    playerAddress: '',
    playerName: '',
    moves: 0,
    levelStartedAt: 0,
    levelFinishedAt: 0
  })
  syncEntity(gameDataEntity, [GameData.componentId], mainEntityId)
}


function initBoard(){
  boardEntity = engine.addEntity()
  Transform.create(boardEntity, BOARD_TRANSFORM)
  syncEntity(boardEntity, [Transform.componentId, Disc.componentId], mainEntityId + 1)
}


function initTiles(){
  for (let i = 1; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    const tile = engine.addEntity()
    tiles[i] = tile
    Transform.create(tile, {
      // Hack to avoid z-flickering
      position: Vector3.create(0, 0, i * 0.001),
      scale: Vector3.create(1, 1, 1),
      parent: boardEntity
    })
    Tile.create(tile, {number: i})

    // Create the tile model
    const shape = engine.addEntity()
    GltfContainer.create(shape, tileShape)
    Transform.create(shape, { parent: tile })

    // Image
    const image = engine.addEntity()
    Transform.create(image, {
      position: { x: 0, y: 0, z: -0.015 },
      parent: tile
    })
    MeshRenderer.setPlane(image, getImageUV(3, i))
    tileImages[i] = image

    pointerEventsSystem.onPointerDown(
      {
        entity: shape,
        opts: { button: InputAction.IA_POINTER, hoverText: i.toString() }
      },
      () => {
        onTileClick(i)
      }
    )

    syncEntity(tile, [Transform.componentId], tileEntityBaseId + i * 10 + 1)
    // syncEntity(shape, [], tileEntityBaseId + i * 10 + 2)
    syncEntity(image, [Transform.componentId, MeshRenderer.componentId, Material.componentId], tileEntityBaseId + i * 10 + 2)
  }
}


function setImage(lvl: number){
  const image = getImage(lvl)

  const size = Disc.get(boardEntity).size
  for (let i = 1; i < size * size; i++) {
    const imageEntity = tileImages[i]
    // @ts-ignore
    MeshRenderer.getMutable(imageEntity).mesh.plane.uvs = getImageUV(size, i)
    Material.createOrReplace(imageEntity, {
      material: {
        $case: 'pbr',
        pbr: {
          texture: {
            tex: {
              $case: 'texture',
              texture: { src: image, filterMode: TextureFilterMode.TFM_TRILINEAR }
            }
          },
          emissiveColor: Color4.White(),
          emissiveIntensity: 0.9,
          emissiveTexture: {
            tex: {
              $case: 'texture',
              texture: { src: image, filterMode: TextureFilterMode.TFM_TRILINEAR }
            }
          },
          roughness: 1.0,
          specularIntensity: 0,
          metallic: 0,
          transparencyMode: MaterialTransparencyMode.MTM_AUTO
        }
      }
    })
  }

}

function hideAllTiles() {
  for (let i = 1; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    Transform.getMutable(tiles[i]).scale = Vector3.Zero()
  }
}

function setTiles() {
  const size = Disc.get(boardEntity).size
  for (let i = 1; i < size * size; i++) {
    Transform.getMutable(tiles[i]).scale = Vector3.fromArray(Array(3).fill(3 / size))
  }
}

function updateTile(tileNumber: any) {
  validateTileNumber(tileNumber)
  
  const tile = tiles[tileNumber]
  const gameDisc = Disc.get(boardEntity)

  const { row, column } = getRowColumn(tileNumber)

  const position = getTilePosition(gameDisc.size, row, column)

  Tween.createOrReplace(tile, {
    mode: Tween.Mode.Move({
      start: Transform.getMutable(tile).position,
      end: position
    }),
    duration: 500,
    easingFunction: EasingFunction.EF_EASECUBIC
  })

}

function moveOneTile(tileNumber: any) {
  validateTileNumber(tileNumber)


  const direction = getMoveDirection(tileNumber)
  if (direction === undefined) return

  const matrix = Disc.getMutable(boardEntity).matrix

  const { row, column } = getRowColumn(tileNumber)
  const newRow = row + TileMoveDirection[direction].row
  const newColumn = column + TileMoveDirection[direction].column

  matrix[newRow][newColumn] = tileNumber
  matrix[row][column] = -1
  updateTile(tileNumber)

  GameData.getMutable(gameDataEntity).moves++
  if (isSolved()) {
    utils.timers.setTimeout(() => {
      finishGame()
    }, 1000)
  }

}

function onTileClick(tileNumber: number) {
  validateTileNumber(tileNumber)

  let tilesToMove: number[] = []

  const matrix = Disc.get(boardEntity).matrix
  const size = Disc.get(boardEntity).size

  const { row, column } = getRowColumn(tileNumber)

  // Up
  for (let i = row - 1; i >= 0; i--) {
    tilesToMove.push(matrix[i + 1][column])
    if (matrix[i][column] === -1) {
      tilesToMove.reverse()
      tilesToMove.forEach((tile) => moveOneTile(tile))
      return
    }
  }
  tilesToMove = []

  // Down
  for (let i = row + 1; i < size; i++) {
    tilesToMove.push(matrix[i - 1][column])
    if (matrix[i][column] === -1) {
      tilesToMove.reverse()
      tilesToMove.forEach((tile) => moveOneTile(tile))
      return
    }
  }
  tilesToMove = []

  // Left
  for (let i = column - 1; i >= 0; i--) {
    tilesToMove.push(matrix[row][i + 1])
    if (matrix[row][i] === -1) {
      tilesToMove.reverse()
      tilesToMove.forEach((tile) => moveOneTile(tile))
      return
    }
  }
  tilesToMove = []

  // Right
  for (let i = column + 1; i < size; i++) {
    tilesToMove.push(matrix[row][i - 1])
    if (matrix[row][i] === -1) {
      tilesToMove.reverse()
      tilesToMove.forEach((tile) => moveOneTile(tile))
      return
    }
  }

}

function getMoveDirection(tileNumber: number):  keyof typeof TileMoveDirection | undefined {
  validateTileNumber(tileNumber)

  const matrix = Disc.get(boardEntity).matrix
  const size = Disc.get(boardEntity).size

  const { row, column } = getRowColumn(tileNumber)
  if (row > 0 && matrix[row - 1][column] === -1) {
    console.log('Available move: Up')
    return 'UP'
  }
  if (row! < size - 1 && matrix[row + 1][column!] === -1) {
    console.log('Available move: Down')
    return 'DOWN'
  }
  if (column > 0 && matrix[row][column - 1] === -1) {
    console.log('Available move: Left')
    return 'LEFT'
  }
  if (column < size - 1 && matrix[row][column + 1] === -1) {
    console.log('Available move: Right')
    return 'RIGHT'
  }
  return undefined
}

function getRowColumn(tileNumber: number): { row: number; column: number } {
  validateTileNumber(tileNumber)
  let row: any
  let column: any

  const size = Disc.get(boardEntity).size
  const matrix = Disc.get(boardEntity).matrix

  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (matrix[i][j] === tileNumber) {
        row = i
        column = j
        return { row, column }
      }
    }
  }

  return { row, column }

}

function validateTileNumber(tileNumber: number) {
  let size = Disc.get(boardEntity).size
  if (!(tileNumber >= 1 && tileNumber < size * size)) throw new Error('Invalid tile number')
}

function isSolved(){
  const matrix = Disc.get(boardEntity).matrix
  const size = Disc.get(boardEntity).size

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

function finishGame(){
  GameData.getMutable(gameDataEntity).levelFinishedAt = Date.now()
  console.log('Solved!')
  console.log('GameData:', GameData.get(gameDataEntity))

  const gameData = GameData.get(gameDataEntity)
  const disc = Disc.get(boardEntity)

  progress.upsertProgress({
    level: disc.lvl,
    score: gameData.moves * 10,
    moves: gameData.moves,
    time: gameData.levelFinishedAt - gameData.levelStartedAt,
    // data: { [key: string]: number | null }
  })

  hideAllTiles()

  
  utils.timers.setTimeout(() => {
    queue.setNextPlayer()
  }, 2000)
}