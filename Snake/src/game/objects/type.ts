import { Entity } from '@dcl/sdk/ecs'

export type Position = {
  x: number
  y: number
}

export enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

export const MoveDelta: Record<Direction, { x: number; y: number }> = {
  [Direction.UP]: { x: 0, y: 1 },
  [Direction.DOWN]: { x: 0, y: -1 },
  [Direction.LEFT]: { x: -1, y: 0 },
  [Direction.RIGHT]: { x: 1, y: 0 }
}

export interface Drawable {
  entity: Entity
  terminate(): void
}

export interface SnakePart extends Drawable {
  next: SnakePart | undefined
  prev: SnakePart | undefined
  position: Position
  move(): void
  entity: Entity
}
