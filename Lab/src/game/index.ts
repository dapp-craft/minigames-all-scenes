import { Color3, Vector3 } from "@dcl/sdk/math"
import { cancelCountdown, cancelWinAnimation, runCountdown, runWinAnimation } from "../../../common/effects"
import { LEVELS } from "../settings/levels"
import { Flask } from "./flask"

export const positions: Vector3[] = []

export async function playLevel(level: keyof typeof LEVELS, abort: Promise<never>) {
    const {colors, flasks: configs} = LEVELS[level]
    let flasks = await Promise.all(configs.map((f, idx) => new Flask(positions[idx]).applyConfig(f.map(c => Color3.fromArray(colors[c])))))
    try {
        await Promise.race([runCountdown(), abort])
        while (!flasks.every(f => !f.topLayer || f.layersCount == 1 && f.fillLevel == f.capacity)) {
            let first = await Promise.race([...flasks.map(f => f.activated), abort])
            if (!first.topLayer) {
                first.deactivate()
                continue
            }
            let second = await Promise.race([...flasks.map(f => f == first ? f.deactivated : f.activated), abort])
            if (first == second) continue
            const {color, volume} = first.topLayer
            if (!second.topLayer || Color3.equals(second.topLayer.color, color) && second.fillLevel + volume <= second.capacity)
                await Promise.all([first.drain(), second.pour(color, volume)])
            first.deactivate()
            second.deactivate()
        }
        await Promise.race([runWinAnimation(), abort])
    } finally {
        cancelCountdown()
        cancelWinAnimation()
        flasks.forEach(f => f.destroy())
    }
}