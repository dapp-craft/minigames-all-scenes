import { Schemas } from "@dcl/sdk/ecs"

export const BoardDescriptorSchema = {
    size: Schemas.Map({
        width: Schemas.Number,
        height: Schemas.Number,
    }),
    cells: Schemas.Array(Schemas.Array(Schemas.String)),
    entities: Schemas.Array(Schemas.Map({
        id: Schemas.Number,
        position: Schemas.Map({
            x: Schemas.Number,
            y: Schemas.Number,
        }),
        type: Schemas.String,
    })),
}
