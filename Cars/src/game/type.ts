export type Cell = {
  x: number
  y: number
}

export enum CarDirection {
  up, down, left, right
}


export type CarType = {
  position: Cell
  direction: CarDirection
  length: number
  inGame: boolean
  isMain: boolean
}