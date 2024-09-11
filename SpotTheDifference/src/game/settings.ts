import { SIZE, VARIANT } from "./types"

export const SETTINGS = {
    obj_bush01:    {size: SIZE.LARGE, variants: [VARIANT.EASY]},
    obj_bush02:    {size: SIZE.LARGE, variants: [VARIANT.EASY]},
    obj_stone01:   {size: SIZE.LARGE, variants: [VARIANT.HARD]},
    obj_stone02:   {size: SIZE.LARGE, variants: [VARIANT.EASY]},
    obj_stone03:   {size: SIZE.LARGE, variants: [VARIANT.MEDIUM]},
    obj_chest01:   {size: SIZE.LARGE, variants: [VARIANT.MEDIUM]},
    obj_well01:    {size: SIZE.LARGE, variants: [VARIANT.MEDIUM]},
    obj_chest03:   {size: SIZE.LARGE, variants: [VARIANT.MEDIUM]},
    obj_bench01:   {size: SIZE.LARGE, variants: [VARIANT.MEDIUM]},
    obj_bench02:   {size: SIZE.LARGE, variants: [VARIANT.EASY]},
    
    obj_vase01:    {size: SIZE.MEDIUM, variants: [VARIANT.HARD]},
    obj_bucket01:  {size: SIZE.MEDIUM, variants: [VARIANT.EASY]},
    obj_hydrant01: {size: SIZE.MEDIUM, variants: [VARIANT.EASY]},
    obj_lever01:   {size: SIZE.MEDIUM, variants: [VARIANT.HARD]},
    obj_lever02:   {size: SIZE.MEDIUM, variants: [VARIANT.HARD]},
    obj_lamp02:    {size: SIZE.MEDIUM, variants: [VARIANT.HARD]},

    obj_num00:     {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_num01:     {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_num02:     {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_num03:     {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_num04:     {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_num05:     {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_num06:     {size: SIZE.SMALL, variants: [VARIANT.MEDIUM]},
    obj_num07:     {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_num08:     {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_num09:     {size: SIZE.SMALL, variants: [VARIANT.MEDIUM]},
    obj_key01:     {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_key02:     {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_key03:     {size: SIZE.SMALL, variants: [VARIANT.MEDIUM]},
    obj_gear01:    {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_gear02:    {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_gear03:    {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_gear04:    {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_gear05:    {size: SIZE.SMALL, variants: [VARIANT.EASY]},
    obj_gear06:    {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_gear07:    {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_gear08:    {size: SIZE.SMALL, variants: [VARIANT.HARD]},
    obj_gear09:    {size: SIZE.SMALL, variants: [VARIANT.MEDIUM]},
    obj_gun01:     {size: SIZE.SMALL, variants: [VARIANT.MEDIUM]},
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
