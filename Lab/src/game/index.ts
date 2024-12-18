import { TransformType } from "@dcl/sdk/ecs"
import { Color3 } from "@dcl/sdk/math"
import { cancelCountdown, cancelWinAnimation, runCountdown, runWinAnimation } from "../../../common/effects"
import { LEVELS } from "../settings/levels"
import { FlowController } from "../utils"
import { Flask } from "./flask"

export const flaskTransforms: TransformType[] = []

export class GameLevel {
    private _flasks: Flask[] = []
    readonly ready
    constructor(readonly level: keyof typeof LEVELS, private flow: FlowController<any>, private onStateChange: (arg: GameLevel) => void) {
        const {colors, flasks: configs} = LEVELS[level]
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
        while (!this._flasks.every(f => !f.topLayer || f.layersCount == 1 && f.fillLevel == f.capacity)) {
            let first = await Promise.race([...this._flasks.map(f => f.activated), this.flow.interrupted])
            if (!first.topLayer) {
                await first.deactivate()
                continue
            }
            let second = await Promise.race([...this._flasks.map(f => f == first ? f.deactivated : f.activated), this.flow.interrupted])
            if (first == second) continue
            let {color, volume} = first.topLayer
            if (!second.topLayer || Color3.equals(second.topLayer.color, color) && second.fillLevel < second.capacity) {
                volume = Math.min(second.capacity - second.fillLevel, volume)
                await Promise.all([
                    first.drain(volume).then(() => first.hidePipe()),
                    second.pour(color, volume).then(() => second.hidePipe())
                ])
                this.onStateChange(this)
            }
            await first.deactivate()
            await second.deactivate()
        }
        await Promise.race([runWinAnimation(), this.flow.interrupted])
    }
    public async stop() {
        cancelCountdown()
        cancelWinAnimation()
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
