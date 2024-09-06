import { Schemas, engine } from '@dcl/sdk/ecs'

export const GameData = engine.defineComponent('gameData', {
  playerAddress: Schemas.String,
  playerName: Schemas.String,
  levelStartTime: Schemas.Int64,
  levelEndTime: Schemas.Int64,
})

export const Tile = engine.defineComponent('tile', {
  isFlipped: Schemas.Boolean,
  toyModel: Schemas.String,
  matched: Schemas.Boolean,
  tileNumber: Schemas.Int64,
  inGame: Schemas.Boolean,
})
