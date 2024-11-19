import { Entity } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

export const steampunkGameState = {
    availableEntity: new Array<Entity>,
    listOfEntity: new Map()
}

// temp
export const data = new Map([
    ['counter_hits', { position: Vector3.create(4, 3, 3), scale: Vector3.create(.3, .3, .2) }],
    ['counter_misses', { position: Vector3.create(5, 3, 3), scale: Vector3.create(.3, .3, .2) }],
    ['counter_score', { position: Vector3.create(6, 3, 3), scale: Vector3.create(.3, .3, .2) }],
])