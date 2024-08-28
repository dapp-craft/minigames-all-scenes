import { Entity } from "@dcl/sdk/ecs";

type GameState = {
    availableEntity: Array<Entity>
    rocketWindow: Entity | undefined
}

export let gameState: GameState = {
    availableEntity: [],
    rocketWindow: undefined
}