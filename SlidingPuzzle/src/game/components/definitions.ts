import { engine, Schemas } from "@dcl/sdk/ecs";

export const Tile = engine.defineComponent('tile', {
    number: Schemas.Int,
    // size: Schemas.Float
})


export const GameData = engine.defineComponent('game-data', {
    playerAddress: Schemas.String,
    playerName: Schemas.String,
    moves: Schemas.Number,
    levelStartedAt: Schemas.Int64,
    levelFinishedAt: Schemas.Int64,
  })


export const Disc = engine.defineComponent('disc', {
    size: Schemas.Int,
    matrix: Schemas.Array(Schemas.Array(Schemas.Int)),
    image: Schemas.String,
    lvl: Schemas.Number,
})