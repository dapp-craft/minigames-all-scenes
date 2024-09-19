import { EasingFunction, Entity, Transform, Tween, engine } from '@dcl/sdk/ecs'
import { CarDirection, Cell } from './type'
import { Car } from './components/definitions'
import { cellRelativePosition } from './math'
import { Quaternion, Vector3 } from '@dcl/sdk/math'

const CarsLatest: Record<Entity, String> = {}

export function setUpSynchronizer() {
  engine.addSystem(() => {
    for (const [carEntirt] of engine.getEntitiesWith(Car)){
        const carDataHash = hash(Car.get(carEntirt))
        if (CarsLatest[carEntirt] !== carDataHash) {
            CarsLatest[carEntirt] = carDataHash
            updateCar(carEntirt)
        }
    }
  })
}

function updateCar(car: Entity) {
    const carData = Car.get(car)

    const startPosition = Transform.get(car).position
    const endPosition = cellRelativePosition(carData.position)
    if (!Vector3.equals(startPosition, endPosition)) {
    Tween.createOrReplace(car, {
        mode: Tween.Mode.Move({
            start: startPosition,
            end: endPosition,
        }),
        duration: 500,
        easingFunction: Tween.has(car) ? EasingFunction.EF_EASEOUTCUBIC : EasingFunction.EF_EASECUBIC,
    })
    }
    Transform.getMutable(car).rotation = rotationToQuaterion(carData.direction)
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