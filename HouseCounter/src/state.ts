import { Entity } from "@dcl/sdk/ecs";

type GameState = {
    availableEntity: Array<Entity>
    rocketWindow: Entity | undefined
    generatedCartrige: any
}

export let gameState: GameState = {
    availableEntity: [],
    rocketWindow: undefined,
    generatedCartrige: new Map()
}