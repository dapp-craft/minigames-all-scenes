import { Entity, Transform, TransformType, engine } from '@dcl/sdk/ecs'
import { Vector3, Quaternion } from '@dcl/sdk/math'
import { BOARD } from './board'
import { Tile } from '../components'

function createTile(index: number) {
  const mainEntity = engine.addEntity()
  Transform.create(mainEntity, {
    position: Vector3.create(0, 0, 0),
    scale: Vector3.create(0, 0, 0),
    parent: BOARD
  })
  Tile.create(mainEntity, {
    index: index,
    position: { x: 0, y: 0 },
    inGame: false,
    image: '',
    boardSize: 0
  })
}
