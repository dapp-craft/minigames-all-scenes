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
import { mainEntityId } from './config'


export class SolidImage {
  private imageEntity: Entity = engine.addEntity()

  constructor(parent: Entity) {
    Transform.create(this.imageEntity, {
      parent: parent,
      position: Vector3.create(0, 0, -0.1),
      scale: Vector3.create(3, 3, 3)
    })
    MeshRenderer.setPlane(this.imageEntity)
    VisibilityComponent.createOrReplace(this.imageEntity, {visible: false})

    syncEntity(this.imageEntity, [Material.componentId, VisibilityComponent.componentId], mainEntityId + 2)
  }

  public show(image: string) {
    VisibilityComponent.createOrReplace(this.imageEntity, {visible: true})
    Material.createOrReplace(this.imageEntity, {
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

  public hide() {
    VisibilityComponent.createOrReplace(this.imageEntity, {visible: false})
  }
}
