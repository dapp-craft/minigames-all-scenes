import { Entity, Material, MaterialTransparencyMode, MeshRenderer, TextureFilterMode } from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import { Tile } from '../components'
import { getImageUV } from './image'

/**
 * Update the tile image and UV coordinates
 * @param entity - Entity to update the tile image
 */
export function updateTileImage(entity: Entity) {
  const image = Tile.get(entity).image
  const size = Tile.get(entity).boardSize
  const index = Tile.get(entity).index

  // @ts-ignore
  MeshRenderer.getMutable(entity).mesh.plane.uvs = getImageUV(size, index)
  Material.createOrReplace(entity, {
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
