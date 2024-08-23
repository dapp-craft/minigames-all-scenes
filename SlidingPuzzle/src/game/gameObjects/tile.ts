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
// import { Board } from '../gameLogic/board'
import { Color4, Vector3 } from '@dcl/sdk/math'
import { tileRowColumn, getTilePosition } from '../gameLogic/tileCalculation'
import { Tile } from '../components/definitions'
import { tileShape } from '../../resources/resources'
import { getImageUV } from '../gameLogic/image'
import { syncEntity } from '@dcl/sdk/network'
import { tileEntityBaseId } from '../config'

// export function createTile(board: Board, number: number) {
//   const tileSize = 3 / board.size

//   const tile = engine.addEntity()

//   Tile.create(tile, { number })

//   Transform.create(tile, {
//     // Hack to avoid z-flickering
//     position: Vector3.create(0, 0, number * 0.001),
//     scale: Vector3.fromArray(Array(3).fill(tileSize)),
//     parent: board.mainEntity
//   })

//   // Create the tile model
//   const shape = engine.addEntity()
//   GltfContainer.create(shape, tileShape)
//   Transform.create(shape, { parent: tile })

//   // Image
//   const image = engine.addEntity()
//   Transform.create(image, {
//     position: { x: 0, y: 0, z: -0.015 },
//     parent: tile
//   })
//   MeshRenderer.setPlane(image, getImageUV(board.size, number))
//   Material.createOrReplace(image, {
//     material: {
//       $case: 'pbr',
//       pbr: {
//         texture: {
//           tex: {
//             $case: 'texture',
//             texture: { src: board.image, filterMode: TextureFilterMode.TFM_TRILINEAR }
//           }
//         },
//         emissiveColor: Color4.White(),
//         emissiveIntensity: 0.9,
//         emissiveTexture: {
//           tex: {
//             $case: 'texture',
//             texture: { src: board.image, filterMode: TextureFilterMode.TFM_TRILINEAR }
//           }
//         },
//         roughness: 1.0,
//         specularIntensity: 0,
//         metallic: 0,
//         transparencyMode: MaterialTransparencyMode.MTM_AUTO
//       }
//     }
//   })

//   // On pointer down
//   pointerEventsSystem.onPointerDown(
//     {
//       entity: shape,
//       opts: { button: InputAction.IA_POINTER, hoverText: number.toString() }
//     },
//     () => {
//       board.moveMultipleTiles(number)
//     }
//   )


//   console.log('Sync Entity')
//   console.log(tileEntityBaseId + number * 10 + 1)
//   console.log(tileEntityBaseId + number * 10 + 1)
//   console.log(tileEntityBaseId + number * 10 + 1)

//   syncEntity(tile, [Transform.componentId, Material.componentId, MeshRenderer.componentId], tileEntityBaseId + number * 10 + 1)
//   syncEntity(image, [Transform.componentId, Material.componentId, MeshRenderer.componentId], tileEntityBaseId + number * 10 + 2)
//   syncEntity(shape, [Transform.componentId, Material.componentId, MeshRenderer.componentId], tileEntityBaseId + number * 10 + 3)
// }
