import { Entity } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

export const westGameState = {
    availableEntity: new Array<Entity>,
    listOfEntity: new Map(),
    curtainsScale: Vector3.One()
}

export const progressState = {
    level: 1,
    score: 0,
    time: 0
  }