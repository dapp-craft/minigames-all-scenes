import { Entity } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

export const steampunkGameState = {
    availableEntity: new Array<Entity>,
    listOfEntity: new Map()
}

// temp
export const data = new Map([
    ['plane1', {position: Vector3.create(3, 2, 3), scale: Vector3.create(.3, .3, .3)}],
    ['plane2', {position: Vector3.create(4, 2, 3), scale: Vector3.create(.3, .8, .3)}],
    ['plane3', {position: Vector3.create(2, 2, 3), scale: Vector3.create(.3, .3, .3)}],
    ['plane4', {position: Vector3.create(3, 3, 3), scale: Vector3.create(.3, .3, .2)}],
])

export const correctEntity = [
    "plane1",
    "plane2"
]