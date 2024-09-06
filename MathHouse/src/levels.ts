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

export const lvl5 = {
    wave: new Map([
        [1, { itemQueue: 2, goOut: true }],
        [2, { itemQueue: 4, goOut: false }],
        [3, { itemQueue: 1, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 3
}

export const lvl6 = {
    wave: new Map([
        [1, { itemQueue: 6, goOut: true }],
        [2, { itemQueue: 8, goOut: false }],
        [3, { itemQueue: 5, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 9
}

export const lvl7 = {
    wave: new Map([
        [1, { itemQueue: 3, goOut: false }],
        [2, { itemQueue: 1, goOut: true }],
        [3, { itemQueue: 4, goOut: false }],
        [4, { itemQueue: 2, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 2
}

export const lvl8 = {
    wave: new Map([
        [1, { itemQueue: 5, goOut: true }],
        [2, { itemQueue: 7, goOut: false }],
        [3, { itemQueue: 6, goOut: true }],
        [4, { itemQueue: 9, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 8
}

export const lvl9 = {
    wave: new Map([
        [1, { itemQueue: 2, goOut: true }],
        [2, { itemQueue: 4, goOut: false }],
        [3, { itemQueue: 1, goOut: true }],
        [4, { itemQueue: 3, goOut: false }],
        [5, { itemQueue: 2, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 3
}

export const lvl10 = {
    wave: new Map([
        [1, { itemQueue: 6, goOut: true }],
        [2, { itemQueue: 8, goOut: false }],
        [3, { itemQueue: 5, goOut: true }],
        [4, { itemQueue: 7, goOut: false }],
        [5, { itemQueue: 8, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 9
}

export const lvl11 = {
    wave: new Map([
        [1, { itemQueue: 3, goOut: false }],
        [2, { itemQueue: 1, goOut: true }],
        [3, { itemQueue: 4, goOut: false }],
        [4, { itemQueue: 2, goOut: true }],
        [5, { itemQueue: 3, goOut: false }],
        [6, { itemQueue: 1, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 2
}

export const lvl12 = {
    wave: new Map([
        [1, { itemQueue: 5, goOut: true }],
        [2, { itemQueue: 7, goOut: false }],
        [3, { itemQueue: 6, goOut: true }],
        [4, { itemQueue: 9, goOut: false }],
        [5, { itemQueue: 8, goOut: true }],
        [6, { itemQueue: 6, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 8
}

export const lvl13 = {
    wave: new Map([
        [1, { itemQueue: 2, goOut: true }],
        [2, { itemQueue: 4, goOut: false }],
        [3, { itemQueue: 1, goOut: true }],
        [4, { itemQueue: 3, goOut: false }],
        [5, { itemQueue: 2, goOut: true }],
        [6, { itemQueue: 4, goOut: false }],
        [7, { itemQueue: 1, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 3
}

export const lvl14 = {
    wave: new Map([
        [1, { itemQueue: 6, goOut: true }],
        [2, { itemQueue: 8, goOut: false }],
        [3, { itemQueue: 5, goOut: true }],
        [4, { itemQueue: 7, goOut: false }],
        [5, { itemQueue: 8, goOut: true }],
        [6, { itemQueue: 6, goOut: false }],
        [7, { itemQueue: 5, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 9
}

export const lvl15 = {
    wave: new Map([
        [1, { itemQueue: 3, goOut: false }],
        [2, { itemQueue: 1, goOut: true }],
        [3, { itemQueue: 4, goOut: false }],
        [4, { itemQueue: 2, goOut: true }],
        [5, { itemQueue: 3, goOut: false }],
        [6, { itemQueue: 1, goOut: true }],
        [7, { itemQueue: 4, goOut: false }],
        [8, { itemQueue: 2, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 2
}

export const lvl16 = {
    wave: new Map([
        [1, { itemQueue: 5, goOut: true }],
        [2, { itemQueue: 7, goOut: false }],
        [3, { itemQueue: 6, goOut: true }],
        [4, { itemQueue: 9, goOut: false }],
        [5, { itemQueue: 8, goOut: true }],
        [6, { itemQueue: 6, goOut: false }],
        [7, { itemQueue: 5, goOut: true }],
        [8, { itemQueue: 7, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 8
}

export const lvl17 = {
    wave: new Map([
        [1, { itemQueue: 2, goOut: true }],
        [2, { itemQueue: 4, goOut: false }],
        [3, { itemQueue: 1, goOut: true }],
        [4, { itemQueue: 3, goOut: false }],
        [5, { itemQueue: 2, goOut: true }],
        [6, { itemQueue: 4, goOut: false }],
        [7, { itemQueue: 1, goOut: true }],
        [8, { itemQueue: 3, goOut: false }],
        [9, { itemQueue: 2, goOut: true }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 3
}

export const lvl18 = {
    wave: new Map([
        [1, { itemQueue: 6, goOut: true }],
        [2, { itemQueue: 8, goOut: false }],
        [3, { itemQueue: 5, goOut: true }],
        [4, { itemQueue: 7, goOut: false }],
        [5, { itemQueue: 8, goOut: true }],
        [6, { itemQueue: 6, goOut: false }],
        [7, { itemQueue: 5, goOut: true }],
        [8, { itemQueue: 9, goOut: false }],
        [9, { itemQueue: 7, goOut: false }],
    ]),
    spawnEntityDelay: { time: 5000, random: true },
    initialEntityAmount: 9
}

export const levelArray = [lvl1, lvl2, lvl3, lvl4, lvl5, lvl6, lvl7, lvl8, lvl9, lvl10, lvl11, lvl12, lvl13, lvl14, lvl15, lvl16, lvl17, lvl18]