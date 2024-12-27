import { engine, Schemas, Transform } from "@dcl/sdk/ecs"
import { Vector3, Quaternion } from "@dcl/sdk/math"

export const toadsGameState = {
  availableEntity: new Array,
  listOfEntity: new Map(),
  toadInitialHeight: 0,
  toadFinishHeight: 0,
  locatorsData: new Map()
}

export const sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, {
  position: Vector3.create(8, 0, 8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0),
  scale: Vector3.One()
})

export const progressState = {
  level: 1,
  moves: 0,
}