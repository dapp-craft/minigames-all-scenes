import { engine, Schemas } from "@dcl/sdk/ecs";

export const Tile = engine.defineComponent('tile', {
    number: Schemas.Int,
})