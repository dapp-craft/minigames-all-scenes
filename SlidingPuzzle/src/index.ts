// We define the empty imports so the auto-complete feature works as expected.
import {} from '@dcl/sdk/math'
import { GltfContainer, MeshRenderer, Transform, TransformType, engine } from '@dcl/sdk/ecs'
import { setupStaticModels } from './staticModels'
import { Board } from './game/gameLogic/board'

const BOARD_TRANSFORM: TransformType = {
  position: { x: 8, y: 2, z: 12 },
  scale: { x: 1, y: 1, z: 1 },
  rotation: { x: 0, y: 0, z: 0, w: 1 }
}

export function main() {
  // Setup Environment models
  setupStaticModels()

  new Board(BOARD_TRANSFORM, 5, 1)
}