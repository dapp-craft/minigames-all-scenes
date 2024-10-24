import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import {
  engine,
  Transform,
  MeshRenderer,
  Entity,
  MainCamera,
  VirtualCamera,
  Tween,
  TweenSequence,
  TweenLoop,
  EasingFunction,
  InputAction,
  inputSystem,
  PointerEventType,
  VisibilityComponent,
  TextShape,
  TransformType,
  PBVirtualCamera,
  InputModifier
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'

let camera: Entity
let cameraviewPoint: Entity

export function init() {
  camera = engine.addEntity()
  cameraviewPoint = engine.addEntity()
  Transform.create(camera, {
    position: Vector3.create(8, 4.4, 7.3),
    rotation: Quaternion.fromEulerDegrees(40, 180, 0)
  })
  Transform.create(cameraviewPoint, {position: Vector3.create(8, 3.7, 1)})
  //   MeshRenderer.setBox(camera)
  VirtualCamera.create(camera, {
    defaultTransition: { transitionMode: VirtualCamera.Transition.Speed(20) },
    lookAtEntity: cameraviewPoint
  })
}

export function enableCamera() {
  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (!mainCamera) return
  mainCamera.virtualCameraEntity = camera
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: {
      $case: 'standard',
      standard: {
        disableAll: true,
      },
    },
  })
}

export function disableCamera() {
  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (!mainCamera) return
  mainCamera.virtualCameraEntity = undefined
  InputModifier.createOrReplace(engine.PlayerEntity, {
    mode: {
      $case: 'standard',
      standard: {
        disableAll: false,
      },
    },
  })
}
