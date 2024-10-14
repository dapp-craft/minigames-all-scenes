import { LvlType } from "./Types"

export const randomLvl: LvlType = {
    wave: new Map(),
    spawnEntityDelay: { time: 3000, random: true },
    initialEntityAmount: 1
}

export const levelArray = [randomLvl]