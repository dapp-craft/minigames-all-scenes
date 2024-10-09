import { Entity, MeshCollider, MeshRenderer, Transform, TransformType, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { BOARD } from './board'
import { Tile } from '../components'

export function createTile(index: number) {
  const mainEntity = engine.addEntity()
  Transform.create(mainEntity, {
    position: Vector3.create(0, 0, 0),
    scale: Vector3.Zero(),
    parent: BOARD
  })
  MeshRenderer.setPlane(mainEntity)
  MeshCollider.setPlane(mainEntity)
  Tile.create(mainEntity, {
    index: index,
    position: { x: 0, y: 0 },
    inGame: false,
    image: '',
    boardSize: 3
  })
}

export function getInGameTiles(): Entity[] {
  const ret = []
  for (let [tile] of engine.getEntitiesWith(Tile)) {
    if (Tile.get(tile).inGame) {
      ret.push(tile)
    }
  }
  return ret
}

export function getAllTiles(): Entity[] {
  const ret = []
  for (let [tile] of engine.getEntitiesWith(Tile)) {
    ret.push(tile)
  }
  return ret
}
