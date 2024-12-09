import { EasingFunction, engine, Entity, GltfContainer, InputAction, Material, MeshRenderer, pointerEventsSystem, Transform, TransformType, Tween, tweenSystem } from "@dcl/sdk/ecs"
import { Color3, Vector3 } from "@dcl/sdk/math"
import { readGltfLocators } from "../../../common/locators"
import { FLASK_MODEL } from "../resources"

const flaskMappingReady = readGltfLocators(`locators/locators_flask_mapping.gltf`)

class Layer {
    private root = engine.addEntity()
    private layer = engine.addEntity()
    private _volume = 0
    private _color

    constructor(parent: Entity, color: Color3) {
        this._color = color
        Transform.create(this.root, { parent, scale: Vector3.Zero() })
        Material.setBasicMaterial(this.layer, {diffuseColor: { ...color, a: 1}})
        Transform.create(this.layer, { parent: this.root })
    }
    public async fill(from: number, to: number) {
        const bottom = (await flaskMappingReady).get(`obj_layer_${from}`)!.position
        const {position: top, scale: {y: radius}} = (await flaskMappingReady).get(`obj_layer_${to}`)!
        MeshRenderer.setCylinder(this.layer, radius, radius)
        Transform.getMutable(this.root).position = bottom
        Transform.getMutable(this.layer).scale = Vector3.One()
        Transform.getMutable(this.layer).position.y = 0.5
        Tween.createOrReplace(this.root, {
            mode: Tween.Mode.Scale({
                start: this._volume ? Transform.get(this.root).scale : Vector3.create(1, 0, 1),
                end: Vector3.create(1, top.y - bottom.y - 0.001, 1),
            }),
            duration: 300 * (to - from - this._volume),
            easingFunction: EasingFunction.EF_LINEAR
        })
        this._volume = to - from
        let resolve: Function
        engine.addSystem(() => {
            const tweenCompleted = tweenSystem.tweenCompleted(this.root)
            if (tweenCompleted) resolve(this)
        })
        return new Promise<Layer>(r => resolve = r)
    }
    public async deplete() {
        Tween.createOrReplace(this.root, {
            mode: Tween.Mode.Scale({
                start: Transform.get(this.root).scale,
                end: Vector3.create(1, 0, 1),
            }),
            duration: 300 * this._volume,
            easingFunction: EasingFunction.EF_LINEAR
        })
        this._volume = 0
        let resolve: Function
        engine.addSystem(() => {
            const tweenCompleted = tweenSystem.tweenCompleted(this.root)
            if (tweenCompleted) {
                resolve(this)
                Transform.getMutable(this.root).scale = Vector3.Zero()
            }
        })
        return new Promise<Layer>(r => resolve = r)
    }
    public destroy() {
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

enum State {
    active, inactive, busy
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
    private layers: Layer[] = []

    constructor(transform: TransformType) {
        GltfContainer.create(this.entity, FLASK_MODEL)
        Transform.create(this.entity, JSON.parse(JSON.stringify(transform)))
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText: 'Interact' },
            },
            () => void [this.deactivate, this.activate][this.state]?.call(this)
        )
        this.ready = flaskMappingReady.then(data => this._capacity = Array.from(data.keys()).filter(k => k.match(/obj_layer_[^0]/)).length)
    }
    public async destroy() {
        while (this.layers.length > 0) await this.drain()
        engine.removeEntity(this.entity)
    }
    public async applyConfig(data: ReadonlyArray<Color3>) {
        let state: Array<[Color3, number]> = data
            .reduce(
                ([[c, v] = [, 0], ...acc ], val) => c && !Color3.equals(c, val)
                    ? [[val, 1], [c, v], ...acc]
                    : [[val, v + 1], ...acc],
                [] as any[]
            )
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
        return this
    }
    public getConfig() {
        return this.layers.flatMap(l => new Array<Color3>(l.volume).fill(l.color))
    }

    public async activate() {
        if (this.state != State.inactive) throw `Activate failed: flask is ${State[this.state]}`
        this.state = State.busy
        await this.ready
        console.log("ACT")
        this.resolveActivated(this)
        Transform.getMutable(this.entity).position.y += 0.1
        this.promiseDeactivated = new Promise(r => this.resolveDeactivated = r)
        this.state = State.active
    }
    public get activated() { return this.promiseActivated }

    public async deactivate() {
        if (this.state != State.active) throw `Deactivate failed: flask is ${State[this.state]}`
        this.state = State.busy
        await this.ready
        console.log("DEACT")
        this.resolveDeactivated(this)
        Transform.getMutable(this.entity).position.y -= 0.1
        this.promiseActivated = new Promise(r => this.resolveActivated = r)
        this.state = State.inactive
    }
    public get deactivated() { return this.promiseDeactivated }

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
        await this.topLayer!.fill(this.fillLevel - this.topLayer!.volume, this.fillLevel + volume)
        this.state = tmp
    }
    public async drain() {
        if (this.state == State.busy) throw `Drain failed: flask is busy`
        await this.ready
        const tmp = this.state
        this.state = State.busy
        await this.layers.pop()?.deplete().then(l => l.destroy())
        this.state = tmp
    }
}
