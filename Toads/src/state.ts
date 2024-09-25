import { engine, Schemas, Transform } from "@dcl/sdk/ecs"
import { Vector3, Quaternion } from "@dcl/sdk/math"

export const toadsGameState = {
  availableEntity: new Array,
  listOfEntity: new Map(),
  toadInitialHeight: 0
}

export const sceneParentEntity = engine.addEntity()
Transform.create(sceneParentEntity, {
  position: Vector3.create(8, 0, 8),
  rotation: Quaternion.fromEulerDegrees(0, 0, 0),
  scale: Vector3.One()
})

export const GameData = engine.defineComponent('game-data', {
  playerAddress: Schemas.String,
  playerName: Schemas.String,
  moves: Schemas.Number,
  levelStartedAt: Schemas.Int64,
  levelFinishedAt: Schemas.Int64,
  level: Schemas.Int,
})