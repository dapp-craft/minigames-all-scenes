import { EasingFunction, Entity, GltfContainer, Transform, Tween, engine } from '@dcl/sdk/ecs'
import { CarDirection, CarType, Cell } from './type'
import { Car } from './components/definitions'
import { cellRelativePosition, directionToQuaterion } from './logic/math'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { carModels, mainCarModel } from '../resources/resources'
import * as utils from '@dcl-sdk/utils'
import { CELL_SIZE_RELATIVE } from '../config'

const CarsLatest: Record<Entity, CarType> = {}

export function setUpSynchronizer() {
  engine.addSystem(() => {
    for (const [carEntirt] of engine.getEntitiesWith(Car)) {
      const carDataHash = hash(Car.get(carEntirt))
      if (hash(CarsLatest[carEntirt]) !== carDataHash) {
        if (CarsLatest[carEntirt]) updateCar(carEntirt)
        CarsLatest[carEntirt] = Car.get(carEntirt)
      }
    }
  })
}

function updateCar(car: Entity) {
  const newCarData = Car.get(car)
  const oldCarData = CarsLatest[car] as CarType

  // Rotation
  if (!isQuaternionEqual(Transform.get(car).rotation, directionToQuaterion(oldCarData.direction))) {
    Transform.getMutable(car).rotation = directionToQuaterion(newCarData.direction)
  }

  const startPosition = cellRelativePosition(oldCarData.position)
  const endPosition = cellRelativePosition(newCarData.position)

  if (oldCarData.inGame == false && newCarData.inGame == true) {
    // Make the car appear
    Transform.getMutable(car).position = endPosition
    Tween.createOrReplace(car, {
      mode: Tween.Mode.Scale({
        start: Vector3.Zero(),
        end: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE)
      }),
      duration: 1000,
      easingFunction: EasingFunction.EF_EASEOUTCUBIC
    })
  } else if (oldCarData.inGame == true && newCarData.inGame == false) {
    // Make disappear
    Tween.createOrReplace(car, {
      mode: Tween.Mode.Scale({
        start: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
        end: Vector3.Zero()
      }),
      duration: 1000,
      easingFunction: EasingFunction.EF_EASEOUTCUBIC
    })
  } else if (oldCarData.inGame == true && newCarData.inGame == true) {
    if (!Vector3.equals(startPosition, endPosition)) {
      // Move
      Tween.createOrReplace(car, {
        mode: Tween.Mode.Move({
          start: startPosition,
          end: endPosition
        }),
        duration: 500,
        easingFunction: Tween.has(car) ? EasingFunction.EF_EASEOUTCUBIC : EasingFunction.EF_EASECUBIC
      })
    }
  }

  //Model
  if (newCarData.isMain && GltfContainer.getOrNull(car)?.src != mainCarModel.src) {
    GltfContainer.createOrReplace(car, mainCarModel)
  } else if (
    GltfContainer.getOrNull(car)?.src !== carModels[newCarData.length as keyof typeof carModels].src &&
    !newCarData.isMain
  ) {
    GltfContainer.createOrReplace(car, carModels[newCarData.length as keyof typeof carModels])
  }
}

function hash(data: any) {
  return JSON.stringify(data)
}

function isQuaternionEqual(q1: Quaternion, q2: Quaternion) {
  const dw = Math.abs(q1.w - q2.w)
  const dx = Math.abs(q1.x - q2.x)
  const dy = Math.abs(q1.y - q2.y)
  const dz = Math.abs(q1.z - q2.z)

  return Math.max(dw, dx, dy, dz) < 0.001
}
