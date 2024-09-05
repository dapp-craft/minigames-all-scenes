import { LvlType } from "./Types"

export const randomLvl: LvlType = {
    wave: new Map(),
    spawnEntityDelay: { time: 3000, random: true },
    initialEntityAmount: 1
}

export const lvl0: LvlType = {
    wave: new Map([
        [1, { itemQueue: 4, goOut: false }],
        [2, { itemQueue: 3, goOut: true }],
        [3, { itemQueue: 1, goOut: false }],
        [4, { itemQueue: 3, goOut: false }]
    ]),
    spawnEntityDelay: { time: 3000, random: true },
    initialEntityAmount: 1
}

export const lvl1 = {
    waves: new Map([
        [1, { itemQueue: 5, goOut: false }],
        [2, { itemQueue: 2, goOut: true }],
        [3, { itemQueue: 3, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 6
}

export const lvl2 = {
    waves: new Map([
        [1, { itemQueue: 2, goOut: false }],
        [2, { itemQueue: 4, goOut: false }],
        [3, { itemQueue: 3, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 6
}