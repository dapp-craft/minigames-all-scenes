import {
  ColliderLayer,
  Entity,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  Transform,
  TransformType,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/ecs-math'
import { BOARD_PHYSICAL_SIZE, CELL_SIZE_RELATIVE } from '../../config'
import { Quaternion } from '@dcl/sdk/math'
import { BOARD } from './board'
import { Car } from '../components/definitions'
import { CarDirection, Cell } from '../type'
import { syncEntity } from '@dcl/sdk/network'
import { selectedCar } from '../selector'

export let MAIN_CAR: Entity

export function createCarEntity(id: number, isMain: boolean){
  const car = engine.addEntity()
  Transform.create(car, {
    position: Vector3.Zero(),
    scale: Vector3.Zero(),
    rotation: Quaternion.Identity(),
    parent: BOARD
  })
  Car.create(car, {
    position: { x: -1, y: -1 },
    direction: CarDirection.right,
    length: 2,
    inGame: false,
    isMain: isMain
  })
  syncEntity(car, [Car.componentId], id)
  pointerEventsSystem.onPointerDown(
    {
      entity: car,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText: 'Select car',
      }
    },
    () => {
      console.log('Car clicked')
      selectedCar(car)
    }
  )

  return car
}

export function createCar(id: number) {
  return createCarEntity(id, false);  
}

export function createMainCar(id: number) {
  if (MAIN_CAR) {
    throw new Error('Main car already exists')
  }
  MAIN_CAR = createCarEntity(id, true)
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
