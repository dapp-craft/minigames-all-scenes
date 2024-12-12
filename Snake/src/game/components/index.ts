import { engine, Schemas } from '@dcl/sdk/ecs'
import { CellEnum } from '../objects/type'

export const Board = engine.defineComponent("board", {
    board: Schemas.Array(Schemas.Array(Schemas.EnumString<CellEnum>(CellEnum, CellEnum.EMPTY)))
})