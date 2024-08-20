import {
  GltfContainer,
  InputAction,
  Material,
  MaterialTransparencyMode,
  MeshCollider,
  MeshRenderer,
  TextureFilterMode,
  TextureWrapMode,
  Transform,
  engine,
  pointerEventsSystem
} from '@dcl/sdk/ecs'
import { Board } from '../gameLogic/board'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { tileRowColumn, getTilePosition } from '../gameLogic/tileCalculation'
import { Tile } from '../components/definitions'
import { tileShape } from '../../resources/resources'
import { getImageUV } from '../gameLogic/image'

export function createTile(board: Board, number: number) {
  const tileSize = 3 / board.size

  const tile = engine.addEntity()

  Tile.create(tile, { number })

  Transform.create(tile, {
    position: Vector3.Zero(),
    scale: Vector3.fromArray(Array(3).fill(tileSize)),
    parent: board.mainEntity
  })

  // Create the tile model
  const tileModel = engine.addEntity()
  GltfContainer.create(tileModel, tileShape)
  Transform.create(tileModel, { parent: tile })

  // Image
  const image = engine.addEntity()
  Transform.create(image, {
    position: { x: 0, y: 0, z: -0.015 },
    parent: tileModel
  })
  MeshRenderer.setPlane(image, getImageUV(board.size, number))
  Material.createOrReplace(image, {
    material: {
      $case: 'pbr',
      pbr: {
        texture: {
          tex: {
            $case: 'texture',
            texture: { src: board.image, filterMode: TextureFilterMode.TFM_TRILINEAR }
          }
        },
        emissiveColor: Color4.White(),
        emissiveIntensity: 0.9,
        emissiveTexture: {
          tex: {
            $case: 'texture',
            texture: { src: board.image, filterMode: TextureFilterMode.TFM_TRILINEAR }
          }
        },
        roughness: 1.0,
        specularIntensity: 0,
        metallic: 0,
        transparencyMode: MaterialTransparencyMode.MTM_AUTO
      }
    }
  })

  // On pointer down
  pointerEventsSystem.onPointerDown(
    {
      entity: tileModel,
      opts: { button: InputAction.IA_POINTER, hoverText: number.toString() }
    },
    () => {
      board.moveTile(number)
    }
  )
}
