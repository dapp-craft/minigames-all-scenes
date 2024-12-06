import {
  ColliderLayer,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  Transform,
  TransformType,
  VisibilityComponent,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/ecs-math'
import { arrowModel } from '../resources/resources'
import { CarDirection, CarType, Cell } from './type'
import { getDirectionVector } from './logic/math'
import {
  createAvailabilityMap,
  isPositionAvailable,
  isPositionAvailableCarData,
  markCarCellsAsAvailable,
  markCarCellsAsAvailableCarData
} from './logic/board'
import { Car } from './components/definitions'
import { Quaternion } from '@dcl/sdk/math'
import { finishLevel, inputAvailable, isSolved, setInputAvailable } from '.'
import { playWinSound } from './sfx'
import { runWinAnimation } from '../../../common/effects'

export let forwardArrow: Entity
export let backwardArrow: Entity

let carComponent: CarType | undefined = undefined
let carEntity: Entity | undefined = undefined

export function initSelector() {
  forwardArrow = createArrow({position: Vector3.create(0, 1, -1), scale: Vector3.create(0.5, 0.5, 0.5), rotation: Quaternion.fromEulerDegrees(0, -90, 0)}, 'Move forward', () => moveCar(1))
  backwardArrow = createArrow({position: Vector3.create(0, 1, ), scale: Vector3.create(0.5, 0.5, 0.5), rotation: Quaternion.fromEulerDegrees(0, 90, 0)}, 'Move backward', () => moveCar(-1))
}

function createArrow(transform: TransformType, hoverText: string, onClick: () => void): Entity {
  const arrow = engine.addEntity()
  Transform.create(arrow, transform)
  GltfContainer.create(arrow, arrowModel);
  // MeshRenderer.setBox(arrow)
  // MeshCollider.setBox(arrow)
  VisibilityComponent.create(arrow, { visible: false })
  pointerEventsSystem.onPointerDown(
    {
      entity: arrow,
      opts: {
        button: InputAction.IA_POINTER,
        hoverText
      }
    },
    onClick
  )
  return arrow
}

function moveCar(directionMultiplier: number) {
  if (!carComponent || !carEntity) return

  const mv = getDirectionVector(carComponent.direction)
  const targetCell: Cell = {
    x: carComponent.position.x + mv.x * directionMultiplier,
    y: carComponent.position.y + mv.y * directionMultiplier
  }
  const availabilityMap = createAvailabilityMap()
  markCarCellsAsAvailable(availabilityMap, carEntity)

  if (isPositionAvailable(targetCell, carEntity, availabilityMap)) {
    carComponent.position = targetCell
  }

  if (isSolved()) {
    setInputAvailable(false)
    playWinSound()
    runWinAnimation().then(finishLevel)
  }
}

export function selectedCar(entity: Entity | undefined) {
  if (!entity) {
    VisibilityComponent.getMutable(forwardArrow).visible = false
    VisibilityComponent.getMutable(backwardArrow).visible = false
    return
  }

  carComponent = Car.getMutable(entity)
  carEntity = entity

  if (!carComponent) {
    VisibilityComponent.getMutable(forwardArrow).visible = false
    VisibilityComponent.getMutable(backwardArrow).visible = false
  } else {
    VisibilityComponent.getMutable(forwardArrow).visible = true
    VisibilityComponent.getMutable(backwardArrow).visible = true
    Transform.getMutable(forwardArrow).parent = entity
    Transform.getMutable(backwardArrow).parent = entity
    Transform.getMutable(forwardArrow).position.z = (carComponent.length - 1) * -1
  }
}