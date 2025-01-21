import {
  ColliderLayer,
  engine,
  Entity,
  GltfContainer,
  InputAction,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  Transform,
  TransformType,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { mirrors } from '.'
import { syncGameProgress } from '..'

export class Mirror {
  private state: State = State.inactive
  public rayEntity: Entity = engine.addEntity()
  public mirrorEntity: Entity = engine.addEntity()
  public isActive: boolean = false
  public mirrorTransform: TransformType
  public isHit: boolean = false
  public rayTransform: TransformType | null = null

  constructor(transform: TransformType) {
    this.mirrorTransform = transform
    this.isHit = false
    this.createMirror()
    if (this.rayTransform) this.createOrUpdateRay()
  }

  public createMirror() {
    console.log(`Mirror::created in constructor@${this.mirrorEntity}`)
    MeshRenderer.setBox(this.mirrorEntity)
    if (Transform.has(this.mirrorEntity)) console.error(`BUG!!: flask transform anomaly at entity ${this.mirrorEntity}`)
    Transform.createOrReplace(this.mirrorEntity, JSON.parse(JSON.stringify(this.mirrorTransform)))
    MeshCollider.setBox(this.mirrorEntity, ColliderLayer.CL_POINTER)
    pointerEventsSystem.onPointerDown(
      {
        entity: this.mirrorEntity,
        opts: { button: InputAction.IA_POINTER, hoverText: 'Interact' }
      },
      () => this.rotateMirror()
    )
  }

  public rotateMirror() {
    this.isActive = true
    const mirrorTransform = Transform.getMutable(this.mirrorEntity)
    mirrorTransform.rotation = Quaternion.multiply(mirrorTransform.rotation, Quaternion.fromEulerDegrees(0, 0, 45))
    this.mirrorTransform = mirrorTransform
    this.calculateAllRays(mirrors)
    syncGameProgress(mirrors)
    this.isActive = false
  }

  public createOrUpdateRay() {
    console.log(`Ray::created@${this.rayEntity}`)
    MeshRenderer.setCylinder(this.rayEntity, 0.05, 0.05)
    if (this.rayTransform) Transform.createOrReplace(this.rayEntity, this.rayTransform)
    if (this.rayTransform) VisibilityComponent.createOrReplace(this.rayEntity, { visible: true })
  }

  public calculateAllRays(mirrors: Mirror[]) {
    const mirrorTransform = Transform.get(this.mirrorEntity)
    if (this.isActive) updateAllMirrorsData(mirrors, mirrorTransform)
  }
}

enum State {
  active,
  inactive,
  locked
}

function isPointOnMirror(
  vectorStartPoint: Vector3,
  vectorEndPoint: Vector3,
  mirrorCenter: Vector3,
  tolerance = 0.1
): boolean {
  const lineDir = Vector3.subtract(vectorStartPoint, vectorEndPoint)
  const pointToLineStart = Vector3.subtract(mirrorCenter, vectorStartPoint)
  const crossProduct = Vector3.cross(lineDir, pointToLineStart)
  return Vector3.length(crossProduct) < tolerance
}

const getRayDirection = (rotation: Quaternion): Vector3 => {
  const localDirection = Vector3.Up()
  return Vector3.rotate(localDirection, Quaternion.multiply(rotation, Quaternion.fromEulerDegrees(0, 0, 45)))
}

const getPoinOnRay = (rayPosition: Vector3, direction: Vector3, distance: number): Vector3 => {
  return Vector3.add(rayPosition, Vector3.scale(direction, distance))
}

const updateAllMirrorsData = (mirrors: Mirror[], mirrorTransform: TransformType) => {
  mirrors.forEach((targetMirror) => {
    targetMirror.isHit = false
    const middlePoint = Vector3.lerp(mirrorTransform.position, targetMirror.mirrorTransform.position, 0.5)
    const rayTransform: TransformType = {
      position: middlePoint,
      rotation: mirrorTransform.rotation,
      scale: { x: 1, y: Vector3.distance(mirrorTransform.position, targetMirror.mirrorTransform.position), z: 1 }
    }
    const rayDirection1 = getRayDirection(mirrorTransform.rotation)
    const rayDirection2 = getRayDirection(
      Quaternion.multiply(mirrorTransform.rotation, Quaternion.fromEulerDegrees(0, 0, -90))
    )

    const point45 = getPoinOnRay(mirrorTransform.position, rayDirection1, 0.5)
    const point135 = getPoinOnRay(mirrorTransform.position, rayDirection2, 0.5)

    const isPoint45 = isPointOnMirror(mirrorTransform.position, point45, targetMirror.mirrorTransform.position)
    const isPoint135 = isPointOnMirror(mirrorTransform.position, point135, targetMirror.mirrorTransform.position)
    const isPoint = isPoint45 || isPoint135
    if (isPoint45) {
      rayTransform.rotation = Quaternion.multiply(rayTransform.rotation, Quaternion.fromEulerDegrees(0, 0, 45))
    } else if (isPoint135) {
      rayTransform.rotation = Quaternion.multiply(rayTransform.rotation, Quaternion.fromEulerDegrees(0, 0, -45))
    }
    console.log('isPoint :>> ', isPoint)
    if (isPoint) targetMirror.isHit = isPoint
    if (isPoint && !targetMirror.rayTransform) targetMirror.rayTransform = rayTransform

    if (targetMirror.isHit) {
      targetMirror.createOrUpdateRay()
    } else {
      engine.removeEntity(targetMirror.rayEntity)
    }
  })
}
