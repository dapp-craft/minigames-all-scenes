import { EASY_MODE } from '../../config'
import { lvl3x3Image, lvl4x4Image, lvl5x5Image, lvlAbstractPattern, lvlDCLLogo } from '../../resources/resources'
import { tileRowColumn } from './tileCalculation'

// Move to separate function to be able to fetch images from the internet if needed or add more logic
export function getImage(lvl: number) {
  if (EASY_MODE) return lvl3x3Image
  if (lvl == 1) return lvl3x3Image
  if (lvl == 2) return lvl4x4Image
  if (lvl == 3) return lvl5x5Image
  if (lvl == 4) return lvlDCLLogo
  if (lvl == 5) return lvlDCLLogo
  if (lvl == 6) return lvlDCLLogo
  if (lvl == 7) return lvlAbstractPattern
  if (lvl == 8) return lvlAbstractPattern
  if (lvl == 9) return lvlAbstractPattern
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
