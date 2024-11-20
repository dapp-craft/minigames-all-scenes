import { Entity } from "@dcl/sdk/ecs";
import { Vector3 } from "@dcl/sdk/math";

export const steampunkGameState = {
    availableEntity: new Array<Entity>,
    listOfEntity: new Map()
}

export type PlayerReturnData = {
    playerStartTime: number,
    playerFinishTime: number;
    playerLevel: number[];
    playerScore: number;
};

export const progressState: PlayerReturnData = {
    playerStartTime: 0,
    playerFinishTime: 999999999,
    playerLevel: [],
    playerScore: 0,
  }