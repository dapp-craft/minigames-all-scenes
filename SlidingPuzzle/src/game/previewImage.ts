import {
  Animator,
  Billboard,
  EasingFunction,
  Entity,
  GltfContainer,
  InputAction,
  Material,
  MaterialTransparencyMode,
  MeshCollider,
  MeshRenderer,
  TextureFilterMode,
  Transform,
  TransformType,
  Tween,
  Vector3Type,
  VisibilityComponent,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Color4, Matrix, Quaternion, Vector3 } from '@dcl/sdk/math'
import { syncEntity } from '@dcl/sdk/network'
import { BOARD } from './gameObjects/board'

let previewImageEntity: Entity

export function initPreviewImage() {
  previewImageEntity = engine.addEntity()
  Transform.create(previewImageEntity, {
    position: Vector3.add(Transform.get(BOARD).position, Vector3.create(0, 0, 0.02)),
    scale: Vector3.create(3, 3, 3)
  })
  MeshRenderer.setPlane(previewImageEntity)
  VisibilityComponent.create(previewImageEntity, { visible: false })
  syncEntity(previewImageEntity, [Material.componentId, VisibilityComponent.componentId], 5000 + 100)
  console.log('initPreviewImage', Transform.get(BOARD).position)
}
export function showPreviewImage(image: string) {
  console.log('showPreviewImage', image)
  VisibilityComponent.createOrReplace(previewImageEntity, { visible: true })
  Material.createOrReplace(previewImageEntity, {
    material: {
      $case: 'pbr',
      pbr: {
        texture: {
          tex: {
            $case: 'texture',
            texture: { src: image, filterMode: TextureFilterMode.TFM_TRILINEAR }
          }
        },
        emissiveColor: Color4.White(),
        emissiveIntensity: 0.9,
        emissiveTexture: {
          tex: {
            $case: 'texture',
            texture: { src: image, filterMode: TextureFilterMode.TFM_TRILINEAR }
          }
        },
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0,
        transparencyMode: MaterialTransparencyMode.MTM_AUTO
      }
    }
  })
}

export function hidePreviewImage() {
  console.log('hidePreviewImage')
  VisibilityComponent.createOrReplace(previewImageEntity, { visible: false })
}
