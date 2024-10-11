import {
  Entity,
  InputAction,
  MeshCollider,
  MeshRenderer,
  Transform,
  TransformType,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { BOARD } from './board'
import { Tile } from '../components'
import { onTileClick } from '..'
import { syncEntity } from '@dcl/sdk/network'

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

  syncEntity(mainEntity, [Tile.componentId], 5000 + index)

  pointerEventsSystem.onPointerDown(
    mainEntity,
    () => {
      onTileClick(mainEntity)
    },
    {
      hoverText: 'Click to move',
      button: InputAction.IA_POINTER
    }
  )
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

export function getTileAtPosition(position: { x: number; y: number }): Entity {
  const tile = getInGameTiles().find((tile) => {
    if (Tile.get(tile).position.x === position.x && Tile.get(tile).position.y === position.y) {
      return tile
    }
  })
  if (tile) return tile
  throw new Error('Tile not found')
}
