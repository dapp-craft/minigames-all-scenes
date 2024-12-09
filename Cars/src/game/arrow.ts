import {
  EasingFunction,
  engine,
  Entity,
  GltfContainer,
  Transform,
  Tween,
  TweenSequence,
  TweenLoop,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { BOARD } from './objects/board'
// import { arrowModel } from '../resources/resources'
import { BOARD_PHYSICAL_SIZE, BOARD_SIZE, CELL_SIZE_PHYSICAL } from '../config'
import { getCarAt, inputAvailable, inputBuffer, lookingAt } from '.'
import { cellRelativePosition, directionToQuaterion } from './logic/math'
import { Car } from './components/definitions'

let arrowPosEntity: Entity
let arrowAnimEntity: Entity

const arrowScale = Vector3.scale(Vector3.One(), 1 / BOARD_PHYSICAL_SIZE)

let arrowPosition = Vector3.Zero()

export function initArrow() {
  arrowPosEntity = engine.addEntity()
  Transform.create(arrowPosEntity, {
    position: Vector3.create(0, 0, -2 / BOARD_PHYSICAL_SIZE),
    scale: arrowScale,
    rotation: Quaternion.fromEulerDegrees(-90, 0, 0),
    parent: BOARD
  })

  arrowAnimEntity = engine.addEntity()
  Transform.create(arrowAnimEntity, {
    position: Vector3.create(0, 0.0, 0),
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    parent: arrowPosEntity
  })

  // GltfContainer.create(arrowAnimEntity, arrowModel)
  VisibilityComponent.create(arrowAnimEntity, { visible: true })

  Tween.create(arrowAnimEntity, {
    mode: Tween.Mode.Move({
      start: Vector3.create(0, 0.0, 0),
      end: Vector3.create(0, 0.1, 0)
    }),
    duration: 500,
    easingFunction: EasingFunction.EF_EASECUBIC
  })

  TweenSequence.create(arrowAnimEntity, { sequence: [], loop: TweenLoop.TL_YOYO })

  engine.addSystem(() => {
    if (inputAvailable) {
      if (VisibilityComponent.get(arrowAnimEntity).visible === false) {
        VisibilityComponent.getMutable(arrowAnimEntity).visible = true
      }
    } else {
      if (VisibilityComponent.get(arrowAnimEntity).visible === true) {
        VisibilityComponent.getMutable(arrowAnimEntity).visible = false
      }
    }

    if (inputBuffer.selectedCar && inputAvailable) {
      const arrowPosition = calculateArrowPosition(inputBuffer.selectedCar as Entity)
      const selectedCarOffset = Vector3.create(0, 0, -0.8 / BOARD_PHYSICAL_SIZE)
      updateArrowPosition(Vector3.add(arrowPosition, selectedCarOffset))
      return
    }
    if (lookingAt) {
      if (getCarAt(lookingAt) && inputAvailable) {
        const arrowPosition = calculateArrowPosition(getCarAt(lookingAt) as Entity)
        const unselectedCarOffset = Vector3.create(0, 0, -1 / BOARD_PHYSICAL_SIZE)
        updateArrowPosition(Vector3.add(arrowPosition, unselectedCarOffset))
      } else {
        updateArrowPosition(cellRelativePosition(lookingAt))
      }
    }
  })
}

function updateArrowPosition(pos: Vector3) {
  if (isVectorEqual(pos, arrowPosition)) return
  console.log('Arrow position updated')
  arrowPosition = pos
  const startPos = Transform.get(arrowPosEntity).position
  Tween.createOrReplace(arrowPosEntity, {
    mode: Tween.Mode.Move({
      start: startPos,
      end: pos
    }),
    duration: 200,
    easingFunction: EasingFunction.EF_EASECIRC
  })
}

function isVectorEqual(a: Vector3, b: Vector3) {
  const xd = Math.abs(a.x - b.x)
  const yd = Math.abs(a.y - b.y)
  const zd = Math.abs(a.z - b.z)
  return Math.max(xd, yd, zd) < 0.01
}

function calculateArrowPosition(car: Entity) {
  const carData = Car.get(car)
  const carDirectionRotation = directionToQuaterion(carData.direction)
  const carPosition = cellRelativePosition(carData.position)
  const offset = 0.5 + (carData.length - 2) / 2
  const offsetVector = Vector3.rotate(Vector3.scale(Vector3.Backward(), offset), carDirectionRotation)
  const scaledOffsetVector = Vector3.scale(offsetVector, 1 / BOARD_SIZE)
  return Vector3.add(carPosition, scaledOffsetVector)
}
