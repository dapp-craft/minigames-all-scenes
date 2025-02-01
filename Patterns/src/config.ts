import { Scale } from "@dcl/sdk/ecs";
import { Quaternion, Vector3 } from "@dcl/sdk/math";

export const tempLocators = new Map([
    ['test1', { position: Vector3.create(8, 1, 8), scale: Vector3.One(), rotation: Quaternion.Zero() }],
    ['test2', { position: Vector3.create(6, 1, 8), scale: Vector3.One(), rotation: Quaternion.Zero() }],
    ['test3', { position: Vector3.create(8, 3, 8), scale: Vector3.One(), rotation: Quaternion.Zero() }],
    ['test4', { position: Vector3.create(6, 3, 8), scale: Vector3.One(), rotation: Quaternion.Zero() }],
])

export const SYNC_ENTITY_ID = 3000

export const MAX_LEVEL = 20