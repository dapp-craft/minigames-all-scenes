import { EasingFunction, Entity, GltfContainer, Transform, Tween, engine } from '@dcl/sdk/ecs'
import { CarDirection, Cell } from './type'
import { Car } from './components/definitions'
import { cellRelativePosition } from './math'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { carModels } from '../resources/resources'

const CarsLatest: Record<Entity, String> = {}

export function setUpSynchronizer() {
  engine.addSystem(() => {
    for (const [carEntirt] of engine.getEntitiesWith(Car)){
        const carDataHash = hash(Car.get(carEntirt))
        if (CarsLatest[carEntirt] !== carDataHash) {
            updateCar(carEntirt)
            CarsLatest[carEntirt] = carDataHash
        }
    }
  })
}

function updateCar(car: Entity) {
    const carData = Car.get(car)

    const startPosition = Transform.get(car).position
    const endPosition = cellRelativePosition(carData.position)

    // Position
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

    // Rotation
    Transform.getMutable(car).rotation = rotationToQuaterion(carData.direction)

    //Model
    if (GltfContainer.getOrNull(car)?.src !== carModels[carData.length as keyof typeof carModels].src) {
        GltfContainer.createOrReplace(car, carModels[carData.length as keyof typeof carModels])
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