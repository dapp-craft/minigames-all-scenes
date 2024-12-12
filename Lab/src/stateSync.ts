import { engine, executeTask, MapComponentDefinition, MapResult, Spec } from "@dcl/sdk/ecs"
import { syncEntity } from "@dcl/sdk/network"

export type StateHandler<T extends Spec> = {
    launch?: () => Promise<any>
    update: (arg: MapResult<T>) => Promise<any>
    terminate?: () => Promise<any>
}
export function CreateStateSynchronizer<T extends Spec, H extends StateHandler<T>>(name: String, spec: T, handler: H) {
    const definition = engine.defineComponent(`${name}::state`, spec)
    const id = name
        .padStart(4, '-')
        .split('', 4)
        .reverse()
        .reduce((p, c, i) => p + c.charCodeAt(0) % 100 * 100 ** i, 0)
    return class extends StateSynchronizer<T> {
        readonly StateComponent = definition
        readonly syncId = id
        protected handler = handler
        constructor() {
            super()
            this.init()
        }
    }
}

enum Status {
    idle, starting, running, stopping
}
abstract class StateSynchronizer<T extends Spec> {
    readonly abstract StateComponent: MapComponentDefinition<MapResult<T>>
    readonly abstract syncId: number
    protected abstract handler: StateHandler<T>
    private client = engine.addEntity()
    private updatePending = false
    private status = Status.idle
    protected init() {
        this.StateComponent.create(this.client)
        syncEntity(this.client, [this.StateComponent.componentId], this.syncId)
        this.StateComponent.onChange(this.client, () => this.updatePending = true)
        this.run()
    }
    private async run() {
        switch (this.status) {
            case Status.starting:
                this.status = Status.running
                await this.handler.launch?.()
            case Status.running:
                if (this.updatePending) {
                    this.updatePending = false
                    await this.handler.update(this.StateComponent.get(this.client) as any)
                }
                break
            case Status.stopping:
                this.status = Status.idle
                await this.handler.terminate?.()
            default:
                break;
        }
        executeTask(this.run.bind(this))
    }

    public start() {
        this.status = this.status != Status.stopping ? Status.starting : Status.running
    }
    public stop() {
        this.status = this.status != Status.starting ? Status.stopping : Status.idle
    }
    public send(arg: MapResult<T>) {
        this.StateComponent.createOrReplace(this.client, arg)
    }
}
