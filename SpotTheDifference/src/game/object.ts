import { Entity, engine, Transform, GltfContainer, ColliderLayer, InputAction, pointerEventsSystem, TransformType, Tween, EasingFunction, TweenSequence, TweenLoop } from "@dcl/sdk/ecs"
import { VARIANT } from "./types"
import { Vector3 } from "@dcl/sdk/math"
import * as utils from '@dcl-sdk/utils'
import { cooldown } from "../ui"

const cooldownDefault = 2
let cooldwnBase = cooldownDefault
export function resetCooldown() {
    cooldwnBase = cooldownDefault
    cooldown.value = 0
}

engine.addSystem(dt => cooldown.value = Math.max(0, cooldown.value - dt))
import { parentEntity, syncEntity } from "@dcl/sdk/network"
export class GameObject {
    private entity: Entity
    private baseSrc: string
    private altSrc: string
    private altVarSrc: string
    public readonly differs: boolean
    private marked = new Promise<GameObject>(resolve => this.resolveMarked = resolve)
    private resolveMarked!: (value: GameObject) => void
    private timer: ReturnType<typeof utils.timers.setTimeout> | undefined
    
    constructor(private model: string, base: VARIANT, altVar: VARIANT, transform: TransformType) {
        this.differs = altVar !== VARIANT.ALT
        this.entity = engine.addEntity()
        syncEntity(this.entity, [Transform.componentId, GltfContainer.componentId])
        Transform.create(this.entity, {position: Vector3.add(transform.position, Transform.get(transform.parent!).position), parent: undefined})
        // parentEntity(this.entity, transform.parent!)
        
        this.baseSrc = `models/${model}_${base}.gltf`
        // if (this.differs) this.baseSrc = `models/${model}_alt.gltf`
        this.altSrc = `models/${model}_alt.gltf`
        this.altVarSrc = `models/${model}_${altVar}.gltf`
        // console.log(this.origSrc, this.altSrc, base, altVar)
        
        GltfContainer.create(this.entity, {
            src: this.baseSrc,
            visibleMeshesCollisionMask: ColliderLayer.CL_POINTER | ColliderLayer.CL_PHYSICS
        })
        
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText: 'Click to toggle', showFeedback: false }
            },
            () => {
                if (cooldown.value > 0) console.log("can't click")
                else if (this.differs) {
                    this.mark()
                    cooldwnBase = cooldownDefault
                } else {
                    cooldown.value = cooldwnBase
                    cooldwnBase = cooldwnBase < 50 ? cooldwnBase * 2 : cooldwnBase
                }
            }
        )
    }

    private mark() {
        if (!this.differs) return
        this.resolveMarked(this)
        this.toggle(GltfContainer.get(this.entity).src !== this.baseSrc)
        pointerEventsSystem.removeOnPointerDown(this.entity)
        Tween.createOrReplace(this.entity, {
            mode: Tween.Mode.Move({
                start: Transform.get(this.entity).position,
                end: Vector3.add(Transform.get(this.entity).position, Vector3.create(0, 0.05, 0)),
            }),
            duration: 1000,
            easingFunction: EasingFunction.EF_EASESINE,
        })
        TweenSequence.createOrReplace(this.entity, {
            sequence: [],
            loop: TweenLoop.TL_YOYO
        })
    }

    public get isMarked() {
        return this.marked
    }
    
    public async toggle(alt: Boolean) {
        if (!alt) {
            if (this.timer) utils.timers.clearTimeout(this.timer)
            Promise.race([this.marked, undefined]).then(m => GltfContainer.getMutable(this.entity).src = m ? this.altVarSrc : this.baseSrc)
        } else 
        // if (!this.differs || await Promise.race([this.marked, undefined])) 
        {
            Promise.race([this.marked, undefined]).then(m => GltfContainer.getMutable(this.entity).src = m ? this.baseSrc : this.altVarSrc)
        }
        //  else {
        //     GltfContainer.getMutable(this.entity).src = this.altSrc
        //     this.timer = utils.timers.setTimeout(() => GltfContainer.getMutable(this.entity).src = this.altVarSrc, Math.random() * 1000)
        // }
    }
    
    public destroy() {
        engine.removeEntity(this.entity)
    }
}