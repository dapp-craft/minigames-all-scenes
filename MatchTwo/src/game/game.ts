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
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { GameData, Tile } from './components/idnex'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { FLIP_DURATION, TILES_LEVEL, SYNC_ENTITY_OFFSET, MAX_IMAGES } from '../config'
import { ui, queue } from '@dcl-sdk/mini-games/src'
import { getPlayer } from '@dcl/sdk/players'
import { setupGameUI } from './UiObjects'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { defaulToyModel, tileDoorShape, tileShape, toysModels } from '../resources/resources'
import * as utils from '@dcl-sdk/utils'
import { init } from '@dcl-sdk/mini-games/src/config'
import { movePlayerTo } from '~system/RestrictedActions'
import { setTilesPositions, tilesPositions } from './tilesPositions'
import { fetchPlayerProgress, playerProgress, updatePlayerProgress } from './syncData'

type TileType = {
  mainEntity: Entity
  toyEntity: Entity
  doorEntity: Entity
}

let gameDataEntity: Entity

let tiles: TileType[] = []
export let flippedTileQueue: TileType[] = []

export const gameState = {
  tilesCount: 32,
  level: 1,
  moves: 0,
  levelStartTime: 0,
  levelFinishTime: 0
}

export async function initGame() {

  await fetchPlayerProgress()

  initGameDataEntity()

  setupGameUI()

  await setTilesPositions()

  queue.listeners.onActivePlayerChange = (player) => {
    const localPlayer = getPlayer()
    if (player?.address === localPlayer?.userId) {
      getReadyToStart()
    } else {
      GameData.createOrReplace(gameDataEntity, {
        playerAddress: '',
        playerName: '',
        levelStartTime: 0,
        levelEndTime: 0
      })
    }
  }

  initTiles()
}

function initGameDataEntity() {
  gameDataEntity = engine.addEntity()
  GameData.create(gameDataEntity)
  syncEntity(gameDataEntity, [GameData.componentId], SYNC_ENTITY_OFFSET)
}

function initTiles() {
  const tilesCount = MAX_IMAGES
  for (let i = 0; i < tilesCount; i++) {
    createTile(i)
  }
}

function createTile(tileNumber: number) {
  const mainTileEntity = engine.addEntity()
  Transform.create(mainTileEntity, tilesPositions.toys[tileNumber])
  Tile.create(mainTileEntity, {
    isFlipped: false,
    toyModel: defaulToyModel.src,
    matched: false,
    tileNumber: tileNumber
  })

  // Image
  const tileToy = engine.addEntity()
  Transform.create(tileToy, tilesPositions.toys[tileNumber])
  GltfContainer.create(tileToy, toysModels[tileNumber % toysModels.length])

  // SHape
  const tileDoorEntity = engine.addEntity()
  Transform.create(tileDoorEntity, tilesPositions.doors[tileNumber])
  GltfContainer.create(tileDoorEntity, tileDoorShape)

  const tile = {
    mainEntity: mainTileEntity,
    toyEntity: tileToy,
    doorEntity: tileDoorEntity
  }

  syncEntity(
    mainTileEntity,
    [Tile.componentId],
    SYNC_ENTITY_OFFSET + 100 + tileNumber * 4 + 0
  )
  syncEntity(tileToy, [GltfContainer.componentId], SYNC_ENTITY_OFFSET + 100 + tileNumber * 4 + 1)
  syncEntity(tileDoorEntity, [Transform.componentId], SYNC_ENTITY_OFFSET + 100 + tileNumber * 4 + 2)

  tiles.push(tile)
}

async function onTileClick(tile: TileType) {
  // TODO use board rotation to define start and end rotation
  await openTile(tile)
  checkIfMatch()
}

async function openTile(tile: TileType) {
  const startRotation = Transform.get(tile.doorEntity).rotation
  const endRotation = Quaternion.multiply(startRotation, Quaternion.fromEulerDegrees(0, 90, 0))
  Tween.createOrReplace(tile.doorEntity, {
    mode: Tween.Mode.Rotate({
      start: startRotation,
      end: endRotation
    }),
    duration: FLIP_DURATION,
    easingFunction: EasingFunction.EF_EASECUBIC
  })

  Tile.getMutable(tile.mainEntity).isFlipped = true
  pointerEventsSystem.removeOnPointerDown(tile.doorEntity)

  return new Promise<void>((resolve) => {
    utils.timers.setTimeout(() => {
      flippedTileQueue.push(tile)
      resolve()
    }, FLIP_DURATION + 100)
  })
}

async function closeTile(tile: TileType) {
  const startRotation = Transform.get(tile.doorEntity).rotation
  const endRotation = tilesPositions.doors[Tile.get(tile.mainEntity).tileNumber].rotation
  Tween.createOrReplace(tile.doorEntity, {
    mode: Tween.Mode.Rotate({
      start: startRotation,
      end: endRotation
    }),
    duration: FLIP_DURATION,
    easingFunction: EasingFunction.EF_EASECUBIC
  })
  Tile.getMutable(tile.mainEntity).isFlipped = false
  pointerEventsSystem.onPointerDown(
    {
      entity: tile.doorEntity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Click to flip the tile'
      }
    },
    () => {
      onTileClick(tile)
    }
  )
  return new Promise<void>((resolve) => {
    utils.timers.setTimeout(() => {
      resolve()
    }, FLIP_DURATION + 100)
  })
}

function getReadyToStart() {
  console.log('Get ready to start')
  utils.timers.setTimeout(() => {
    movePlayerTo({
      newRelativePosition: { x: 8, y: 1, z: 7 }
    })
    const levetToStart = (playerProgress?.level ?? 0) + 1
    startLevel(levetToStart as keyof typeof TILES_LEVEL)
  }, 2000)
}

async function startLevel(level: keyof typeof TILES_LEVEL) {
  console.log('Start level', level)

  await Promise.all(tiles.map((tile) => resetTile(tile)))

  const tilesInUse = tiles.filter((tile) => TILES_LEVEL[level].includes(Tile.get(tile.mainEntity).tileNumber))
  const tilesNotInUse = tiles.filter((tile) => !TILES_LEVEL[level].includes(Tile.get(tile.mainEntity).tileNumber))

  gameState.tilesCount = TILES_LEVEL[level].length
  gameState.level = level
  gameState.levelStartTime = Date.now()
  gameState.moves = 0
  gameState.levelFinishTime = 0

  tilesNotInUse.forEach((tile) => {
    disableTile(tile)
  })


  const toys = getToys(level)
  shuffleArray(toys)


  tilesInUse.forEach((tile, index) => {
    setTileToy(tile, toys[index].src)
  })
}

function setImages() {
  const tilesCount = gameState.tilesCount

  for (let i = 0; i < tilesCount; i++) {
    const image = toysModels[Math.floor(i / 2)].src
    const tile = tiles[i]
    setTileToy(tile, image)
  }
}

function setTileToy(tile: TileType, toyModel: string) {
  Tile.getMutable(tile.mainEntity).toyModel = toyModel
  GltfContainer.createOrReplace(tile.toyEntity, { src: toyModel })
}

function checkIfMatch() {
  if (flippedTileQueue.length < 2) {
    return
  }

  gameState.moves++
  const tile1 = flippedTileQueue.shift() as TileType
  const tile2 = flippedTileQueue.shift() as TileType
  if (Tile.get(tile1.mainEntity).toyModel === Tile.get(tile2.mainEntity).toyModel) {
    console.log('Match!')
    Tile.getMutable(tile1.mainEntity).matched = true
    Tile.getMutable(tile2.mainEntity).matched = true

    if (
      tiles.filter((tile) => Tile.get(tile.mainEntity).inGame).filter((tile) => !Tile.get(tile.mainEntity).matched)
        .length === 0
    ) {
      console.log('Game over')
      finishLevel()
    }
  } else {
    console.log('No match')
    closeTile(tile1).then(() => {
      pointerEventsSystem.onPointerDown(
        {
          entity: tile1.doorEntity,
          opts: {
            button: InputAction.IA_POINTER,
            hoverText: 'Click to open the tile'
          }
        },
        () => {
          onTileClick(tile1)
        }
      )
    })
    closeTile(tile2).then(() => {
      pointerEventsSystem.onPointerDown(
        {
          entity: tile2.doorEntity,
          opts: {
            button: InputAction.IA_POINTER,
            hoverText: 'Click to open the tile'
          }
        },
        () => {
          onTileClick(tile2)
        }
      )
    })
  }
}

function disableTile(tile: TileType) {
  pointerEventsSystem.removeOnPointerDown(tile.doorEntity)
  Transform.getMutable(tile.doorEntity).scale = Vector3.create(0.1, 0.1, 0.1)
  Tile.getMutable(tile.mainEntity).inGame = false
}

function finishLevel() {
  console.log('Level finished')

  gameState.levelFinishTime = Date.now()
  updatePlayerProgress(gameState)

  if (queue.getQueue().length > 1) {
    queue.setNextPlayer()
  } else {
    const levelToStart = gameState.level == Object.keys(TILES_LEVEL).length ? 1 : gameState.level + 1
    startLevel(levelToStart as keyof typeof TILES_LEVEL)
  }
}

async function resetTile(tile: TileType) {
  Tile.getMutable(tile.mainEntity).isFlipped = false
  Tile.getMutable(tile.mainEntity).matched = false
  Tile.getMutable(tile.mainEntity).inGame = true
  setTileToy(tile, defaulToyModel.src)
  pointerEventsSystem.onPointerDown(
    {
      entity: tile.doorEntity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Click to flip the tile'
      }
    },
    () => {
      onTileClick(tile)
    }
  )
  Tween.createOrReplace(tile.doorEntity, {
    mode: Tween.Mode.Rotate({
      start: Transform.get(tile.doorEntity).rotation,
      end: tilesPositions.doors[Tile.get(tile.mainEntity).tileNumber].rotation
    }),
    duration: FLIP_DURATION,
    easingFunction: EasingFunction.EF_EASECUBIC,
  })
  Transform.getMutable(tile.doorEntity).scale = Vector3.create(1, 1, 1)
}

function getToys(level: keyof typeof TILES_LEVEL) {
  const tilesCount = gameState.tilesCount
  const toys = toysModels.slice(0, tilesCount / 2)
  toys.push(...toys)
  return toys
}

function shuffleArray(array: any[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
  return array
}