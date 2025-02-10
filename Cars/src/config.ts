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
      F0HHH0`,

  6: `0GOOBB
      0G0PGG
      **0PWY
      RLLLWY
      R0D0WT
      R0D00T`,
      
  7: `GGO0BB
      PPO00W
      R**00W
      RLLL0W
      R00YDD
      EE0YMM`,

  8: `WGGR00
      W00R00
      W**R00
      00OBBB
      00O00L
      00JJJL`,

  9: `GOO00W
      G0R00W
      **R00W
      00RBBB
      0000F0
      TTT0F0`,
  10: `GGOOB0
       00P0BW
       0EP**W
       RE0DDW
       R00GNN
       RYYGMM`,

  11: `GGO000
       00O0BB
       PN**GY
       PNVVGY
       00C0XX
       AAC000`,

  12: `0GGOO0
       BBPPWR
       LV**WR
       LVNFWR
       LVNFDD
       0AAXX0`,

  13: `GGOOBW
       P0YYBW
       PGR**W
       0GRLLL
       00R000
       II0000`,

  14: `GWWW00
       G0OOBB
       **P000
       EEPR00
       LLLRDY
       ZZZRDY`,
       
  15: `GGOW00
       BBOW00
       R**W00
       RLLL00
       RPP000
       VVV000`
}

export const MAX_LEVEL = Object.keys(levels).length
