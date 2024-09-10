const SEC_ = 1000
const MIN_ = 60 * SEC_

export const GAME_ID = 'e05b3729-9504-40e9-8a49-c2145e568d62'
export const SESSION_DURATION = 5 * MIN_

export const SYNC_ENTITY_OFFSET = 5000

export const MAX_IMAGES = 32
export const FLIP_DURATION = 0.5 * SEC_

export const DEBUG_MODE_UI = true

export const TILES_LEVEL: {[key: number]: number[]} = {
  1: [10, 11, 12, 13, 18, 19, 20, 21],
  2: [3, 4, 9, 10, 11, 12, 13, 14, 17, 18, 19, 20, 21, 22],
  3: [2, 3, 4, 5, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
  4: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 27, 28],
  5: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31]
}
