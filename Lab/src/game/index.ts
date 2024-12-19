import { progress } from "@dcl-sdk/mini-games/src"
import { engine, TransformType } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"
import { cancelCountdown, cancelWinAnimation, runCountdown, runWinAnimation } from "../../../common/effects"
import { LEVELS } from "../settings/levels"
import { FlowController } from "../utils"
import { Flask } from "./flask"
import { Ui3D } from "./ui3D"

export class GameLevel {
    private _flasks: Flask[] = []
    private elapsed = 0
    private moves = 0
    readonly ready
    constructor(
        flaskTransforms: TransformType[],
        readonly level: keyof typeof LEVELS,
        private flow: FlowController<any>,
        private ui3d: Ui3D,
        private onStateChange: (arg: GameLevel) => void
    ) {
        console.log(`GameLevel::init ${level}`)
        const {colors, flasks: configs} = LEVELS[level]
        ui3d.setLevel(level)
        ui3d.setMoves(0)
        ui3d.setTime(0)
        this.ready = Promise
            .all(configs.map(async (config, idx) => {
                const flask = new Flask(flaskTransforms[idx])
                await flask.activate()
                await flask.applyConfig(config.map(c => Color3.fromArray((colors as any)[c])))
                await flask.deactivate()
                return flask
            }))
            .then(flasks => this._flasks = flasks)
            .then(() => this.onStateChange(this))
    }
    get flasks() {
        return this._flasks
    }
    async play() {
        await Promise.race([Promise.all([this.ready, runCountdown()]), this.flow.interrupted])
        engine.addSystem(dt => void this.ui3d.setTime(this.elapsed += dt), undefined, 'stopwatch')
        while (!this._flasks.every(f => !f.topLayer || f.sealed)) {
            let first = await Promise.race([...this._flasks.map(f => f.activated), this.flow.interrupted])
            if (!first.topLayer) {
                await first.deactivate()
                continue
            }
            let second = await Promise
                .race([...this._flasks.map(f => f == first ? f.deactivated : f.activated), this.flow.interrupted])
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
                this.ui3d.setMoves(++this.moves)
                this.onStateChange(this)
                if (second.layersCount == 1 && second.fillLevel == second.capacity) second.seal()
            }
            await first.deactivate()
            await second.deactivate()
        }
        this.flasks.forEach(f => f.seal())
        engine.removeSystem('stopwatch')
        progress.upsertProgress({level: this.level, time: Math.floor(this.elapsed * 1000), moves: this.moves})
        await Promise.race([runWinAnimation(), this.flow.interrupted])
    }
    public async stop() {
        cancelCountdown()
        cancelWinAnimation()
        engine.removeSystem('stopwatch')
        this.ui3d.setMoves()
        this.ui3d.setLevel()
        this.ui3d.setTime()
        await this.ready
        const destruction = Promise.all(this._flasks.splice(0).map(async f => {
            await f.activate()
            await f.destroy()
        }))
        this.onStateChange(this)
        await destruction
        await Promise.race([this.flow.interrupted, Promise.resolve()])
    }
}
