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

export let MAIN_CAR: Entity

export function createCar(id: number) {
  const car = engine.addEntity()
  Transform.create(car, {
    position: Vector3.Zero(),
    scale: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
    rotation: Quaternion.Identity(),
    parent: BOARD
  })
  Car.create(car, {
    position: { x: -1, y: -1 },
    direction: CarDirection.right,
    length: 2,
    inGame: true,
    isMain: false
  })
  syncEntity(car, [Car.componentId], id)
  return car
}

export function createMainCar(id: number) {
  if (MAIN_CAR) {
    throw new Error('Main car already exists')
  }
  const car = engine.addEntity()
  Transform.create(car, {
    position: Vector3.Zero(),
    scale: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
    rotation: Quaternion.Identity(),
    parent: BOARD
  })
  Car.create(car, {
    position: { x: -1, y: -1 },
    direction: CarDirection.right,
    length: 2,
    inGame: true,
    isMain: true
  })
  syncEntity(car, [Car.componentId], id)
  MAIN_CAR = car
}

export function getInGameCars(): Entity[] {
  const ret = []
  for (let [car] of engine.getEntitiesWith(Car)) {
    if (Car.get(car).inGame) {
      ret.push(car)
    }
  }
  return ret
}

export function getAllCars(): Entity[] {
  const ret = []
  for (let [car] of engine.getEntitiesWith(Car)) {
    ret.push(car)
  }
  return ret
}

export function getAllCarsExceptMain(): Entity[] {
  const ret = []
  for (let [car] of engine.getEntitiesWith(Car)) {
    if (!Car.get(car).isMain) {
      ret.push(car)
    }
  }
  return ret
}