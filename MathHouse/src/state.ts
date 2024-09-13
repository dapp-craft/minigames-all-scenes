import { engine, Entity, Schemas } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

type GameState = {
    availableEntity: Array<Entity>
    entityInRoket: Array<Entity>
    counterEntity: Array<Entity>
    levelCounter: Entity
    rocketWindow: Entity | undefined
    generatedCartrige: any
}

export let gameState: GameState = {
    availableEntity: [],
    entityInRoket: [],
    counterEntity: [],
    levelCounter: engine.addEntity(),
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

export const progressState = {
    level: 1,
    moves: 0,
    levelStartTime: 0,
    levelFinishTime: 0
}
