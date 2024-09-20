import { BOARD_SIZE } from '../config'
import { CarDirection, CarType } from './type'

const levels: Record<number, string> = {
  1: `0AAABC
      000DBC
      **0DBC
      00GFEE
      00GF00
      HH00II`
}

export function getLevel(level: number) {
  if (!levels[level]) throw new Error(`Level ${level} not found`)
  const levelData = levels[level]

  const ret: {
    cars: CarType[]
    mainCar: CarType | undefined
  } = {
    mainCar: undefined,
    cars: []
  }

  const parsedCar: string[] = []
  const rows = levelData.replace(/ /g, '').split('\n').reverse()

  const getDirection = (row: number, column: number) => {
    if (row > 0 && rows[row - 1][column] == rows[row][column]) return CarDirection.up
    if (row < BOARD_SIZE - 1 && rows[row + 1][column] == rows[row][column]) return CarDirection.down
    if (column > 0 && rows[row][column - 1] == rows[row][column]) return CarDirection.right
    if (column < BOARD_SIZE - 1 && rows[row][column + 1] == rows[row][column]) return CarDirection.left
    return CarDirection.right
  }
  
  const getLength = (row: number, column: number, direction: CarDirection, carSymbol: string) => {
    let length = 1
    const xD = direction == CarDirection.left ? 1 : direction == CarDirection.right ? -1 : 0
    const yD = direction == CarDirection.up ? -1 : direction == CarDirection.down ? 1 : 0
    while (true) {
      if (row + yD * length < 0 || row + yD * length >= BOARD_SIZE) break
      if (column + xD * length < 0 || column + xD * length >= BOARD_SIZE) break
      if (rows[row + yD * length][column + xD * length] != carSymbol) break
      length++

    }
    return length
  }

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let column = 0; column < BOARD_SIZE; column++) {
      const cell = rows[row][column]
      if (cell == '0') continue
      if (parsedCar.indexOf(cell) != -1) continue
      parsedCar.push(cell)
      const isMainCar = cell == '*'
      const carPos = { x: column, y: row }
      const carDirection = getDirection(row, column)
      const carLength = getLength(row, column, carDirection, cell)
      if (isMainCar) {
        ret.mainCar = {
          position: carPos,
          direction: carDirection,
          length: carLength,
          inGame: true,
          isMain: true
        }
      } else {
        ret.cars.push({
          position: carPos,
          direction: carDirection,
          length: carLength,
          inGame: true,
          isMain: false
        })
      }
    }
  }
  return ret
}
