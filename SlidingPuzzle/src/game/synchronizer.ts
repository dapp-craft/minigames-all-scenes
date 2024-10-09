import { Entity, engine, Transform } from '@dcl/sdk/ecs'
import { TileType } from './type'
import { Tile } from './components'
import { getTilePosition, tileRowColumn } from './utils/tileCalculation'
import { Vector3 } from '@dcl/sdk/math'
import { updateTileImage } from './utils/tile'

const tileLatest: Record<Entity, TileType> = {}

export function setupSynchronizer() {
  engine.addSystem(() => {
    for (const [tileEntity] of engine.getEntitiesWith(Tile)) {
      const tileDataHash = hash(Tile.get(tileEntity))
      if (hash(tileLatest[tileEntity]) !== tileDataHash) {
        if (tileLatest[tileEntity]) updateTile(tileEntity)
        // Dirty hack to avoid reference to the same object in nested objects
        tileLatest[tileEntity] = JSON.parse(JSON.stringify(Tile.get(tileEntity)))
      }
    }
  })
}

export function updateTile(tile: Entity) {
  console.log('updateTile', tile)
  console.log('oldHash', hash(tileLatest[tile]))

  const oldState = tileLatest[tile]
  const newState = Tile.get(tile)
  if (oldState.position.x !== newState.position.x || oldState.position.y !== newState.position.y) {
    Transform.getMutable(tile).position = getTilePosition(newState.boardSize, newState.position.x, newState.position.y)
  }

  if (oldState.inGame === false && newState.inGame === true) {
    const scale = 3 / newState.boardSize
    Transform.getMutable(tile).scale = Vector3.scale(Vector3.One(), scale)
  }

  if (oldState.inGame === true && newState.inGame === false) {
    Transform.getMutable(tile).scale = Vector3.Zero()
  }

  if (oldState.image !== newState.image) {
    updateTileImage(tile)
  }

  if (oldState.boardSize !== newState.boardSize) {
    const scale = 3 / newState.boardSize
    Transform.getMutable(tile).scale = Vector3.scale(Vector3.One(), scale)
  }
}

// it is not really a hash function)))
function hash(data: any) {
  return JSON.stringify(data)
}
