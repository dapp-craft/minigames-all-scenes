import { SIZE, VARIANT } from "./types"

export const SETTINGS = {
    obj_chest01: {
        variants: [VARIANT.MEDIUM],
        size: SIZE.LARGE
    },
    obj_vase01: {
        variants: [VARIANT.HARD],
        size: SIZE.MEDIUM
    }
} as const

export type MODEL = keyof typeof SETTINGS
export type DIFFICULTY = keyof typeof DIFFICULTIES

export const DIFFICULTIES = Object.entries(SETTINGS).reduce((acc, [model, {variants}]) => {
    variants.forEach(difficulty => acc[difficulty].push(model as MODEL))
    return acc
}, {
    [VARIANT.EASY]: new Array<MODEL>(),
    [VARIANT.MEDIUM]: new Array<MODEL>(),
    [VARIANT.HARD]: new Array<MODEL>()
} as const)
