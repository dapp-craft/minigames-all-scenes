import { Entity } from "@dcl/sdk/ecs";

type GameState = {
    availableEntity: Array<Entity>
}

export let gameState: GameState = {
    availableEntity: []
}