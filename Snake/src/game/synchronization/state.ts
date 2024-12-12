import { Entity, engine, MapComponentDefinition, DeepReadonly, BaseComponent, LastWriteWinElementSetComponentDefinition } from "@dcl/sdk/ecs";
import { Board } from "../components";
import { syncEntity } from "@dcl/sdk/network";

export class State<T, C extends MapComponentDefinition<T>>{
    private static instance_count = 0

    private _stateEntity: Entity
    private _handlers: Array<(state: DeepReadonly<C> | undefined) => void> = []
    private _component: C

    constructor (component: C){
        State.instance_count++
        this._component = component
        this._stateEntity = engine.addEntity()
        component.create(this._stateEntity)
        component.onChange(this._stateEntity, (state: any) => {
            this._handlers.forEach(handler => handler(state))
        })

        syncEntity(this._stateEntity, [component.componentId], State.instance_count + 5000)
    }
    
    public subscribe(callback: (state: DeepReadonly<C> | undefined) => void){
        this._handlers.push(callback)
    }

    public update(state: Partial<T>){
        this._component.createOrReplace(this._stateEntity, state)
    }
}