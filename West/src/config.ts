import { Vector3 } from "@dcl/sdk/math";

export const westGameConfig = {
    initialEntityAmount: 30,
    targetEntityAmount: 9,
    horizontalLeftLimit: 0,
    horizontalRightLimit: 8,
    playerMaxHP: 100
}

export const tempLocators = new Map([
    ["obj_locator_1", { position: Vector3.create(4, 1, 2) }],
    ["obj_locator_2", { position: Vector3.create(6, 1, 2) }],
    ["obj_locator_3", { position: Vector3.create(8, 1, 2) }],
    ["obj_locator_4", { position: Vector3.create(10, 1, 2) }],
    ["obj_locator_5", { position: Vector3.create(12, 1, 2) }],
    ["obj_locator_6", { position: Vector3.create(4, 3, 2) }],
    ["obj_locator_7", { position: Vector3.create(6, 3, 2) }],
    ["obj_locator_8", { position: Vector3.create(8, 3, 2) }],
    ["obj_locator_9", { position: Vector3.create(10, 3, 2) }],
    ["obj_locator_10", { position: Vector3.create(12, 3, 2) }],
])