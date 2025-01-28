import { InputAction, pointerEventsSystem, TransformType } from '@dcl/sdk/ecs'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { Mirror } from './Mirror'
import { Laser } from './Laser'
import { syncGameProgress } from '..'

export const mirrors: Mirror[] = []
export let laser: Laser

export interface LightSource {
  getRay(): { origin: Vector3; direction: Vector3 }
}

export async function initGame() {
  testMirrorTransforms.forEach((transform) => mirrors.push(new Mirror(transform)))
  laser = new Laser(testLaserTransform)
  mirrors.forEach((m) => addPointerEvent(m))
}

function addPointerEvent(mirror: Mirror) {
  pointerEventsSystem.onPointerDown(
    {
      entity: mirror.mirrorEntity,
      opts: { button: InputAction.IA_POINTER, hoverText: 'Interact' }
    },
    () => {
      mirror.rotateMirror()
      mirrors.forEach((m) => m.darken())
      function cast(s: LightSource): number | undefined {
        console.log('CAST:', s.getRay())
        let newSource = mirrors.find((m) => m.enlighten(s, cast))
        console.log('NEW SOURCE:', newSource)
        if (newSource) return Vector3.distance(s.getRay().origin, newSource.getRay().origin)
      }
      cast(laser)
      syncGameProgress(mirrors)
    }
  )
}

const testMirrorTransforms: TransformType[] = [
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

const testLaserTransform: TransformType = {
  position: { x: 10.9, y: 3.3, z: 1.1 },
  rotation: Quaternion.fromEulerDegrees(0, 0, 90),
  scale: {
    x: 1,
    y: 1.2,
    z: 1
  }
}
