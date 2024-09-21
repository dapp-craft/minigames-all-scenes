export const GAME_ID = '67ad1757-6796-4817-ac29-5bf1987d24f9'


// Game
/**
 * Number of rows and columns of the board
 */
export const BOARD_SIZE = 6
/**
 * Physical size of the board in meters
 */
export const BOARD_PHYSICAL_SIZE = 6
export const CELL_SIZE_RELATIVE = 1 / BOARD_SIZE
export const CELL_SIZE_PHYSICAL = BOARD_PHYSICAL_SIZE / BOARD_SIZE

/**
 * Coefficient to set the offset of the collider
 * Offset = BOARD_PHYSICAL_SIZE * COLLIDER_OFFSET_COEFFICIENT
 */
export const COLLIDER_OFFSET_COEFFICIENT = -0.005


export const SYNC_ENTITY_ID = 5000
