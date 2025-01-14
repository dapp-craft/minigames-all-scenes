export const GAME_ID = '67ad1757-6796-4817-ac29-5bf1987d24f9'

// Game
/**
 * Number of rows and columns of the board
 */
export const BOARD_SIZE = 6
/**
 * Physical size of the board in meters
 */
export const BOARD_PHYSICAL_SIZE = 5.1968765259
export const CELL_SIZE_RELATIVE = 1 / BOARD_SIZE
export const CELL_SIZE_PHYSICAL = BOARD_PHYSICAL_SIZE / BOARD_SIZE

/**
 * Coefficient to set the offset of the collider
 * Offset = BOARD_PHYSICAL_SIZE * COLLIDER_OFFSET_COEFFICIENT
 */
export const COLLIDER_OFFSET_COEFFICIENT = -0.005


export const SYNC_ENTITY_ID = 5000


export const levels: Record<number, string> = {
  1: `00HHG0
      0JJFG0
      **CF00
      B0CEE0
      B0C0D0
      SSS0D0`,

  2: `00AABB
      000CCC
      **00ED
      III0ED
      00HGED
      00HGFF`,

  3: `ABBB0D
      A00C0D
      **0C0D
      00GCEE
      00G0F0
      0HH0F0`,

  4: `AAB0JI
      00B0JI
      **B00I
      DCCFGG
      D00FHH
      0EEE00`,
  
  5: `00AA0B
      CCD00B
      **D00B
      00DG00
      FEEG00
      F0HHH0`
}

export const MAX_LEVEL = Object.keys(levels).length
