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
import { arrowActiveModel, arrowInactiveModel } from '../resources/resources'
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
import { finishLevel, gameState, inputAvailable, isSolved, setInputAvailable } from '.'
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
  GltfContainer.create(arrow, arrowActiveModel);
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
    gameState.moves++
    updateArrowModels()
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

  updateArrowModels()
}


function updateArrowModels(){
  if (!carComponent || !carEntity) return
  console.log("updateArrowModels")
  
  const mv = getDirectionVector(carComponent.direction)
  const targetCellForward: Cell = {
    x: carComponent.position.x + mv.x * 1,
    y: carComponent.position.y + mv.y * 1
  }
  const availabilityMap = createAvailabilityMap()
  markCarCellsAsAvailable(availabilityMap, carEntity)

  console.log("Forward position available", isPositionAvailable(targetCellForward, carEntity, availabilityMap))
  if (isPositionAvailable(targetCellForward, carEntity, availabilityMap)) {
    GltfContainer.createOrReplace(forwardArrow, arrowActiveModel)
  } else {
    GltfContainer.createOrReplace(forwardArrow, arrowInactiveModel)
  }

  const targetCellBackward: Cell = {
    x: carComponent.position.x + mv.x * -1,
    y: carComponent.position.y + mv.y * -1
  }
  
  console.log("Backward position available", isPositionAvailable(targetCellBackward, carEntity, availabilityMap))
  if (isPositionAvailable(targetCellBackward, carEntity, availabilityMap)) {
    GltfContainer.createOrReplace(backwardArrow, arrowActiveModel)
  } else {
    GltfContainer.createOrReplace(backwardArrow, arrowInactiveModel)
  }

  console.log("Corrent models")
  console.log(GltfContainer.get(forwardArrow).src)
  console.log(GltfContainer.get(backwardArrow).src)
    
}