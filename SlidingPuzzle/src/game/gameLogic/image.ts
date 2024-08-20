import { lvl1Image } from '../../resources/resources'
import { tileRowColumn } from './tileCalculation'

// Move to separate function to be able to fetch images from the internet if needed or add more logic
export function getImage(lvl: number) {
  if ((lvl = 1)) {
    return lvl1Image
  }

  return lvl1Image
}

export function getImageUV(boardSize: number, tileNumber: number): number[] {
  const { row, column } = tileRowColumn(boardSize, tileNumber)
  const uvOffset = 1 / boardSize
  const UV = [
    // North side (Front)
    uvOffset * (column), uvOffset * (boardSize - row - 1), 
    uvOffset * (column), uvOffset * (boardSize - row),
    uvOffset * (column + 1), uvOffset * (boardSize - row), 
    uvOffset * (column + 1), uvOffset * (boardSize - row- 1), 
    // South side (Back)
    uvOffset * (column + 1), uvOffset * (boardSize - row- 1), 
    uvOffset * (column + 1), uvOffset * (boardSize - row), 
    uvOffset * (column), uvOffset * (boardSize - row),
    uvOffset * (column), uvOffset * (boardSize - row - 1), 
  ]
  return UV
}
