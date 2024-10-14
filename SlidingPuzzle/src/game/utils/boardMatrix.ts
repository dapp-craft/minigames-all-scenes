import { Tile } from '../components'
import { getInGameTiles } from '../gameObjects/tile'

export function boardMatrix() {
  const tiles = getInGameTiles()
  const size = Tile.get(tiles[0]).boardSize
  tiles.forEach((tile) => {
    if (Tile.get(tile).boardSize !== size) throw new Error('All inGame tiles must have the same board size')
  })

  const matrix = Array.from({ length: size }, () => Array.from({ length: size }, () => -1))
  tiles.forEach((tile) => {
    const tileData = Tile.get(tile)
    matrix[tileData.position.y][tileData.position.x] = tileData.index
  })
  return matrix
}
