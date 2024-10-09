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
import { MAX_BOARD_SIZE } from '../config'
import { createTile } from './gameObjects/tile'

export function initGame() {
  initTiles()
}

function initTiles() {
  for (let i = 0; i < MAX_BOARD_SIZE * MAX_BOARD_SIZE; i++) {
    createTile(i)
  }
}
