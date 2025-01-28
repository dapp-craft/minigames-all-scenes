import {
  ColliderLayer,
  engine,
  Entity,
  Material,
  MeshCollider,
  MeshRenderer,
  Transform,
  TransformType,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { LightSource } from '.'
import { getIntersectionAngle, getPoinOnRay, getRayDirection, isPointOnMirror } from './utils'

export class Mirror implements LightSource {
  public rayEntity: Entity = engine.addEntity()
  public mirrorEntity: Entity = engine.addEntity()
  public mirrorTransform: TransformType
  public rayActive: boolean = false
  public rayTransform: TransformType | null = null
  public angleOfEntry: number = 0

  private tmp = engine.addEntity()

  constructor(transform: TransformType) {
    this.mirrorTransform = transform
    this.createMirror()
    if (this.rayTransform) this.createOrUpdateRay()
  }

  getRay(): { origin: Vector3; direction: Vector3 } {
    const { position, rotation } = Transform.get(this.mirrorEntity)
    return {
      origin: position,
      direction: getRayDirection(Quaternion.multiply(rotation, Quaternion.fromEulerDegrees(0, 0, this.angleOfEntry)))
    }
  }

  public createMirror() {
    console.log(`Mirror::created in constructor@${this.mirrorEntity}`)
    MeshRenderer.setBox(this.mirrorEntity)
    if (Transform.has(this.mirrorEntity))
      console.error(`BUG!!: mirror transform anomaly at entity ${this.mirrorEntity}`)
    Transform.createOrReplace(this.mirrorEntity, JSON.parse(JSON.stringify(this.mirrorTransform)))
    MeshCollider.setBox(this.mirrorEntity, ColliderLayer.CL_POINTER)
  }

  public rotateMirror() {
    const mirrorTransform = Transform.getMutable(this.mirrorEntity)
    mirrorTransform.rotation = Quaternion.multiply(mirrorTransform.rotation, Quaternion.fromEulerDegrees(0, 0, 45))
    this.mirrorTransform = mirrorTransform
  }

  public createOrUpdateRay(length?: number) {
    console.log(`Ray::created ray@ in mirror ${this.mirrorEntity}`)
    const rayDirectionQuternion = Quaternion.multiply(
      Transform.get(this.mirrorEntity).rotation,
      Quaternion.fromEulerDegrees(0, 0, this.angleOfEntry)
    )
    const rayDirectionVector = getRayDirection(rayDirectionQuternion)
    const endPoint = getPoinOnRay(Transform.get(this.mirrorEntity).position, rayDirectionVector, length ? length : 5)

    this.rayTransform = {
      position: Vector3.lerp(Transform.get(this.mirrorEntity).position, endPoint, 0.5),
      rotation: rayDirectionQuternion,
      scale: {
        x: 1,
        y: length ? length : Vector3.distance(Transform.get(this.mirrorEntity).position, endPoint),
        z: 1
      }
    }
    MeshRenderer.setCylinder(this.rayEntity, 0.05, 0.05)
    if (this.rayTransform) Transform.createOrReplace(this.rayEntity, this.rayTransform)
    Material.setPbrMaterial(this.rayEntity, {
      albedoColor: Color4.Yellow(),
      metallic: 0,
      roughness: 1
    })
    VisibilityComponent.createOrReplace(this.rayEntity, { visible: this.rayActive })
  }

  public enlighten(source: LightSource, onHit?: (source: LightSource) => number | undefined) {
    this.createOrUpdateRay()
    let { direction, origin } = source.getRay()
    let isHit = isPointOnMirror(origin, getPoinOnRay(origin, direction, 0.5), Transform.get(this.mirrorEntity).position)
    if (!isHit || this.rayActive) return false

    MeshRenderer.setSphere(this.tmp)
    Transform.createOrReplace(this.tmp, {
      position: getPoinOnRay(origin, direction, 0.5),
      scale: { x: 0.2, y: 0.2, z: 0.2 }
    })
    Material.setPbrMaterial(this.tmp, {
      albedoColor: Color4.Red(),
      metallic: 0,
      roughness: 1
    })

    this.rayActive = true
    const mirrorPlaneDirection = getRayDirection(
      Quaternion.multiply(Transform.get(this.mirrorEntity).rotation, Quaternion.fromEulerDegrees(0, 0, 180))
    )
    this.angleOfEntry = getIntersectionAngle(direction, mirrorPlaneDirection)
    const rayLength = onHit?.(this)

    if (rayLength) this.createOrUpdateRay(rayLength)

    return true
  }

  public darken() {
    this.rayActive = false
    Transform.deleteFrom(this.tmp)
    Transform.deleteFrom(this.rayEntity)
  }
}
