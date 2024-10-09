import { engine, Schemas } from '@dcl/sdk/ecs'

export const Tile = engine.defineComponent('tile', {
  position: Schemas.Map({
    x: Schemas.Number,
    y: Schemas.Number
  }),
  index: Schemas.Number,
  inGame: Schemas.Boolean,
  image: Schemas.String,
  boardSize: Schemas.Number
})
