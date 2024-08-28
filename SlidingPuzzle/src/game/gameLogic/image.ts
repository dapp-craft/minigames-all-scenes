import { EASY_MODE } from '../../config'
import { level1Image, level2Image, level3Image, lvl3x3Image } from '../../resources/resources'
import { tileRowColumn } from './tileCalculation'

// Move to separate function to be able to fetch images from the internet if needed or add more logic
export function getImage(lvl: number) {
  if (EASY_MODE) return lvl3x3Image
  if (lvl == 1) return level1Image
  if (lvl == 2) return level1Image
  if (lvl == 3) return level1Image
  if (lvl == 4) return level2Image
  if (lvl == 5) return level2Image
  if (lvl == 6) return level2Image
  if (lvl == 7) return level3Image
  if (lvl == 8) return level3Image
  if (lvl == 9) return level3Image
  return lvl3x3Image
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
