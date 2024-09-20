import { engine, Schemas } from "@dcl/sdk/ecs";
import { CarDirection } from "../type";

export const GameData = engine.defineComponent('game-data', {
    playerAddress: Schemas.String,
    playerName: Schemas.String,
    moves: Schemas.Number,
    levelStartedAt: Schemas.Int64,
    levelFinishedAt: Schemas.Int64,
    level: Schemas.Int,
  })


export const Car = engine.defineComponent('car', {
    position: Schemas.Map({
        x: Schemas.Number,
        y: Schemas.Number,
    }),
    direction: Schemas.EnumNumber<CarDirection>(CarDirection, CarDirection.up),
    length: Schemas.Number,
    inGame: Schemas.Boolean,
    isMain: Schemas.Boolean,
})
