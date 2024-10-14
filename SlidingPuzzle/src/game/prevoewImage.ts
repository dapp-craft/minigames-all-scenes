// import {
//   Animator,
//   Billboard,
//   EasingFunction,
//   Entity,
//   GltfContainer,
//   InputAction,
//   Material,
//   MaterialTransparencyMode,
//   MeshCollider,
//   MeshRenderer,
//   TextureFilterMode,
//   Transform,
//   TransformType,
//   Tween,
//   Vector3Type,
//   VisibilityComponent,
//   engine,
//   pointerEventsSystem
// } from '@dcl/sdk/ecs'
// import { Color4, Matrix, Quaternion, Vector3 } from '@dcl/sdk/math'
// import { syncEntity } from '@dcl/sdk/network'
// import { BOARD, BOARD_TRANSFORM } from './gameObjects/board'

// const PREVIEW_IMAGE_TRANSFORM = BOARD_TRANSFORM
// PREVIEW_IMAGE_TRANSFORM.position.z -= 0.1

// const previewImageEntity = engine.addEntity()
// Transform.create(previewImageEntity, PREVIEW_IMAGE_TRANSFORM)
// MeshRenderer.setPlane(previewImageEntity)
// syncEntity(previewImageEntity, [Material.componentId, VisibilityComponent.componentId], 5000 + 100)

// export function showPreviewImage(image: string) {
//   VisibilityComponent.createOrReplace(this.imageEntity, { visible: true })
//   Material.createOrReplace(this.imageEntity, {
//     material: {
//       $case: 'pbr',
//       pbr: {
//         texture: {
//           tex: {
//             $case: 'texture',
//             texture: { src: image, filterMode: TextureFilterMode.TFM_TRILINEAR }
//           }
//         },
//         emissiveColor: Color4.White(),
//         emissiveIntensity: 0.9,
//         emissiveTexture: {
//           tex: {
//             $case: 'texture',
//             texture: { src: image, filterMode: TextureFilterMode.TFM_TRILINEAR }
//           }
//         },
//         roughness: 1.0,
//         specularIntensity: 0,
//         metallic: 0,
//         transparencyMode: MaterialTransparencyMode.MTM_AUTO
//       }
//     }
//   })
// }

// export function hidePreviewImage() {
//   VisibilityComponent.createOrReplace(this.imageEntity, { visible: false })
// }
