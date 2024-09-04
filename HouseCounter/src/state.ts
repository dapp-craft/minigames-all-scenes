import { engine, Entity, Schemas } from "@dcl/sdk/ecs";
import { board } from "./board";
import { Vector3 } from "@dcl/sdk/math";

type GameState = {
    availableEntity: Array<Entity>
    entityInRoket: Array<Entity>
    rocketWindow: Entity | undefined
    generatedCartrige: any
}

export let gameState: GameState = {
    availableEntity: [],
    entityInRoket: [],
    rocketWindow: undefined,
    generatedCartrige: new Map()
}

export const GameData = engine.defineComponent('game-data', {
    playerAddress: Schemas.String,
    playerName: Schemas.String,
    moves: Schemas.Number,
    levelStartedAt: Schemas.Int64,
    levelFinishedAt: Schemas.Int64,
    level: Schemas.Int,
  })

export const rocketCoords = Vector3.create(8, -3, 4.8)
