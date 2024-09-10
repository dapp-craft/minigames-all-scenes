import { Entity, engine, Transform, GltfContainer, ColliderLayer, InputAction, pointerEventsSystem, TransformType } from "@dcl/sdk/ecs"
import { VARIANT } from "./types"

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
                if (this.differs) console.log('Differs!')
                else console.error('Same')
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