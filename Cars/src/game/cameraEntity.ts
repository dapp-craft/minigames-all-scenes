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
  PBVirtualCamera
} from '@dcl/sdk/ecs'
import * as utils from '@dcl-sdk/utils'
import { BOARD } from './objects/board'

let camera: Entity

export function init() {
  camera = engine.addEntity()

  Transform.create(camera, {
    position: Vector3.create(8, 5, 8),
    rotation: Quaternion.fromEulerDegrees(40, 180, 0)
  })
  //   MeshRenderer.setBox(camera)
  VirtualCamera.create(camera, {
    defaultTransition: { transitionMode: VirtualCamera.Transition.Speed(20) },
    lookAtEntity: BOARD
  })
}

export function enableCamera() {
  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (!mainCamera) return
  mainCamera.virtualCameraEntity = camera
}

export function disableCamera() {
  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (!mainCamera) return
  mainCamera.virtualCameraEntity = undefined
}
