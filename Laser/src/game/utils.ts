import { Quaternion, Vector3 } from '@dcl/sdk/math'

export function getVectorDirection(rotation: Quaternion): Vector3 {
  const localDirection = Vector3.Up()
  return Vector3.rotate(localDirection, Quaternion.normalize(rotation))
}

export function getPoinOnVector(vectorStart: Vector3, direction: Vector3, distance: number): Vector3 {
  return Vector3.add(vectorStart, Vector3.scale(direction, distance))
}

export function checkRayIntersection(
  sourcePoint: Vector3,
  directionPoint: Vector3,
  planeCenter: Vector3,
  tolerance = 0.1
): boolean {
  if (Vector3.equals(sourcePoint, directionPoint)) return false

  const lineDir = Vector3.normalize(Vector3.subtract(directionPoint, sourcePoint))
  const pointToStartDir = Vector3.subtract(planeCenter, sourcePoint)

  const crossProduct = Vector3.cross(lineDir, pointToStartDir)
  const isOnLine = Vector3.length(crossProduct) < tolerance

  if (!isOnLine) return false
  const dotProduct = Vector3.dot(lineDir, Vector3.normalize(pointToStartDir))

  return dotProduct > 0
}

export function getIntersectionAngle(vectorSource: Vector3, vectorTarget: Vector3): number {
  const dotProduct = Vector3.dot(vectorSource, vectorTarget)
  const vectorLength = Vector3.length(vectorSource)
  const segmentLength = Vector3.length(vectorTarget)
  const cosTheta = dotProduct / (vectorLength * segmentLength)
  const angleRadians = Math.acos(Math.max(-1, Math.min(1, cosTheta)))
  const angleDegrees = angleRadians * (180 / Math.PI)

  const crossProduct = Vector3.cross(vectorSource, vectorTarget)

  if (crossProduct.z < 0) {
    return Math.round(360 - angleDegrees)
  }

  return Math.round(angleDegrees)
}
