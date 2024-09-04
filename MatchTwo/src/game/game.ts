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
  Tween,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { GameData, Tile } from './components/idnex'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { FLIP_DURATION, SYNC_ENTITY_OFFSET } from '../config'
import { ui, queue } from '@dcl-sdk/mini-games/src'
import { getPlayer } from '@dcl/sdk/players'
import { setupGameUI } from './UiObjects'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { tileShape, tileImages } from '../resources/resources'
import * as utils from '@dcl-sdk/utils'
import { init } from '@dcl-sdk/mini-games/src/config'


type TileType = {
  mainEntity: Entity,
  imageEntity: Entity,
  shapeEntity: Entity
}

let gameDataEntity: Entity

let tiles: TileType[] = []
export let flippedTileQueue: TileType[] = []


const gameState = {
  tilesCount: 10
}

export function initGame() {
  initGameDataEntity()

  setupGameUI()

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
  setImages()
}

function initGameDataEntity() {
  gameDataEntity = engine.addEntity()
  GameData.create(gameDataEntity)
  syncEntity(gameDataEntity, [GameData.componentId], SYNC_ENTITY_OFFSET)
}

function getReadyToStart() {
  // console.log('Get ready to start')
}

function initTiles() {
  const tilesCount = gameState.tilesCount
  for (let i = 0; i < tilesCount; i++) {
    createTile(i)
  }
}

function createTile(tileNumber: number) {
  const mainTileEntity = engine.addEntity()
  Transform.create(mainTileEntity, {
    position: Vector3.create(4 + (tileNumber % 5) * 1.2, 1 + (Math.floor(tileNumber / 5) * 1.2), 8)
  })
  Tile.create(mainTileEntity, {
    isFlipped: false,
    image: '',
    matched: false
  })

  // Image
  const tileImage = engine.addEntity()
  Transform.create(tileImage, {
    parent: mainTileEntity,
    position: Vector3.create(0, 0, 0)
  })
  MeshRenderer.setPlane(tileImage)

  // SHape
  const tileShapeEntity = engine.addEntity()
  Transform.create(tileShapeEntity, {
    parent: mainTileEntity,
    position: { x: 0, y: 0, z: -0.015 }
  })
  GltfContainer.create(tileShapeEntity, tileShape)

  const tile = {
    mainEntity: mainTileEntity,
    imageEntity: tileImage,
    shapeEntity: tileShapeEntity
  }

  pointerEventsSystem.onPointerDown(
    {
      entity: tileShapeEntity,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Click to flip the tile'
      }
    },
    () => onTileClick(tile)
  )

  tiles.push(tile)
}

async function onTileClick(tile: TileType) {
  // TODO use board rotation to define start and end rotation
  await flipTile(tile)
  checkIfMatch()
}

async function flipTile(tile: TileType) {
  const startRotation = Transform.get(tile.mainEntity).rotation
  const endRotation = Quaternion.multiply(startRotation, Quaternion.fromEulerDegrees(0, 180, 0))
  Tween.createOrReplace(tile.mainEntity, {
    mode: Tween.Mode.Rotate({
      start: startRotation,
      end: endRotation
    }),
    duration: FLIP_DURATION,
    easingFunction: EasingFunction.EF_EASECUBIC
  })
  
  const newTileState = !Tile.get(tile.mainEntity).isFlipped
  Tile.getMutable(tile.mainEntity).isFlipped = newTileState
  pointerEventsSystem.removeOnPointerDown(tile.shapeEntity)

  return new Promise<void>((resolve) => {
    utils.timers.setTimeout(() => {
      if (newTileState) flippedTileQueue.push(tile)
      resolve()
    }, FLIP_DURATION + 200)
  })
}

function setImages() {
  const tilesCount = gameState.tilesCount

  for (let i = 0; i < tilesCount; i++) {
    const image = tileImages[Math.floor(i / 2)].src

    const tile = tiles[i]
    const imageEntity = tile.imageEntity
    const tileEntity = tile.mainEntity

    Tile.getMutable(tileEntity).image = image
    console.log(imageEntity, image, i)
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

function checkIfMatch() {
  if (flippedTileQueue.length < 2) {
    return
  }
  const tile1 = flippedTileQueue.shift() as TileType
  const tile2 = flippedTileQueue.shift() as TileType
  if (Tile.get(tile1.mainEntity).image === Tile.get(tile2.mainEntity).image) {
    console.log('Match!')
    Tile.getMutable(tile1.mainEntity).matched = true
    Tile.getMutable(tile2.mainEntity).matched = true
  } else {
    console.log('No match')
    flipTile(tile1).then(() => {
      pointerEventsSystem.onPointerDown(
        {
          entity: tile1.shapeEntity,
          opts: {
            button: InputAction.IA_POINTER,
            hoverText: 'Click to flip the tile'
          }
        },
        () => onTileClick(tile1)
      )
    })
    flipTile(tile2).then(() => {
      pointerEventsSystem.onPointerDown(
        {
          entity: tile2.shapeEntity,
          opts: {
            button: InputAction.IA_POINTER,
            hoverText: 'Click to flip the tile'
          }
        },
        () => onTileClick(tile2)
      )
    })
    
    

  }
}