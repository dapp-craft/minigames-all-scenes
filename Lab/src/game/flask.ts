import { sceneParentEntity } from "@dcl-sdk/mini-games/src"
import { EasingFunction, engine, Entity, GltfContainer, InputAction, Material, MeshCollider, MeshRenderer, pointerEventsSystem, Transform, Tween, tweenSystem } from "@dcl/sdk/ecs"
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
        MeshRenderer.setCylinder(this.layer, 0.3, 0.3)
        Material.setBasicMaterial(this.layer, {diffuseColor: { ...color, a: 1}})
        Transform.create(this.layer, { parent: this.root })
    }
    public async fill(from: number, to: number) {
        const bottom = (await flaskMappingReady).get(`obj_layer_${from}`)!.position
        const top = (await flaskMappingReady).get(`obj_layer_${to}`)!.position
        Transform.getMutable(this.root).position = bottom
        Transform.getMutable(this.layer).scale = Vector3.One()
        Transform.getMutable(this.layer).position.y = 0.5
        Tween.createOrReplace(this.root, {
            mode: Tween.Mode.Scale({
                start: this._volume ? Transform.get(this.root).scale : Vector3.create(1, 0, 1),
                end: Vector3.create(1, top.y - bottom.y, 1),
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
        return new Promise(r => resolve = r)
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
        return new Promise(r => resolve = r)
    }
    public get volume() {
        return this._volume
    }
    public get color() {
        return this._color
    }
}

enum State {
    active, inactive
}

export class Flask {
    private ready
    private resolveActivated!: Function
    private promiseActivated = new Promise<Flask>(r => this.resolveActivated = r)
    private resolveDeactivated!: Function
    private promiseDeactivated = new Promise<Flask>(r => this.resolveDeactivated = r)
    private state: State = State.inactive
    private _capacity = 0
    private entity = engine.addEntity()
    private layers: Layer[] = []

    constructor(position: Vector3) {
        GltfContainer.create(this.entity, FLASK_MODEL)
        Transform.create(this.entity, { position, parent: sceneParentEntity })
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText: 'Interact' },
            },
            () => void [this.deactivate, this.activate][this.state].call(this)
        )
        this.ready = flaskMappingReady.then(data => this._capacity = Array.from(data.keys()).filter(k => k.match(/obj_layer_[^0]/)).length)
    }
    public async destroy() {
        for (const _ of this.layers) await this.drain()
        engine.removeEntity(this.entity)
    }
    public async applyConfig(data: Array<Color3>) {
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
            if (layer && (!Color3.equals(layer.color, color) || layer.volume != volume)) {
                for (const _ of this.layers.slice(idx)) await this.drain()
                layer = undefined
            }
            if (!layer) await this.pour(color, volume)
            idx++
        }
        return this
    }

    public async activate() {
        await this.ready
        this.state = State.active
        this.resolveActivated(this)
        this.promiseDeactivated = new Promise(r => this.resolveDeactivated = r)
    }
    public get activated() { return this.promiseActivated }

    public async deactivate() {
        await this.ready
        this.state = State.inactive
        this.resolveDeactivated(this)
        this.promiseActivated = new Promise(r => this.resolveActivated = r)
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
        await this.ready
        if (this.fillLevel + volume > this.capacity) throw Error
        if (!this.topLayer || !Color3.equals(color, this.topLayer.color)) this.layers.push(new Layer(this.entity, color))
        await this.topLayer!.fill(this.fillLevel - this.topLayer!.volume, this.fillLevel + volume)
    }
    public async drain() {
        await this.ready
        await this.layers.pop()?.deplete()
    }
}
