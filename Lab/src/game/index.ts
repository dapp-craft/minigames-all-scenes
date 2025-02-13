import { progress } from "@dcl-sdk/mini-games/src"
import { engine, TransformType } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"
import { cancelCountdown, cancelWinAnimation, runCountdown, runWinAnimation } from "../../../common/effects"
import { LEVELS } from "../settings/levels"
import { SoundManager } from "./soundManager"
import { FlowController } from "../utils"
import { Flask } from "./flask"
import { Ui3D } from "./ui3D"
import { randomInt } from "../../../common/utils/random"

export async function playLevel(
    flaskTransforms: TransformType[],
    level: keyof typeof LEVELS,
    flow: FlowController<any>,
    ui3d: Ui3D,
    soundManager: SoundManager,
    onStateChange: (arg: Flask[]) => void
) {
    console.log(`Starting level ${level}`)
    const {colors, flasks: configs} = LEVELS[level]
    ui3d.setLevel(level)
    ui3d.setMoves(0)
    ui3d.setTime(0)
    let elapsed = 0
    let moves = 0
    let flasks!: Flask[]
    const countdownFinished = runCountdown(3)
    const flaskUnlocked: Promise<any>[] = []
    const levelInitialized = Promise
        .all(configs.map(async (config, idx) => {
            const flask = new Flask(flaskTransforms[idx])
            await flask.activate()
            soundManager.playSound('pour', randomInt(0, config.length * 300))
            await flask.applyConfig(config.map(c => Color3.fromArray((colors as any)[c])))
            await flask.deactivate()
            flaskUnlocked.push(flask.lock(levelInitialized))
            return flask
        }))
        .then(val => flasks = val)
        .then(() => onStateChange(flasks))
        .then(() => countdownFinished)
    const ready = levelInitialized.then(() => Promise.all(flaskUnlocked))

    try {
        await Promise.race([ready, flow.interrupted])
        engine.addSystem(dt => void ui3d.setTime(elapsed += dt), undefined, 'stopwatch')
        while (!flasks.every(f => !f.topLayer || f.sealed)) {
            if (!doesMoveExists(flasks)) ui3d.setNoMoves()
            let first = await Promise.race([...flasks.map(f => f.activated), flow.interrupted])
            if (!first.topLayer) {
                soundManager.playSound('error')
                await first.deactivate()
                continue
            }
            soundManager.playSound('first')
            let second = await Promise
                .race([...flasks.map(f => f == first ? f.deactivated : f.activated), flow.interrupted])
                //@ts-ignore linter bug
                .catch(async e => void await first.deactivate() ?? Promise.reject(e))
            if (first == second) continue
            let {color, volume} = first.topLayer
            if (!second.topLayer || Color3.equals(second.topLayer.color, color) && second.fillLevel < second.capacity) {
                volume = Math.min(second.capacity - second.fillLevel, volume)
                soundManager.playSound('second')
                soundManager.playSound('pour', 250)
                await Promise.all([
                    first.drain(volume).then(() => first.hidePipe()),
                    second.pour(color, volume).then(() => second.hidePipe())
                ])
                ui3d.setMoves(++moves)
                onStateChange(flasks)
                if (second.layersCount == 1 && second.fillLevel == second.capacity) second.seal()
            } else soundManager.playSound('error')
            await first.deactivate()
            await second.deactivate()
        }
        flasks.forEach(f => f.seal())
        engine.removeSystem('stopwatch')
        soundManager.playSound('win', 0, 1)
        progress.upsertProgress({level, time: Math.floor(elapsed * 1000), moves})
        ui3d.unlockButtons(level + 1)
        await Promise.race([runWinAnimation(), flow.interrupted])
    } finally {
        cancelCountdown()
        cancelWinAnimation()
        engine.removeSystem('stopwatch')
        ui3d.setMoves()
        ui3d.setLevel()
        ui3d.setTime()
        await ready
        const destruction = Promise.all(flasks.splice(0).map(async f => {
            await f.activate()
            soundManager.playSound('pour', randomInt(0, f.fillLevel * 300))
            await f.destroy()
        }))
        onStateChange(flasks)
        await destruction
        await Promise.race([flow.interrupted, Promise.resolve()])
    }
}

function doesMoveExists(flasks: Flask[]) {
    for (let first of flasks) for (let second of flasks) {
        // No actions possible with flasks at all
        if (first == second || !first.topLayer || second.fillLevel == second.capacity) continue
        // Second flask won't accept top layer from the first
        if (second.topLayer && !Color3.equals(second.topLayer.color, first.topLayer.color)) continue
        // Layer won't be moved completely
        if (second.capacity - second.fillLevel < first.topLayer.volume) continue
        // Otherwise the move exists
        return true
    }
    return false
}
