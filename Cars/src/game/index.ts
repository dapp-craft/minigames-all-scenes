import {
  ColliderLayer,
  engine,
  Entity,
  executeTask,
  GltfContainer,
  InputAction,
  inputSystem,
  Material,
  MeshCollider,
  MeshRenderer,
  PointerEventType,
  PointerLock,
  raycastSystem,
  Texture,
  Transform,
  TransformType
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { Quaternion, Vector3 } from '@dcl/ecs-math'
import { CarDirection, Cell } from './type'
import { globalCoordsToLocal, localCoordsToCell, getDirectionVector } from './math'
import { CELL_SIZE_PHYSICAL, CELL_SIZE_RELATIVE } from '../config'
import { Car } from './components/definitions'
import { setUpSynchronizer } from './synchronizer'
import { createBoard } from './objects/board'
import { createCar } from './objects/car'

let lookingAt: Cell | undefined = undefined

const selectedCar: {
  car: Entity | undefined,
  startCell: Cell | undefined
  currentCell: Cell | undefined
} = {
  car: undefined,
  startCell: undefined,
  currentCell: undefined
}


export async function initGame() {
  createBoard()

  createCar({ x: 4, y: 4 }, 2000)
  createCar({ x: 1, y: 1 }, 1001)
  createCar({ x: 3, y: 3 }, 1002)

  setUpRaycast()

  setUpInputSystem()

  setUpSynchronizer()
}

function setUpRaycast() {
  raycastSystem.registerLocalDirectionRaycast(
    {
      entity: engine.CameraEntity,
      opts: {
        direction: Vector3.Forward(),
        continuous: true,
        collisionMask: ColliderLayer.CL_CUSTOM1
      }
    },
    (hit) => {

      // Update lookingAt
      if (hit.hits.length === 0) {
        lookingAt = undefined
        return
      }
      const hitPosition = hit.hits[0].position
      if (hitPosition == undefined) {
        lookingAt = undefined
        return
      }
      const relativePosition = globalCoordsToLocal(hitPosition as Vector3)
      lookingAt = localCoordsToCell(relativePosition)

      // Update selectedCar
      if (selectedCar.car == undefined) return
      if (lookingAt.x == selectedCar.currentCell?.x && lookingAt.y == selectedCar.currentCell?.y) return
      selectedCar.currentCell = lookingAt
      let {x: xd, y: yd} = movementDelta(selectedCar.startCell as Cell, selectedCar.currentCell as Cell)
      if (Car.get(selectedCar.car).direction === CarDirection.up || Car.get(selectedCar.car).direction === CarDirection.down){
        xd = 0
      } else {
        yd = 0
      }
      Car.getMutable(selectedCar.car).position.x += xd
      Car.getMutable(selectedCar.car).position.y += yd
      selectedCar.startCell = selectedCar.currentCell
    }
  )
}

function getCarAt(cell: Cell) {
  for (const [entity, name] of engine.getEntitiesWith(Car)){
    const car = Car.get(entity)
    if (!car.inGame) continue
      const length = car.length
      const direction = getDirectionVector(car.direction)
      const yD = direction.y
      const xD = direction.x
      for (let i = 0; i < length; i++){
        if (car.position.x + xD * i === cell.x && car.position.y + yD * i === cell.y)
        return entity
      }
  }
  return undefined
}

function setUpInputSystem(){
  engine.addSystem(function(){
    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_DOWN) && PointerLock.get(engine.CameraEntity).isPointerLocked){
      if (lookingAt){
        const car = getCarAt(lookingAt)
        if (car == undefined) return
        console.log(car)
        selectedCar.car = car
        selectedCar.startCell = lookingAt 
      }
    }

    if (inputSystem.isTriggered(InputAction.IA_POINTER, PointerEventType.PET_UP) && PointerLock.get(engine.CameraEntity).isPointerLocked){
      selectedCar.car = undefined
      selectedCar.startCell = undefined
      selectedCar.currentCell = undefined
    }
  })
}


function movementDelta(start: Cell, end: Cell) {
  // TODO: movement only in direvtion of the car
  return {
    x: end.x - start.x,
    y: end.y - start.y
  }
}

function getAvalabilityMapForCar(carEntity: Entity) {
  const car = Car.get(carEntity)
  const map: boolean[][] = []
  for (let i = 0; i < CELL_SIZE_PHYSICAL; i++){
    map.push([])
    for (let j = 0; j < CELL_SIZE_PHYSICAL; j++){
      map[i].push(true)
    }
  }
  const direction = getDirectionVector(car.direction)
  for ( const [entity, name] of engine.getEntitiesWith(Car)){
    const car = Car.get(entity)
    if (!car.inGame) continue
    const length = car.length
    const direction = getDirectionVector(car.direction)
    const yD = direction.y
    const xD = direction.x
    for (let i = 0; i < length; i++){
      map[car.position.x + xD * i][car.position.y + yD * i] = false
    }
  }
  for (let i = 0; i < car.length; i++){
    const x = car.position.x + direction.x * i
    const y = car.position.y + direction.y * i
    map[x][y] = false
  }
  return map
}