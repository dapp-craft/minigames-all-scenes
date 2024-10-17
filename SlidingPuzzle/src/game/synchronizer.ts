import { Entity, engine, Transform, Tween, PBTween, EasingFunction } from '@dcl/sdk/ecs'
import { TileType } from './type'
import { Tile } from './components'
import { getTilePosition, tileRowColumn } from './utils/tileCalculation'
import { Vector3 } from '@dcl/sdk/math'
import { updateTileImage } from './utils/tile'
import { getAllTiles } from './gameObjects'
import * as utils from '@dcl-sdk/utils'

const tileLatest: Record<Entity, TileType> = {}

export function setupSynchronizer() {
  getAllTiles().forEach((tile) => {
    setTile(tile)
    tileLatest[tile] = JSON.parse(JSON.stringify(Tile.get(tile)))
  })
  engine.addSystem(() => {
    for (const [tileEntity] of engine.getEntitiesWith(Tile)) {
      const tileDataHash = hash(Tile.get(tileEntity))
      if (hash(tileLatest[tileEntity]) !== tileDataHash) {
        updateTile(tileEntity)
        // Dirty hack to avoid reference to the same object in nested objects
        tileLatest[tileEntity] = JSON.parse(JSON.stringify(Tile.get(tileEntity)))
      }
    }
  })
}

export function updateTile(tile: Entity) {
  const oldState = tileLatest[tile]
  const newState = Tile.get(tile)

  if (!oldState.inGame && !newState.inGame) return

  if ((oldState.inGame || newState.inGame) && oldState.inGame !== newState.inGame) {
    setTile(tile)
    return
  }

  if (oldState.boardSize !== newState.boardSize) {
    setTile(tile)
    return
  }

  if (oldState.position.x !== newState.position.x || oldState.position.y !== newState.position.y) {
    createTween(tile, {
      mode: Tween.Mode.Move({
        start: Transform.get(tile).position,
        end: getTilePosition(newState.boardSize, newState.position.x, newState.position.y)
      }),
      duration: 500,
      easingFunction: EasingFunction.EF_EASECUBIC
    })
  }
}

// it is not really a hash function)))
function hash(data: any) {
  return JSON.stringify(data)
}

function setTile(tile: Entity) {
  const tileData = Tile.getOrNull(tile)
  if (tileData == null) throw new Error('Tile component not found')
  if (tileData.inGame) {
    const scale = 3 / tileData.boardSize
    Transform.getMutable(tile).scale = Vector3.scale(Vector3.One(), scale)
  } else {
    Transform.getMutable(tile).scale = Vector3.Zero()
  }

  Transform.getMutable(tile).position = getTilePosition(tileData.boardSize, tileData.position.x, tileData.position.y)
  updateTileImage(tile)
}

function createTween(entity: Entity, tween: PBTween) {
  Tween.deleteFrom(entity)
  utils.timers.setTimeout(() => {
    Tween.createOrReplace(entity, tween)
  }, 100)
}
