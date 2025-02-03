import { TransformType } from '@dcl/sdk/ecs'
import { Quaternion } from '@dcl/sdk/math'

export const mirrorTransforms: TransformType[] = [
  {
    position: {
      x: 10.3,
      y: 3.3,
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
      x: 10.3,
      y: 5.1,
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
      x: 6,
      y: 5.05,
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
      x: 6,
      y: 2.9,
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
      x: 9,
      y: 2.9,
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
    rotation: Quaternion.fromEulerDegrees(0, 0, 0),
    scale: {
      x: 0.5,
      y: 0.04,
      z: 0.5
    }
  }
]

export const laserTransform: TransformType = {
  position: { x: 10.9, y: 3.3, z: 1.1 },
  rotation: Quaternion.fromEulerDegrees(0, 0, 90),
  scale: {
    x: 1,
    y: 1.2,
    z: 1
  }
}
