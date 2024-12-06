import { Vector3 } from "@dcl/sdk/math";

export const westGameConfig = {
    initialEntityAmount: 30,
    targetEntityAmount: 9,
    horizontalLeftLimit: 0,
    horizontalRightLimit: 8
}

export const tempLocators = new Map([
    ["obj_locator_1", { position: Vector3.create(1, 1, 2) }],
    ["obj_locator_2", { position: Vector3.create(3, 1, 2) }],
    ["obj_locator_3", { position: Vector3.create(5, 1, 2) }],
    ["obj_locator_4", { position: Vector3.create(7, 1, 2) }],
    ["obj_locator_5", { position: Vector3.create(9, 1, 2) }],
    ["obj_locator_6", { position: Vector3.create(11, 1, 2) }],
    ["obj_locator_7", { position: Vector3.create(3, 1, 2) }],
    ["obj_locator_8", { position: Vector3.create(1, 1, 2) }],
    ["obj_locator_9", { position: Vector3.create(1, 1, 2) }],
])