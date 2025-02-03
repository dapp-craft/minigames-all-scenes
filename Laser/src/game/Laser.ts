import { engine, Entity, Material, MeshRenderer, Transform, TransformType } from '@dcl/sdk/ecs'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { LightSource } from '..'
import { getVectorDirection } from './utils'

export class Laser implements LightSource {
  public laserEntity: Entity = engine.addEntity()
  public laserTransform: TransformType

  constructor(rayTransform: TransformType) {
    this.laserTransform = rayTransform
    this.createOrReplaseLaser()
  }

  getRay(): { origin: Vector3; direction: Vector3 } {
    return {
      origin: Transform.get(this.laserEntity).position,
      direction: getVectorDirection(this.laserTransform.rotation)
    }
  }

  private createOrReplaseLaser() {
    MeshRenderer.setCylinder(this.laserEntity, 0.05, 0.05)
    Transform.createOrReplace(this.laserEntity, this.laserTransform)
    Material.setPbrMaterial(this.laserEntity, {
      albedoColor: Color4.Yellow(),
      metallic: 0,
      roughness: 1
    })
  }

  removeLaser() {
    engine.removeEntity(this.laserEntity)
  }
}
