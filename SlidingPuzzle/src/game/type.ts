export type Position = {
  x: number
  y: number
}

export type TileType = {
  position: Position
  index: number
  inGame: boolean
  image: string
  boardSize: number
}
