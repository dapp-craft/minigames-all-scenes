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
import { getImage, getImageUV } from './gameLogic/image'
// import { createTile } from '../gameObjects/tile'
import { GameData, Tile } from './components/definitions'
import { getTilePosition } from './gameLogic/tileCalculation'
import { Color4, Matrix, Quaternion, Vector3 } from '@dcl/sdk/math'
import { shuffleMatrix } from './gameLogic/shuffle'
import { syncEntity } from '@dcl/sdk/network'
import { MAX_BOARD_SIZE, MAX_LEVEL, mainEntityId, tileEntityBaseId } from './config'
import { tileShape } from '../resources/resources'
import { progress, queue, ui } from '@dcl-sdk/mini-games/src'
import { getPlayer } from '@dcl/sdk/players'
import { movePlayerTo } from '~system/RestrictedActions'
import * as utils from '@dcl-sdk/utils'
import { sceneParentEntity, soundManager } from '../globals'
import { init } from '@dcl-sdk/mini-games/src/config'
import { EASY_MODE } from '../config'
import { initStatusBoard } from './gameLogic/statusBoard'

const BOARD_TRANSFORM: TransformType = {
  position: { x: 8, y: 2.6636881828308105, z: 1.0992899895 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: Quaternion.fromAngleAxis(180, Vector3.create(0, 1, 0))
}

export let gameDataEntity: Entity

let boardEntity: Entity
let tiles: { [key: number]: Entity } = {}
let tilesShape: { [key: number]: Entity } = {}
let tileImages: { [key: number]: Entity } = {}
let gameButtons: ui.MenuButton[] = []
let maxProgress: progress.IProgress

// GameUI
let timer: ui.Timer3D

// game state
export let gameState: {
  lvl: number
  moves: number
  levelStartedAt: number
  levelFinishedAt: number
  size: number
  matrix: number[][]
} = {
  lvl: 0,
  moves: 0,
  levelStartedAt: 0,
  levelFinishedAt: 0,
  size: 0,
  matrix: []
}

const TileMoveDirection = {
  UP: { row: -1, column: 0 },
  DOWN: { row: 1, column: 0 },
  LEFT: { row: 0, column: -1 },
  RIGHT: { row: 0, column: 1 }
}

export async function initGame() {
  await initMaxProgress()

  initGameDataEntity()

  initBoard()

  initTiles()

  hideAllTiles()

  initGameButtons()

  initCountdownNumbers()

  initStatusBoard()

  setupWinAnimations()

  queue.listeners.onActivePlayerChange = (player) => {
    const localPlayer = getPlayer()
    if (player?.address === localPlayer?.userId) {
      getReadyToStart()
    } else {
      GameData.createOrReplace(gameDataEntity, {
        playerAddress: '',
        playerName: '',
        moves: 0,
        levelStartedAt: 0,
        levelFinishedAt: 0
      })
    }
  }
}

function getReadyToStart() {
  console.log('Get Ready to start!')

  utils.timers.setTimeout(() => {
    startGame()
  }, 2000)
}

async function startGame() {
  const localPlayer = getPlayer()

  GameData.createOrReplace(gameDataEntity, {
    playerAddress: localPlayer?.userId,
    playerName: localPlayer?.name
  })

  movePlayerTo({
    newRelativePosition: Vector3.create(8, 1, 4)
  })
  console.log('Max progress', maxProgress)
  const levelToStart = maxProgress?.level ? Math.min(maxProgress?.level + 1, MAX_LEVEL) : 1
  console.log('Starting level', levelToStart)

  // Update buttons
  gameButtons.forEach((button, i) => {
    if (i <= MAX_LEVEL - 1) {
      //set level buttons according to currentLevel
      //TODO: check max level played on progress
      if (i < maxProgress?.level + 1 || i == 0) {
        button.enable()
      } else {
        button.disable()
      }
    } else {
      button.enable()
    }
  })

  startNewLevel(levelToStart)
}

function startNewLevel(level: number) {
  if (!queue.isActive()) return

  hideAllTiles()

  removeTilesPointerEvents()

  const gameData = GameData.getMutable(gameDataEntity)
  gameData.moves = 0

  gameState.lvl = level
  gameState.moves = 0
  gameState.size = getLevelSize(level)
  gameState.matrix = []

  gameState.matrix = Array.from({ length: gameState.size }, (_, rowIndex) =>
    Array.from({ length: gameState.size }, (_, colIndex) => rowIndex * gameState.size + colIndex + 1)
  )
  console.log('Matrix init')
  gameState.matrix.forEach((row) => console.log(row.join(' ')))
  gameState.matrix[gameState.size - 1][gameState.size - 1] = -1

  gameState.matrix = shuffleMatrix(gameState.matrix, 100)
  console.log('Matrix shuffled')
  gameState.matrix.forEach((row) => console.log(row.join(' ')))

  setImage(level)

  countdown(() => {
    gameData.levelStartedAt = Date.now()
    gameData.levelFinishedAt = 0

    gameState.levelStartedAt = Date.now()
    gameState.levelFinishedAt = 0

    setTiles()
    setTilesPointerEvents()

    for (let i = 1; i < gameState.size * gameState.size; i++) {
      updateTile(i)
    }
  }, 4)
}

function initGameDataEntity() {
  gameDataEntity = engine.addEntity()
  GameData.create(gameDataEntity, {})
  syncEntity(gameDataEntity, [GameData.componentId], mainEntityId)
}

function initBoard() {
  boardEntity = engine.addEntity()
  Transform.create(boardEntity, BOARD_TRANSFORM)
  syncEntity(boardEntity, [Transform.componentId], mainEntityId + 1)
}

function initTiles() {
  for (let i = 1; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    const tile = engine.addEntity()
    tiles[i] = tile
    Transform.create(tile, {
      // Hack to avoid z-flickering
      position: Vector3.create(0, 0, i * 0.001),
      scale: Vector3.create(1, 1, 1),
      parent: boardEntity
    })
    Tile.create(tile, { number: i })

    // Create the tile model
    const shape = engine.addEntity()
    GltfContainer.create(shape, tileShape)
    Transform.create(shape, { parent: tile })
    tilesShape[i] = shape

    // Image
    const image = engine.addEntity()
    Transform.create(image, {
      position: { x: 0, y: 0, z: -0.015 },
      parent: tile
    })
    MeshRenderer.setPlane(image, getImageUV(3, i))
    tileImages[i] = image

    syncEntity(tile, [Transform.componentId], tileEntityBaseId + i * 10 + 1)
    // syncEntity(shape, [Transform.componentId], tileEntityBaseId + i * 10 + 2)
    syncEntity(
      image,
      [Transform.componentId, MeshRenderer.componentId, Material.componentId],
      tileEntityBaseId + i * 10 + 3
    )
  }
}

function setImage(lvl: number) {
  const image = getImage(lvl)

  const size = gameState.size
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
  const size = gameState.size
  for (let i = 1; i < size * size; i++) {
    Transform.getMutable(tiles[i]).scale = Vector3.fromArray(Array(3).fill(3 / size))
  }
}

function updateTile(tileNumber: any) {
  validateTileNumber(tileNumber)

  const tile = tiles[tileNumber]
  const gameData = GameData.get(gameDataEntity)

  const { row, column } = getRowColumn(tileNumber)

  const position = getTilePosition(gameState.size, row, column)

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

  const gameData = GameData.getMutable(gameDataEntity)

  const { row, column } = getRowColumn(tileNumber)
  const newRow = row + TileMoveDirection[direction].row
  const newColumn = column + TileMoveDirection[direction].column

  gameState.matrix[newRow][newColumn] = tileNumber
  gameState.matrix[row][column] = -1
  updateTile(tileNumber)

  if (isSolved()) {
    removeTilesPointerEvents()
    utils.timers.setTimeout(() => {
      finishGame()
    }, 1000)
  }
}

function onTileClick(tileNumber: number) {
  validateTileNumber(tileNumber)

  let tilesToMove: number[] = []

  const gameData = GameData.get(gameDataEntity)
  const matrix = gameState.matrix
  const size = gameState.size

  const { row, column } = getRowColumn(tileNumber)

  // Up
  for (let i = row - 1; i >= 0; i--) {
    tilesToMove.push(matrix[i + 1][column])
    if (matrix[i][column] === -1) {
      tilesToMove.reverse()
      soundManager.playSound('slide')
      tilesToMove.forEach((tile) => moveOneTile(tile))
      GameData.getMutable(gameDataEntity).moves++
      return
    }
  }
  tilesToMove = []

  // Down
  for (let i = row + 1; i < size; i++) {
    tilesToMove.push(matrix[i - 1][column])
    if (matrix[i][column] === -1) {
      tilesToMove.reverse()
      soundManager.playSound('slide')
      tilesToMove.forEach((tile) => moveOneTile(tile))
      GameData.getMutable(gameDataEntity).moves++
      return
    }
  }
  tilesToMove = []

  // Left
  for (let i = column - 1; i >= 0; i--) {
    tilesToMove.push(matrix[row][i + 1])
    if (matrix[row][i] === -1) {
      tilesToMove.reverse()
      soundManager.playSound('slide')
      tilesToMove.forEach((tile) => moveOneTile(tile))
      GameData.getMutable(gameDataEntity).moves++
      return
    }
  }
  tilesToMove = []

  // Right
  for (let i = column + 1; i < size; i++) {
    tilesToMove.push(matrix[row][i - 1])
    if (matrix[row][i] === -1) {
      tilesToMove.reverse()
      soundManager.playSound('slide')
      tilesToMove.forEach((tile) => moveOneTile(tile))
      GameData.getMutable(gameDataEntity).moves++
      return
    }
  }
}

function getMoveDirection(tileNumber: number): keyof typeof TileMoveDirection | undefined {
  validateTileNumber(tileNumber)

  const gameData = GameData.get(gameDataEntity)
  const matrix = gameState.matrix
  const size = gameState.size

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

  const gameData = GameData.get(gameDataEntity)
  const matrix = gameState.matrix
  const size = gameState.size

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
  let size = gameState.size
  if (!(tileNumber >= 1 && tileNumber < size * size)) throw new Error('Invalid tile number')
}

function isSolved() {
  const gameData = GameData.get(gameDataEntity)
  const matrix = gameState.matrix
  const size = gameState.size

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

async function finishGame() {
  const gameData = GameData.getMutable(gameDataEntity)
  gameData.levelFinishedAt = Date.now()

  console.log('Solved!')
  console.log('GameData:', GameData.get(gameDataEntity))

  gameData.moves = gameState.moves
  gameData.levelFinishedAt = Date.now()
  gameData.levelStartedAt = gameState.levelStartedAt

  progress.upsertProgress({
    level: gameState.lvl,
    score: gameState.moves * 10,
    moves: gameState.moves,
    time: gameState.levelFinishedAt - gameState.levelStartedAt
  })

  hideAllTiles()

  startWinAnimation()
}

function getLevelSize(level: number): number {
  if (EASY_MODE) return 3
  if (level % 3 == 0) return 5
  if (level % 3 == 1) return 3
  if (level % 3 == 2) return 4
  return 3
}

function initGameButtons() {
  for (let i = 0; i < MAX_LEVEL; i++) {
    let buttonOffset = MAX_LEVEL % 2 === 0 ? MAX_LEVEL / 2 - 0.5 : Math.floor(MAX_LEVEL / 2)
    buttonOffset *= 0.75
    gameButtons.push(
      new ui.MenuButton(
        {
          parent: sceneParentEntity,
          position: Vector3.create(buttonOffset - 0.75 * i, 0.75, -6.2007100105),
          scale: Vector3.create(2.4, 2.4, 2.4),
          rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
        },
        ui.uiAssets.shapes.SQUARE_GREEN,
        ui.uiAssets.numbers[i + 1],
        `START LEVEL ${i + 1}`,
        () => {
          startNewLevel(i + 1)
        }
      )
    )
  }

  gameButtons.push(new ui.MenuButton({
    parent: sceneParentEntity,
    position: Vector3.create(-2.75, 4.30, 0.1),
    scale: Vector3.create(2.4, 2.4, 2.4),
    rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
  },
    ui.uiAssets.shapes.SQUARE_RED,
    ui.uiAssets.icons.restart,
    "RESTART LEVEL",
    () => {console.log('Restarting level')}
  ))

  gameButtons.push(new ui.MenuButton({
    parent: sceneParentEntity,
    position: Vector3.create(-2.6, 5.7, 0.1),
    scale: Vector3.create(2.4, 2.4, 2.4),
    rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
  },
    ui.uiAssets.shapes.SQUARE_RED,
    ui.uiAssets.icons.sound,
    'Sound FX',
    () => {console.log('Sound FX')}
  ))

  gameButtons.push(new ui.MenuButton({
    parent: sceneParentEntity,
    position: Vector3.create(2.75, 5.7, 0.1),
    scale: Vector3.create(2.4, 2.4, 2.4),
    rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
  },
    ui.uiAssets.shapes.RECT_RED,
    ui.uiAssets.icons.exitText,
    'Exit from game area',
    () => {console.log('Exit from game area')}
  ))

  new ui.MenuButton({
    parent: sceneParentEntity,
    position: Vector3.create(-3.3, 5.7, 0.1),
    scale: Vector3.create(2.4, 2.4, 2.4),
    rotation: Quaternion.fromEulerDegrees(-90, 90, 90)
},
    ui.uiAssets.shapes.SQUARE_RED,
    ui.uiAssets.icons.music,
    'Play/Stop Music',
    () => {console.log("Play/Stop Music")}
)
}

async function initMaxProgress() {
  console.log('Fetching progress', Object.keys(progress))
  let req = await progress.getProgress('level', progress.SortDirection.DESC, 1)
  if (req?.length) maxProgress = req[0]
}

function setTilesPointerEvents() {
  const size = gameState.size
  for (let i = 1; i < size * size; i++) {
    pointerEventsSystem.onPointerDown(
      {
        entity: tilesShape[i],
        opts: { button: InputAction.IA_POINTER, hoverText: i.toString() }
      },
      () => {
        onTileClick(i)
      }
    )
  }
}

function removeTilesPointerEvents() {
  for (let i = 1; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    pointerEventsSystem.removeOnPointerDown(tilesShape[i])
  }
}

function score(lvl: number, moves: number, time: number): number {
  const TMax = 5 * 60 * 1000
  return Math.floor((((1000 * lvl) / moves) * Math.max(TMax - time, 1000)) / TMax)
}

function initCountdownNumbers() {
  timer = new ui.Timer3D(
    {
      parent: sceneParentEntity,
      position: Vector3.create(0, 3, -6),
      rotation: Quaternion.fromEulerDegrees(0, 0, 0)
    },
    1,
    1,
    false,
    10
  )

  timer.hide()
}

async function countdown(cb: () => void, number: number) {
  let currentValue = number
  let time = 1

  engine.addSystem(
    (dt: number) => {
      time += dt

      if (time >= 1) {
        time = 0

        if (currentValue > 0) {
          timer.show()
          timer.setTimeAnimated(currentValue--)
        } else {
          timer.hide()
          engine.removeSystem('countdown-system')
          cb && cb()
        }
      }
    },
    undefined,
    'countdown-system'
  )
}


function setupWinAnimations() {
  let winAnimA = engine.addEntity()
  let winAnimB = engine.addEntity()
  let winAnimC = engine.addEntity()
  let winAnimFollow = engine.addEntity()
  let winAnimText = engine.addEntity()

  GltfContainer.create(winAnimA, {
    src: "mini-game-assets/models/winAnim.glb",

  })

  Transform.create(winAnimA, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, 45, 0)
  })

  Animator.create(winAnimA, {
    states: [
      {
        clip: 'armature_psAction',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimB, {
    src: "mini-game-assets/models/winAnim.glb"

  })

  Transform.create(winAnimB, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0)
  })

  Animator.create(winAnimB, {
    states: [
      {
        clip: 'armature_psAction',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimC, {
    src: "mini-game-assets/models/winAnim.glb"
  })

  Transform.create(winAnimC, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(1, 1, 1),
    rotation: Quaternion.fromEulerDegrees(0, -45, 0)
  })

  Animator.create(winAnimC, {
    states: [
      {
        clip: 'armature_psAction',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimFollow, {
    src: "mini-game-assets/models/winAnimFollow.glb"
  })

  Transform.create(winAnimFollow, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(0.3, 0.3, 0.3),
    rotation: Quaternion.fromEulerDegrees(0, -90, 0)
  })
  Billboard.create(winAnimFollow, {})

  Animator.create(winAnimFollow, {
    states: [
      {
        clip: 'RaysAnim',
        playing: false,
        loop: false
      }
    ]
  })

  GltfContainer.create(winAnimText, {
    src: "mini-game-assets/models/winAnimText.glb"
  })

  Animator.create(winAnimText, {
    states: [
      {
        clip: 'Animation',
        playing: false,
        loop: false
      }
    ]
  })

  Transform.create(winAnimText, {
    parent: sceneParentEntity,
    position: Vector3.create(0, 3, -6),
    scale: Vector3.create(0.8, 0.8, 0.8),
    rotation: Quaternion.fromEulerDegrees(0, -90, 0)
  })
  Billboard.create(winAnimText, {})

  VisibilityComponent.create(winAnimA, { visible: false })
  VisibilityComponent.create(winAnimB, { visible: false })
  VisibilityComponent.create(winAnimC, { visible: false })
  VisibilityComponent.create(winAnimFollow, { visible: false })
  VisibilityComponent.create(winAnimText, { visible: false })

  syncEntity(winAnimA, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimB, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimC, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimFollow, [VisibilityComponent.componentId, Animator.componentId])
  syncEntity(winAnimText, [VisibilityComponent.componentId, Animator.componentId])
}


function startWinAnimation() {
  const animations = engine.getEntitiesWith(Animator, VisibilityComponent)
  for (const [entity] of animations) {
    VisibilityComponent.getMutable(entity).visible = true
    Animator.getMutable(entity).states[0].playing = true
  }

  utils.timers.setTimeout(() => {

    const animations = engine.getEntitiesWith(Animator, VisibilityComponent)
    for (const [entity] of animations) {
      VisibilityComponent.getMutable(entity).visible = false
    }
    console.log("GameData current level: ", GameData.get(gameDataEntity).currentLevel)
    if (gameState.lvl <= MAX_LEVEL) {
      // console.log("playersQueue: ", queue.getQueue())
      //add challenge check
      if (queue.getQueue().length > 1) {
        queue.setNextPlayer()
      } else {
        const nextLevel = Math.min(gameState.lvl + 1, MAX_LEVEL)
        gameButtons[nextLevel - 1].enable()
        startNewLevel(nextLevel)
      }
    }
  }, 8000)
}