import {
  engine,
  Transform,
  Entity,
  MainCamera,
  VirtualCamera,
  VisibilityComponent,
  TransformType,
  InputModifier
} from '@dcl/sdk/ecs'
import { Vector3, Quaternion, Color4 } from '@dcl/sdk/math'
import { log } from './utils'

export let cameraEntity: Entity

export function initCamera() {
  cameraEntity = SpawnVirtualCamera({
    position: Vector3.create(8, 3.5, 8),
    rotation: Quaternion.fromEulerDegrees(0, 180, 0)
  })

  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  if (!mainCamera) return
  mainCamera.virtualCameraEntity = undefined
}

function SpawnVirtualCamera(transformProps: Partial<TransformType>): Entity {
  const virtualCameraEntity = engine.addEntity()
  Transform.create(virtualCameraEntity, transformProps)
  VirtualCamera.create(virtualCameraEntity, { defaultTransition: { transitionMode: VirtualCamera.Transition.Time(2) } })
  VisibilityComponent.create(virtualCameraEntity, { visible: true })

  return virtualCameraEntity
}

export function activateCamera() {
  log('Start', activateCamera)
  log('ToggleCharacterInput', activateCamera)
  ToggleCharacterInput(false)

  log('MainCamera', activateCamera)
  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  log('MainCanera Entity: ' + mainCamera, activateCamera)
  if (!mainCamera) return

  mainCamera.virtualCameraEntity = cameraEntity
  log('Finish', activateCamera)
}

export function deactivateCamera() {
  log('Start', deactivateCamera)
  log('ToggleCharacterInput', deactivateCamera)
  ToggleCharacterInput(true)

  log('MainCamera', activateCamera)
  const mainCamera = MainCamera.getMutableOrNull(engine.CameraEntity)
  log('MainCanera Entity: ' + mainCamera, activateCamera)
  if (!mainCamera) return

  mainCamera.virtualCameraEntity = undefined
  log('Finish', activateCamera)
}

function ToggleCharacterInput(enabled: boolean) {
  InputModifier.createOrReplace(engine.PlayerEntity).mode = {
    $case: 'standard',
    standard: {
      disableWalk: !enabled,
      disableRun: !enabled,
      disableJog: !enabled
    }
  }
}
