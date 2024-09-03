import { EasingFunction, Entity, GltfContainer, InputAction, Material, MaterialTransparencyMode, MeshRenderer, TextureFilterMode, Transform, Tween, engine, pointerEventsSystem } from '@dcl/sdk/ecs'
import { GameData, Tile } from './components/idnex'
import { parentEntity, syncEntity } from '@dcl/sdk/network'
import { FLIP_DURATION, SYNC_ENTITY_OFFSET } from '../config'
import { ui, queue } from '@dcl-sdk/mini-games/src'
import { getPlayer } from '@dcl/sdk/players'
import { setupGameUI } from './UiObjects'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { tileShape, tileImages } from '../resources/resources'
import * as utils from '@dcl-sdk/utils'

let gameDataEntity: Entity


let tiles: Entity[] = []
let imageTiles: Entity[] = []

const gameState = {
  tilesCount: 1,
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

  createTile(0)
  setImages()
}

function initGameDataEntity() {
  gameDataEntity = engine.addEntity()
  GameData.create(gameDataEntity)
  syncEntity(gameDataEntity, [GameData.componentId], SYNC_ENTITY_OFFSET)
}



function getReadyToStart() {
  console.log("Get ready to start")
}


function createTile(imageNumber: number) {
  const image = tileImages[imageNumber]
  const tile = engine.addEntity()
  Transform.create(tile, {
    position: Vector3.create(8, 1, 8)
  })
  Tile.create(tile, {
    isFlipped: false,
    image: image.src
  })


  // Image
  const tileImage = engine.addEntity()
  Transform.create(tileImage, {
    parent: tile,
    position: Vector3.create(0, 0, 0)
  })
  MeshRenderer.setPlane(tileImage)
  imageTiles.push(tileImage)

  // SHape
  const tileShapeEntity = engine.addEntity()
  Transform.create(tileShapeEntity, {
    parent: tile,
    position: { x: 0, y: 0, z: -0.015 },
  })
  GltfContainer.create(tileShapeEntity, tileShape)

  pointerEventsSystem.onPointerDown({
    entity: tileShapeEntity,
    opts: {
      button: InputAction.IA_POINTER,
      hoverText: 'Click to flip the tile'
    }
  }, (e) => {
    onTileClick(tile)
  })
}


function onTileClick(tile: Entity) {
  
  // TODO use board rotation to define start and end rotation
  const startRotation = Transform.get(tile).rotation
  const endRotation = Quaternion.multiply(startRotation, Quaternion.fromEulerDegrees(0, 180, 0))
  Tween.createOrReplace(tile, {
    mode: Tween.Mode.Rotate({
      start: startRotation,
      end: endRotation,
    }),
    duration: FLIP_DURATION,
    easingFunction: EasingFunction.EF_EASECUBIC
  })
}

function setImages() {
  
  const tilesCount = gameState.tilesCount

  for (let i = 0; i < tilesCount; i++) {

    const image = tileImages[Math.floor(i / 2)].src

    const imageEntity = imageTiles[i]

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