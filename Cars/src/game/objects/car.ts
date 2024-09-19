import {
    ColliderLayer,
    Entity,
    Material,
    MeshCollider,
    MeshRenderer,
    Transform,
    TransformType,
    engine
  } from '@dcl/sdk/ecs'
  import { Vector3 } from '@dcl/ecs-math'
  import { BOARD_PHYSICAL_SIZE, CELL_SIZE_RELATIVE } from '../../config'
  import { Quaternion } from '@dcl/sdk/math'
import { BOARD } from './board'
import { Car } from '../components/definitions'
import { CarDirection, Cell } from '../type'
import { syncEntity } from '@dcl/sdk/network'

export function createCar(cell: Cell, id: number) {
    const car = engine.addEntity()
    Transform.create(car, {
      position: Vector3.Zero(),
      scale: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
      rotation: Quaternion.Identity(),
      parent: BOARD
    })
    Car.create(car, {
      position: cell,
      direction: Math.floor(Math.random() * 4) as CarDirection,
      length: 2,
      inGame: true
    })
    syncEntity(car, [Car.componentId], id)
    return car
  }