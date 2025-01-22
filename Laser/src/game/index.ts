import { engine, GltfContainer, Material, MeshRenderer, Transform, TransformType } from '@dcl/sdk/ecs'
import { Color4, Quaternion } from '@dcl/sdk/math'
import { Mirror } from './Mirror'

export const mirrors: Mirror[] = []

export async function initGame() {
  setupTestMirrors(testMirrorTransforms)
  setupTestRay()
}

function setupTestMirrors(transforms: TransformType[]) {
  transforms.forEach((transform) => {
    const mirror = new Mirror(transform)
    mirrors.push(mirror)
  })
  mirrors[0].angleOfEntry = 90
}

export const testRay = engine.addEntity()

function setupTestRay() {
  MeshRenderer.setCylinder(testRay, 0.05, 0.05)
  Transform.createOrReplace(testRay, {
    position: { x: 10.9, y: 3.3, z: 1.1 },
    rotation: Quaternion.fromEulerDegrees(0, 0, 90),
    scale: {
      x: 1,
      y: 1.2,
      z: 1
    }
  })
  Material.setPbrMaterial(testRay, {
    albedoColor: Color4.Yellow(),
    metallic: 0,
    roughness: 1
  })
}

const testMirrorTransforms: TransformType[] = [
  {
    position: {
      x: 10.3,
      y: 3.3,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 270),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  },
  {
    position: {
      x: 10.3,
      y: 5.1,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 45),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  },
  {
    position: {
      x: 6,
      y: 5.05,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, -45),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  },
  {
    position: {
      x: 6,
      y: 2.9,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 45),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  },
  {
    position: {
      x: 9,
      y: 2.9,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 45),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  },
  {
    position: {
      x: 9,
      y: 1.5,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  },
  {
    position: {
      x: 5.8,
      y: 1.5,
      z: 1.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, -45),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  }
]
