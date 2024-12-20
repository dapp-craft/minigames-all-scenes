import { progress } from "@dcl-sdk/mini-games/src"
import { engine, TransformType } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"
import { cancelCountdown, cancelWinAnimation, runCountdown, runWinAnimation } from "../../../common/effects"
import { LEVELS } from "../settings/levels"
import { FlowController } from "../utils"
import { Flask } from "./flask"
import { Ui3D } from "./ui3D"

export async function playLevel(
    flaskTransforms: TransformType[],
    level: keyof typeof LEVELS,
    flow: FlowController<any>,
    ui3d: Ui3D,
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
            let first = await Promise.race([...flasks.map(f => f.activated), flow.interrupted])
            if (!first.topLayer) {
                await first.deactivate()
                continue
            }
            let second = await Promise
                .race([...flasks.map(f => f == first ? f.deactivated : f.activated), flow.interrupted])
                //@ts-ignore linter bug
                .catch(async e => void await first.deactivate() ?? Promise.reject(e))
            if (first == second) continue
            let {color, volume} = first.topLayer
            if (!second.topLayer || Color3.equals(second.topLayer.color, color) && second.fillLevel < second.capacity) {
                volume = Math.min(second.capacity - second.fillLevel, volume)
                await Promise.all([
                    first.drain(volume).then(() => first.hidePipe()),
                    second.pour(color, volume).then(() => second.hidePipe())
                ])
                ui3d.setMoves(++moves)
                onStateChange(flasks)
                if (second.layersCount == 1 && second.fillLevel == second.capacity) second.seal()
            }
            await first.deactivate()
            await second.deactivate()
        }
        flasks.forEach(f => f.seal())
        engine.removeSystem('stopwatch')
        progress.upsertProgress({level, time: Math.floor(elapsed * 1000), moves})
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
            await f.destroy()
        }))
        onStateChange(flasks)
        await destruction
        await Promise.race([flow.interrupted, Promise.resolve()])
    }
}
