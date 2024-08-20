import { Vector3 } from '@dcl/sdk/math'

/**
 * get the row and column of the tile in the board
 * @param boardSize - Size of the board
 * @param tileNumber - Number of the tile in the board starting from 1
 * @returns - return the row and column of the tile in the board, starting from 0
 */
export function tileRowColumn(boardSize: number, tileNumber: number): { row: number; column: number } {
  tileNumber -= 1
  return { row: Math.floor(tileNumber / boardSize), column: tileNumber % boardSize }
}

/**
 * get the position of the tile in the board
 * @param boardSize - Size of the board
 * @param row - row of the tile in the board
 * @param column - column of the tile in the board
 * @returns - return the position of the tile in the board
 */
export function getTilePosition(boardSize: number, row: number, column: number): Vector3 {
  const centerOffset = boardSize % 2 === 0 ? 0.5 : 0
  const x = ((column - Math.floor(boardSize / 2) + centerOffset) * 3) / boardSize
  const y = ((Math.floor(boardSize / 2) - row - centerOffset) * 3) / boardSize
  return Vector3.create(x, y, 0)
}
