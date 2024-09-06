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
    wave: new Map([
        [1, { itemQueue: 3, goOut: false }],
        [2, { itemQueue: 2, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 0
}

export const lvl2 = {
    wave: new Map([
        [1, { itemQueue: 4, goOut: false }],
        [2, { itemQueue: 3, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 2
}

export const lvl3 = {
    wave: new Map([
        [1, { itemQueue: 3, goOut: true }],
        [2, { itemQueue: 2, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 9
}

export const lvl4 = {
    wave: new Map([
        [1, { itemQueue: 4, goOut: true }],
        [2, { itemQueue: 3, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 9
}

export const levelArray = [lvl1, lvl2, lvl3, lvl4]