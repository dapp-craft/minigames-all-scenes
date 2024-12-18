import { EasingFunction, engine, Entity, executeTask, GltfContainer, InputAction, Material, MeshRenderer, pointerEventsSystem, Transform, TransformType, Tween, tweenSystem } from "@dcl/sdk/ecs"
import { Color3, Vector3 } from "@dcl/sdk/math"
import { readGltfLocators } from "../../../common/locators"
import { FLASK_MODEL, PIPE_MODEL } from "../resources"
import * as utils from '@dcl-sdk/utils'

const flaskMappingReady = readGltfLocators(`locators/locators_flask_mapping.gltf`)

class Layer {
    private root = engine.addEntity()
    private layer = engine.addEntity()
    private _volume = 0
    private _color

    constructor(parent: Entity, color: Color3) {
        this._color = color
        if (Transform.has(this.root)) console.error(`BUG!!: layer transform anomaly at entity ${this.root}`)
        Transform.createOrReplace(this.root, { parent, scale: Vector3.Zero() })
        Material.setPbrMaterial(this.layer, {albedoColor: { ...color, a: 1}, emissiveColor: color, emissiveIntensity: 0.4})
        if (Transform.has(this.layer)) console.error(`BUG!!: layer transform anomaly at entity ${this.layer}`)
        Transform.createOrReplace(this.layer, { scale: Vector3.One(), position: Vector3.create(0, 0.5, 0), parent: this.root })
    }
    public async set(from: number, to: number) {
        console.log(`Layer::set@${this.root} with volume ${this._volume} to [${from}:${to}]`)
        const bottom = (await flaskMappingReady).get(`obj_layer_${from}`)!.position
        const {position: top, scale: {y: radius}} = (await flaskMappingReady).get(`obj_layer_${to}`)!
        MeshRenderer.setCylinder(this.layer, radius, radius)
        Transform.getMutable(this.root).position = bottom
        Tween.createOrReplace(this.root, {
            mode: Tween.Mode.Scale({
                start: this._volume ? Transform.get(this.root).scale : Vector3.create(1, 0, 1),
                end: Vector3.create(1, top.y - bottom.y - 0.001, 1),
            }),
            duration: 300 * Math.abs(to - from - this._volume),
            easingFunction: EasingFunction.EF_LINEAR
        })
        this._volume = to - from
        let resolve: Function
        const start = Date.now()
        const timeout = 3 * Tween.get(this.root).duration
        const fn = async () => {
            if (tweenSystem.tweenCompleted(this.root) || Date.now() - start > timeout) {
                resolve(this)
                if (this._volume == 0) Transform.getMutable(this.root).scale = Vector3.Zero()
                if (Date.now() - start > timeout) console.error(`BUG!!: layer tween timeout at entity ${this.root}`)
            } else executeTask(fn)
        }
        executeTask(fn)
        return new Promise<Layer>(r => resolve = r)
    }
    public destroy() {
        console.log(`Layer::destroy@${this.root}`)
        engine.removeEntity(this.root)
        engine.removeEntity(this.layer)
    }
    public get volume() {
        return this._volume
    }
    public get color() {
        return this._color
    }
}

class Pipe {
    private root = engine.addEntity()
    private pipe = engine.addEntity()
    readonly ready
    constructor(parent: Entity) {
        GltfContainer.create(this.pipe, PIPE_MODEL)
        if (Transform.has(this.root)) console.error(`BUG!!: pipe transform anomaly at entity ${this.root}`)
        Transform.createOrReplace(this.root, { parent, scale: Vector3.Zero() })
        this.setColor()
        if (Transform.has(this.pipe)) console.error(`BUG!!: pipe transform anomaly at entity ${this.pipe}`)
        Transform.createOrReplace(this.pipe, { scale: Vector3.One(), position: Vector3.create(0, -0.5, 0), parent: this.root })
        this.ready = flaskMappingReady.then(f => {
            const {position, scale: {y: radius}} = f.get(`obj_valve`)!
            MeshRenderer.setCylinder(this.pipe, radius, radius)
            Transform.getMutable(this.root).position = position
        })
    }
    public destroy() {
        engine.removeEntity(this.root)
        engine.removeEntity(this.pipe)
    }
    public async move(to?: number) {
        const valve = Transform.getMutable(this.root).position
        const {position: target} = (await flaskMappingReady).get(`obj_layer_${to}`) ?? {position: valve}
        Tween.createOrReplace(this.root, {
            mode: Tween.Mode.Scale({
                start: Transform.get(this.root).scale,
                end: Vector3.create(1, valve.y - target.y, 1),
            }),
            duration: 250,
            easingFunction: EasingFunction.EF_LINEAR
        })
        let resolve: Function
        const start = Date.now()
        const timeout = 3 * Tween.get(this.root).duration
        const fn = async () => {
            if (tweenSystem.tweenCompleted(this.root) || Date.now() - start > timeout) {
                resolve(this)
                if (Date.now() - start > timeout) console.error(`BUG!!: pipe tween timeout at entity ${this.root}`)
            } else executeTask(fn)
        }
        executeTask(fn)
        return new Promise<Layer>(r => resolve = r)
    }
    public setColor(color: Color3 = Color3.Black()) {
        Material.setPbrMaterial(this.pipe, {
            albedoColor: { ...color, a: 1 },
            emissiveColor: color,
            emissiveIntensity: 0.4
        })
    }
}

enum State {
    active, inactive, busy, sealed
}

export class Flask {
    private ready: Promise<any>
    private resolveActivated!: Function
    private promiseActivated = new Promise<Flask>(r => this.resolveActivated = r)
    private resolveDeactivated!: Function
    private promiseDeactivated = new Promise<Flask>(r => this.resolveDeactivated = r)
    private state: State = State.inactive
    private _capacity = 0
    private entity = engine.addEntity()
    private pipe = new Pipe(this.entity)
    private layers: Layer[] = []

    constructor(transform: TransformType) {
        GltfContainer.create(this.entity, FLASK_MODEL)
        if (Transform.has(this.entity)) console.error(`BUG!!: flask transform anomaly at entity ${this.entity}`)
        Transform.createOrReplace(this.entity, JSON.parse(JSON.stringify(transform)))
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText: 'Interact' },
            },
            () => void [this.deactivate, this.activate][this.state]?.call(this)
        )
        this.ready = flaskMappingReady
            .then(data => this._capacity = Array.from(data.keys()).filter(k => k.match(/obj_layer_[^0]/)).length)
            .then(() => this.pipe.ready)
    }
    public async destroy() {
        console.log("Flask::destroy")
        while (this.layers.length > 0) await this.drain()
        await this.hidePipe()
        this.pipe.destroy()
        engine.removeEntity(this.entity)
    }
    public async applyConfig(data: ReadonlyArray<Color3>) {
        let state: Array<[Color3, number]> = data
            .reduce(
                ([[c, v] = [, 0], ...acc ], val) => c && !Color3.equals(c, val)
                    ? [[val, 1], [c, v], ...acc]
                    : [[val, v + 1], ...acc],
                [] as any[]
            ) // This converts [red, red, blue] to [[red, 2], [blue, 1]]
            .reverse()
        let idx = 0
        for (const [color, volume] of state) {
            let layer: Layer | undefined = this.layers[idx]
            if (layer && !Color3.equals(layer.color, color)) {
                for (const _ of this.layers.slice(idx)) await this.drain()
                layer = undefined
            }
            if (!layer || layer.volume != volume) await this.pour(color, volume - (layer?.volume ?? 0))
            idx++
        }
        if (this.layers[idx]) for (const _ of this.layers.slice(idx)) await this.drain()
        await this.hidePipe()
        return this
    }
    public getConfig() {
        return this.layers.flatMap(l => new Array<Color3>(l.volume).fill(l.color))
    }

    public seal() {
        if (this.state == State.sealed) return
        if (this.state == State.busy) throw `Hide pipe failed: flask is busy`
        this.state = State.sealed
        this.promiseActivated = new Promise(r => this.resolveActivated = r)
        this.promiseDeactivated = new Promise(r => this.resolveDeactivated = r)
    }
    public get sealed() {
        return this.state == State.sealed
    }

    public async activate() {
        if (this.state == State.sealed) return
        if (this.state != State.inactive) throw `Activate failed: flask is ${State[this.state]}`
        this.state = State.busy
        await this.ready
        console.log("Flask::activate")
        this.resolveActivated(this)
        Transform.getMutable(this.entity).position.y += 0.1
        this.promiseDeactivated = new Promise(r => this.resolveDeactivated = r)
        this.state = State.active
    }
    public get activated() { return this.promiseActivated }

    public async deactivate() {
        if (this.state == State.sealed) return
        if (this.state != State.active) throw `Deactivate failed: flask is ${State[this.state]}`
        this.state = State.busy
        await this.ready
        console.log("Flask::deactivate")
        this.resolveDeactivated(this)
        Transform.getMutable(this.entity).position.y -= 0.1
        this.promiseActivated = new Promise(r => this.resolveActivated = r)
        this.state = State.inactive
    }
    public get deactivated() { return this.promiseDeactivated }

    public async hidePipe() {
        if (this.state == State.busy) throw `Hide pipe failed: flask is busy`
        const tmp = this.state
        this.state = State.busy
        await this.pipe.move()
        this.state = tmp
    }

    public get fillLevel() {
        return this.layers.reduce((acc, {volume}) => acc + volume, 0)
    }
    public get capacity() {
        return this._capacity
    }
    public get topLayer() : Layer | undefined {
        return this.layers[this.layers.length - 1]
    }
    public get layersCount() {
        return this.layers.length
    }

    public async pour(color: Color3, volume: number) {
        if (this.state == State.busy) throw `Pour failed: flask is busy`
        await this.ready
        if (this.fillLevel + volume > this.capacity) throw `Pour failed: level ${this.fillLevel} and volume ${volume} is over capacity`
        const tmp = this.state
        this.state = State.busy
        if (!this.topLayer || !Color3.equals(color, this.topLayer.color)) this.layers.push(new Layer(this.entity, color))
        await this.pipe.move(this.fillLevel)
        this.pipe.setColor(color)
        await this.topLayer!.set(this.fillLevel - this.topLayer!.volume, this.fillLevel + volume)
        this.pipe.setColor()
        this.state = tmp
    }
    public async drain(volume = this.topLayer?.volume) {
        if (this.state == State.busy) throw `Drain failed: flask is busy`
        if (!volume || volume > this.topLayer!.volume) throw `Drain failed: invalid amount ${volume} for layer volume ${this.topLayer?.volume}`
        await this.ready
        const tmp = this.state
        this.state = State.busy
        await this.pipe.move(this.fillLevel - volume)
        this.pipe.setColor(this.topLayer!.color)
        await this.topLayer!.set(this.fillLevel - this.topLayer!.volume, this.fillLevel - volume)
        this.pipe.setColor()
        if (this.topLayer!.volume == 0) this.layers.pop()!.destroy()
        this.state = tmp
    }
}
