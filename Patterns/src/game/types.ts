import { Entity } from "@dcl/sdk/ecs"

export const gameState: {
    playerAddress: string
    playerName: string
    levelStartTime: number
    levelFinishTime: number
    level: number
    moves: number
} = {
    playerAddress: '',
    playerName: '',
    levelStartTime: 0,
    levelFinishTime: 0,
    level: 0,
    moves: 0
}

export const inputBuffer: {
    selectedDot: Entity | undefined
    lastDot: Entity | undefined
    dotsConnection: Entity[]
} = {
    selectedDot: undefined,
    lastDot: undefined,
    dotsConnection: [],
}

export type DotType = {
    isActive: Boolean,
    isLocked: Boolean,
}