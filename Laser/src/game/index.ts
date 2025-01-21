import { engine, GltfContainer, MeshRenderer, Transform, TransformType } from '@dcl/sdk/ecs'
import { Quaternion } from '@dcl/sdk/math'
import { Mirror } from './Mirror'

export const mirrors: Mirror[] = []

export async function initGame() {
  setupTestBoard()
  setupTestMirrors(testMirrorTransforms)
  setupTestRay()
}

function setupTestBoard() {
  const board = engine.addEntity()

  GltfContainer.create(board, {
    src: 'models/board.glb'
  })

  Transform.create(board, {
    position: { x: 14, y: 3.2, z: 1.8 },
    scale: { x: 0.5, y: 0.5, z: 0.5 },
    rotation: Quaternion.fromEulerDegrees(0, 90, 90)
  })
}

function setupTestMirrors(transforms: TransformType[]) {
  transforms.forEach((transform) => {
    const mirror = new Mirror(transform)
    mirrors.push(mirror)
  })
}

export const testRay = engine.addEntity()

function setupTestRay() {
  MeshRenderer.setCylinder(testRay, 0.05, 0.05)
  Transform.createOrReplace(testRay, {
    position: { x: 14.9, y: 2.2, z: 2.1 },
    rotation: Quaternion.fromEulerDegrees(0, 0, 90),
    scale: {
      x: 1,
      y: 1.2,
      z: 1
    }
  })
}

const testMirrorTransforms: TransformType[] = [
  {
    position: {
      x: 14.3,
      y: 2.2,
      z: 2.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 270),
    scale: {
      x: 0.5,
      y: 0.025,
      z: 0.5
    }
  },
  {
    position: {
      x: 14.3,
      y: 4.2,
      z: 2.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 45),
    scale: {
      x: 0.5,
      y: 0.025,
      z: 0.5
    }
  },
  {
    position: {
      x: 10,
      y: 4.15,
      z: 2.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: {
      x: 0.5,
      y: 0.025,
      z: 0.5
    }
  },
  {
    position: {
      x: 10,
      y: 1.9,
      z: 2.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 45),
    scale: {
      x: 0.5,
      y: 0.025,
      z: 0.5
    }
  },
  {
    position: {
      x: 12.6,
      y: 1.9,
      z: 2.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 45),
    scale: {
      x: 0.5,
      y: 0.025,
      z: 0.5
    }
  },
  {
    position: {
      x: 12.6,
      y: 0.5,
      z: 2.1
    },
    rotation: Quaternion.fromEulerDegrees(0, 0, 90),
    scale: {
      x: 0.5,
      y: 0.025,
      z: 0.5
    }
  }
]
