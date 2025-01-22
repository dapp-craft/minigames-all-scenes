import {
  ColliderLayer,
  engine,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MeshCollider,
  MeshRenderer,
  pointerEventsSystem,
  Transform,
  TransformType,
  VisibilityComponent
} from '@dcl/sdk/ecs'
import { Color4, Quaternion, Vector3 } from '@dcl/sdk/math'
import { mirrors, testRay } from '.'
import { syncGameProgress } from '..'

export class Mirror {
  private state: State = State.inactive
  public rayEntity: Entity = engine.addEntity()
  public mirrorEntity: Entity = engine.addEntity()
  public isActive: boolean = false
  public mirrorTransform: TransformType
  public isHit: boolean = false
  public rayTransform: TransformType | null = null
  public angleOfEntry: number = 0

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
    console.log(`Ray::created ray@ in mirror ${this.mirrorEntity}`)
    MeshRenderer.setCylinder(this.rayEntity, 0.05, 0.05)
    if (this.rayTransform) Transform.createOrReplace(this.rayEntity, this.rayTransform)
    Material.setPbrMaterial(this.rayEntity, {
      albedoColor: Color4.Yellow(),
      metallic: 0,
      roughness: 1
    })
    VisibilityComponent.createOrReplace(this.rayEntity, { visible: this.isHit })
  }

  public calculateAllRays(mirrors: Mirror[]) {
    if (this.isActive) updateMirrorData(mirrors, this)
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
  const isOnLine = Vector3.length(crossProduct) < tolerance
  // if (!isOnLine) return false
  return isOnLine
  // const dotProduct = Vector3.dot(lineDir, pointToLineStart)
  // return dotProduct >= 0
}

const getRayDirection = (rotation: Quaternion): Vector3 => {
  const localDirection = Vector3.Up()
  return Vector3.rotate(localDirection, Quaternion.multiply(rotation, Quaternion.fromEulerDegrees(0, 0, 45)))
}

const getPoinOnRay = (rayPosition: Vector3, direction: Vector3, distance: number): Vector3 => {
  return Vector3.add(rayPosition, Vector3.scale(direction, distance))
}

const updateMirrorData = (mirrors: Mirror[], sourceMirror: Mirror) => {
  const sourceIdx = mirrors.indexOf(sourceMirror)
  const mFromClick = mirrors.slice(sourceIdx)
  mFromClick.forEach((m) => {
    if (m.isHit) {
      m.isHit = false
      engine.removeEntity(m.rayEntity)
    }
  })

  mirrors.forEach((targetMirror, idx) => {
    const middlePoint = Vector3.lerp(sourceMirror.mirrorTransform.position, targetMirror.mirrorTransform.position, 0.5)
    const rayTransform: TransformType = {
      position: middlePoint,
      rotation: sourceMirror.mirrorTransform.rotation,
      scale: {
        x: 1,
        y: Vector3.distance(sourceMirror.mirrorTransform.position, targetMirror.mirrorTransform.position),
        z: 1
      }
    }

    const rayDirection1 = getRayDirection(sourceMirror.mirrorTransform.rotation)
    const rayDirection2 = getRayDirection(
      Quaternion.multiply(sourceMirror.mirrorTransform.rotation, Quaternion.fromEulerDegrees(0, 0, -90))
    )

    const point45 = getPoinOnRay(sourceMirror.mirrorTransform.position, rayDirection1, 0.5)
    const point135 = getPoinOnRay(sourceMirror.mirrorTransform.position, rayDirection2, 0.5)

    const isPoint45 = isPointOnMirror(
      sourceMirror.mirrorTransform.position,
      point45,
      targetMirror.mirrorTransform.position
    )
    const isPoint135 = isPointOnMirror(
      sourceMirror.mirrorTransform.position,
      point135,
      targetMirror.mirrorTransform.position
    )
    const isPoint = isPoint45 || isPoint135
    if (isPoint45) {
      rayTransform.rotation = Quaternion.multiply(rayTransform.rotation, Quaternion.fromEulerDegrees(0, 0, 45))
    } else if (isPoint135) {
      rayTransform.rotation = Quaternion.multiply(rayTransform.rotation, Quaternion.fromEulerDegrees(0, 0, -45))
    }
    console.log('isPoint :>> ', isPoint)

    if (isPoint && !targetMirror.isHit) {
      targetMirror.isHit = true
      if (targetMirror.isHit && !targetMirror.rayTransform) targetMirror.rayTransform = rayTransform
      targetMirror.createOrUpdateRay()
      return
    }
  })
}

function calculateAngleWithMirror(
  vectorStartPoint: Vector3,
  vectorEndPoint: Vector3,
  mirrorCenter: Vector3,
  tolerance = 0.1
): number | null {
  const rayDirection = Vector3.subtract(vectorEndPoint, vectorStartPoint)
  const rayDirectionNormalized = Vector3.normalize(rayDirection)

  const vectorToMirror = Vector3.subtract(mirrorCenter, vectorStartPoint)
  const vectorToMirrorNormalized = Vector3.normalize(vectorToMirror)

  const dotProduct = Vector3.dot(rayDirectionNormalized, vectorToMirrorNormalized)
  const angle = Math.acos(dotProduct)

  const crossProduct = Vector3.cross(rayDirection, vectorToMirror)
  const distance = Vector3.length(crossProduct) / Vector3.length(rayDirection)

  if (distance < tolerance) {
    return angle * (180 / Math.PI)
  }

  return null
}

const t = engine.addEntity()
