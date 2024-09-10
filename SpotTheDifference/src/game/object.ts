import { Entity, engine, Transform, GltfContainer, ColliderLayer, InputAction, pointerEventsSystem, TransformType, Tween, EasingFunction, TweenSequence, TweenLoop } from "@dcl/sdk/ecs"
import { VARIANT } from "./types"
import { Vector3 } from "@dcl/sdk/math"

export class GameObject {
    private entity: Entity
    private origSrc: string
    private altSrc: string
    private differs: boolean
    
    constructor(private model: string, origVar: VARIANT, altVar: VARIANT, transform: TransformType) {
        this.differs = altVar !== VARIANT.ALT
        this.entity = engine.addEntity()
        Transform.create(this.entity, transform)
        
        this.origSrc = `models/${model}_${origVar}.gltf`
        this.altSrc = `models/${model}_${altVar}.gltf`
        console.log(this.origSrc, this.altSrc, origVar, altVar)
        
        GltfContainer.create(this.entity, {
            src: this.origSrc,
            visibleMeshesCollisionMask: ColliderLayer.CL_POINTER | ColliderLayer.CL_PHYSICS
        })
        
        pointerEventsSystem.onPointerDown(
            {
                entity: this.entity,
                opts: { button: InputAction.IA_POINTER, hoverText: 'Click to toggle', showFeedback: false }
            },
            () => {
                if (!this.differs) return
                pointerEventsSystem.removeOnPointerDown(this.entity)
                Tween.createOrReplace(this.entity, {
                    mode: Tween.Mode.Move({
                        start: Transform.get(this.entity).position,
                        end: Vector3.add(Transform.get(this.entity).position, Vector3.create(0, 1, 0)),
                    }),
                    duration: 500,
                    easingFunction: EasingFunction.EF_EASECIRC,
                })
                TweenSequence.createOrReplace(this.entity, {
                    sequence: [],
                    loop: TweenLoop.TL_YOYO
                })
            }
        )
    }
    
    public toggle(alt: Boolean) {
        GltfContainer.getMutable(this.entity).src = alt ? this.altSrc : this.origSrc
    }
    
    public destroy() {
        engine.removeEntity(this.entity)
    }
}