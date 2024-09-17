import { EasingFunction, Entity, Transform, Tween, engine } from '@dcl/sdk/ecs'
import { CarDirection, Cell } from './type'
import { Car } from './components/definitions'
import { cellRelativePosition } from './math'

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

    Tween.createOrReplace(car, {
        mode: Tween.Mode.Move({
            start: startPosition,
            end: endPosition,
        }),
        duration: 500,
        easingFunction: EasingFunction.EF_EASECUBIC,
    })
}

function hash(data: any) {
    return JSON.stringify(data)
}