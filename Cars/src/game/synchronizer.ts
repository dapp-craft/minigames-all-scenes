import { EasingFunction, Entity, GltfContainer, Transform, Tween, engine } from '@dcl/sdk/ecs'
import { CarDirection, CarType, Cell } from './type'
import { Car } from './components/definitions'
import { cellRelativePosition } from './logic/math'
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
  Transform.getMutable(car).rotation = rotationToQuaterion(newCarData.direction)


  const startPosition = cellRelativePosition(oldCarData.position)
  const endPosition = cellRelativePosition(newCarData.position)

  if (oldCarData.inGame == false && newCarData.inGame == true) {
    // Make the car appear
    Transform.getMutable(car).position = endPosition
    Tween.createOrReplace(car, {
      mode: Tween.Mode.Scale({
        start: Vector3.Zero(),
        end: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
      }),
      duration: 500,
      easingFunction: EasingFunction.EF_EASEOUTCUBIC
    })
  } else if (oldCarData.inGame == true && newCarData.inGame == false) {
    // Make disappear
    Tween.createOrReplace(car, {
      mode: Tween.Mode.Scale({
        start: Vector3.scale(Vector3.One(), CELL_SIZE_RELATIVE),
        end: Vector3.Zero()
      }),
      duration: 500,
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
  } else if (GltfContainer.getOrNull(car)?.src !== carModels[newCarData.length as keyof typeof carModels].src && !newCarData.isMain) {
    GltfContainer.createOrReplace(car, carModels[newCarData.length as keyof typeof carModels])
  }
}

function hash(data: any) {
  return JSON.stringify(data)
}

function rotationToQuaterion(rotation: CarDirection): Quaternion {
  switch (rotation) {
    case CarDirection.up:
      return Quaternion.fromEulerDegrees(-90, 0, 0)
    case CarDirection.down:
      return Quaternion.fromEulerDegrees(90, 180, 0)
    case CarDirection.left:
      return Quaternion.fromEulerDegrees(180, 90, -90)
    case CarDirection.right:
      return Quaternion.fromEulerDegrees(0, 90, -90)
  }
}
